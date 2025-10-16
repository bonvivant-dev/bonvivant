'use client'

import Image from 'next/image'
import { overlay } from 'overlay-kit'
import { useState, useEffect, useCallback } from 'react'
import { FcDocument } from 'react-icons/fc'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'

// Custom Swiper styles
const swiperStyles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

import { PDFPreviewModal } from '@/features/magazine/components'
import {
  convertPdfToImages,
  convertPdfFromStorage,
} from '@/features/magazine/lib'
import {
  Magazine,
  MagazinesByCategory,
  PDFPageImage,
} from '@/features/magazine/types'
import { Header, LoadingOverlay } from '@/shared/components'
import { thumbnail } from '@/shared/utils'

export default function MagazinesPage() {
  const [magazinesByCategory, setMagazinesByCategory] =
    useState<MagazinesByCategory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const fetchMagazines = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/magazines/by-categories')

      if (!response.ok) {
        throw new Error('Failed to fetch magazines')
      }

      const data: MagazinesByCategory = await response.json()
      setMagazinesByCategory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMagazines()
  }, [])

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
          formData.append(
            'category_ids',
            JSON.stringify(magazineFormData.category_ids),
          )
          formData.append('season_id', magazineFormData.season_id)
          // Add cover image URL if provided
          if (magazineFormData.cover_image_url) {
            formData.append('cover_image_url', magazineFormData.cover_image_url)
          }
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

        await fetchMagazines()
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
        overlay.open(({ isOpen, close }) => (
          <PDFPreviewModal
            title={selectedFile?.name || 'PDF 미리보기'}
            pages={pages}
            isOpen={isOpen}
            onClose={() => {
              close()
              setSelectedFile(null)
            }}
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
        magazine.preview_images?.map(imagePath => {
          // 경로에서 파일명만 추출 (예: "images/preview/uuid/1.jpg" -> "1.jpg")
          const fileName = imagePath.split('/').pop() || ''
          const pageNumber = parseInt(fileName.replace('.jpg', ''))
          return pageNumber
        }) || []

      overlay.open(({ isOpen, close }) => (
        <PDFPreviewModal
          editMode={true}
          title={magazine.title || 'PDF 편집'}
          pages={pages}
          isOpen={isOpen}
          onClose={close}
          magazine={{
            id: magazine.id,
            title: magazine.title || '',
            summary: magazine.summary || '',
            introduction: magazine.introduction || '',
            category_ids: magazine.category_ids || [],
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
          onDelete={handleDelete}
        />
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 로딩 실패')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`${title}을 삭제할까요?`)) return

    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete magazine')
      }

      await fetchMagazines()
    } catch (err) {
      alert(`${title} 삭제에 실패했어요`)
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <>
      <style jsx global>
        {swiperStyles}
      </style>
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

            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
              <div className="flex items-center justify-between px-6 py-5">
                <h1 className="text-2xl leading-6 font-medium text-gray-900">
                  매거진 관리
                </h1>
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
            </div>

            <div className="mt-6 space-y-8">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">매거진을 불러오는 중...</p>
                </div>
              ) : !magazinesByCategory ? (
                <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
                  <p className="text-gray-500">
                    매거진 데이터를 불러올 수 없습니다.
                  </p>
                </div>
              ) : (
                <>
                  {/* Categories with Magazines */}
                  {magazinesByCategory.categories.map(category => (
                    <div
                      key={category.id}
                      className="bg-white rounded-lg shadow overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {category.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          총 {category.magazines.length}개
                        </p>
                      </div>

                      {category.magazines.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                          <p className="text-gray-400">
                            [{category.name}] 카테고리에 속한 매거진이 없어요.
                          </p>
                        </div>
                      ) : (
                        <div className="p-6">
                          <Swiper
                            spaceBetween={20}
                            slidesPerView={1}
                            breakpoints={{
                              640: { slidesPerView: 2 },
                              768: { slidesPerView: 3 },
                              1024: { slidesPerView: 4 },
                              1280: { slidesPerView: 5 },
                            }}
                            className="magazine-swiper"
                          >
                            {category.magazines.map(magazine => (
                              <SwiperSlide key={magazine.id}>
                                <div
                                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                                  onClick={() => handleEdit(magazine)}
                                >
                                  {magazine.cover_image && (
                                    <div className="aspect-[3/4] mb-3 ">
                                      <Image
                                        src={thumbnail(magazine.cover_image)}
                                        alt={magazine.title || 'Cover'}
                                        className="w-full h-full object-cover rounded-md shadow-sm"
                                        width={150}
                                        height={200}
                                      />
                                    </div>
                                  )}
                                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                    {magazine.title || '제목 없음'}
                                  </h3>
                                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                    {magazine.summary || '요약 없음'}
                                  </p>
                                  <p className="text-xs text-gray-400 mb-3">
                                    {new Date(
                                      magazine.created_at,
                                    ).toLocaleDateString('ko-KR')}
                                  </p>
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Uncategorized Magazines */}
                  {magazinesByCategory.uncategorized.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                          카테고리 없음
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          총 {magazinesByCategory.uncategorized.length}개의
                          매거진
                        </p>
                      </div>

                      <div className="p-6">
                        <Swiper
                          spaceBetween={20}
                          slidesPerView={1}
                          breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 5 },
                          }}
                          className="magazine-swiper"
                        >
                          {magazinesByCategory.uncategorized.map(magazine => (
                            <SwiperSlide key={magazine.id}>
                              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                {magazine.cover_image && (
                                  <div className="aspect-[3/4] mb-3">
                                    <Image
                                      src={thumbnail(magazine.cover_image)}
                                      alt={magazine.title || 'Cover'}
                                      className="w-full h-full object-cover rounded-md shadow-sm"
                                      width={150}
                                      height={200}
                                    />
                                  </div>
                                )}
                                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                  {magazine.title || '제목 없음'}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                  {magazine.summary || '요약 없음'}
                                </p>
                                <p className="text-xs text-gray-400 mb-3">
                                  {new Date(
                                    magazine.created_at,
                                  ).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {magazinesByCategory.categories.length === 0 &&
                    magazinesByCategory.uncategorized.length === 0 && (
                      <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
                        <p className="text-gray-500">
                          등록된 매거진이 없습니다.
                        </p>
                      </div>
                    )}
                </>
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
              ? 'PDF 업로드 중'
              : 'PDF 불러오는 중'
            : 'PDF 불러오는 중'
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
