'use client'

import Image from 'next/image'
import { overlay } from 'overlay-kit'
import { useState, useEffect, useCallback } from 'react'
import { FcDocument } from 'react-icons/fc'

import {
  Magazine,
  MagazineListResponse,
  convertPdfToImages,
  convertPdfFromStorage,
  PDFPageImage,
  PDFPreviewModal,
} from '@/features/magazine'
import { Header, LoadingOverlay } from '@/shared/components'

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const fetchMagazines = async (page = 1) => {
    try {
      setIsLoading(true)
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      const response = await fetch(`/api/magazines?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch magazines')
      }

      const data: MagazineListResponse = await response.json()
      setMagazines(data.magazines)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMagazines(currentPage)
  }, [currentPage])

  const handleConfirmUpload = useCallback(
    async (
      selectedPages: PDFPageImage[],
      file: File | null,
      magazineFormData?: any,
      editingMagazineId?: string,
    ) => {
      setError(null)

      try {
        const formData = new FormData()

        // 편집 모드일 때는 file이 없을 수 있음 (PDF는 변경하지 않는 경우)
        if (file) {
          formData.append('file', file)
        }

        // Add magazine metadata if provided
        if (magazineFormData) {
          formData.append('title', magazineFormData.title)
          formData.append('summary', magazineFormData.summary)
          formData.append('introduction', magazineFormData.introduction)
          formData.append('category_id', magazineFormData.category_id)
          formData.append('season_id', magazineFormData.season_id)
        }

        // 선택된 페이지들을 순서와 메타데이터와 함께 FormData에 추가
        const pageMetadata = selectedPages.map((page, index) => ({
          order: index,
          originalPageNumber: page.pageNumber,
          fileName: `${page.pageNumber}.jpg`,
        }))

        // 메타데이터 정보 추가
        formData.append('pageMetadata', JSON.stringify(pageMetadata))

        // 선택된 페이지들을 순서대로 추가 (원본 페이지 번호로 파일명 설정)
        selectedPages.forEach((page, index) => {
          formData.append(`image-${index}`, page.blob, `${page.pageNumber}.jpg`)
        })

        if (editingMagazineId) {
          const url = `/api/magazines/${editingMagazineId}`
          const method = 'PUT'
          const response = await fetch(url, {
            method,
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Update failed')
          }
        } else {
          const url = '/api/magazines/upload'
          const method = 'POST'
          const response = await fetch(url, {
            method,
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }
        }

        await fetchMagazines(1)
        setCurrentPage(1)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : editingMagazineId
              ? 'Update failed'
              : 'Upload failed',
        )
      } finally {
        setSelectedFile(null)
      }
    },
    [],
  )

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('PDF 파일만 업로드 가능합니다.')
      return
    }

    setError(null)
    setSelectedFile(file)
    setIsConverting(true)

    try {
      // PDF의 모든 페이지를 이미지로 변환
      await convertPdfToImages(file).then(pages => {
        setIsConverting(false)
        // openPreviewModal(pages)
        overlay.open(({ isOpen, close }) => (
          <PDFPreviewModal
            title={selectedFile?.name || 'PDF 미리보기'}
            pages={pages}
            isOpen={isOpen}
            onClose={close}
            onConfirm={async (selectedPages, formData) => {
              await handleConfirmUpload(selectedPages, file, formData)
            }}
          />
        ))
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 변환 실패')
    } finally {
      setIsConverting(false)
    }

    // 파일 입력 초기화
    event.target.value = ''
  }

  const handleEdit = async (magazine: Magazine) => {
    setError(null)
    setIsConverting(true)

    try {
      const pages = await convertPdfFromStorage(
        magazine.storage_key,
        `${magazine.storage_key}.pdf`,
      )

      // 현재 선택된 미리보기 이미지 순서 추출
      const selectedPages =
        magazine.preview_images?.map(imageName => {
          const pageNumber = parseInt(imageName.replace('.jpg', ''))
          return pageNumber
        }) || []

      overlay.open(({ isOpen, close }) => (
        <PDFPreviewModal
          title={magazine.title || 'PDF 편집'}
          pages={pages}
          isOpen={isOpen}
          onClose={close}
          editMode={true}
          magazineId={magazine.id}
          initialData={{
            title: magazine.title || '',
            summary: magazine.summary || '',
            introduction: magazine.introduction || '',
            category_id: magazine.category_id || '',
            season_id: magazine.season_id || '',
            selectedPages,
          }}
          onConfirm={async (selectedPages, formData) => {
            await handleConfirmUpload(
              selectedPages,
              null,
              formData,
              magazine.id,
            )
          }}
        />
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 로딩 실패')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 매거진을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete magazine')
      }

      await fetchMagazines(currentPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <>
      <Header title="매거진 관리" />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      오류가 발생했습니다
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Magazines List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
              {/* flex div */}
              <div className="flex items-start justify-between px-4 py-5">
                <div>
                  <h1 className="text-2xl leading-6 font-medium text-gray-900">
                    매거진 목록
                  </h1>
                  {!isLoading && magazines.length > 0 && (
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      총 {magazines.length}개
                    </p>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                    PDF 업로드
                  </span>
                </label>
              </div>

              {isLoading ? (
                <div className="px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">로딩 중...</p>
                </div>
              ) : magazines.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500">등록된 매거진이 없습니다.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {magazines.map(magazine => (
                    <li key={magazine.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            {magazine.cover_image && (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${magazine.storage_key}/${magazine.cover_image}`}
                                alt={magazine.title || 'Cover'}
                                className="w-20 h-25 object-cover rounded-md shadow-sm"
                                width={80}
                                height={100}
                              />
                            )}
                            <div className="flex flex-col justify-between space-x-4">
                              <div className="flex flex-col items-start">
                                <p className="text-lg font-medium text-gray-900">
                                  {magazine.title || '제목 없음'}
                                </p>
                              </div>
                              <div className="flex flex-col items-start">
                                <p className="text-sm text-gray-500">
                                  {magazine.summary || '요약 없음'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  생성일:{' '}
                                  {new Date(
                                    magazine.created_at,
                                  ).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(magazine)}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              편집
                            </button>
                            <button
                              onClick={() => handleDelete(magazine.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        총 <span className="font-medium">{totalPages}</span>{' '}
                        페이지 중{' '}
                        <span className="font-medium">{currentPage}</span>{' '}
                        페이지
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <LoadingOverlay
        isOpen={isConverting}
        icon={<FcDocument size={40} />}
        title={
          isConverting
            ? selectedFile?.name
              ? 'PDF 변환 중'
              : 'PDF 로딩 중'
            : 'PDF 로딩 중'
        }
        message={
          isConverting
            ? selectedFile?.name
              ? `${selectedFile.name}을 이미지로 변환하고 있습니다...`
              : 'PDF를 불러오고 있습니다...'
            : 'PDF를 불러오고 있습니다...'
        }
      />
    </>
  )
}
