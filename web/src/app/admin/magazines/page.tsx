'use client'

import dayjs from 'dayjs'
import Image from 'next/image'
import { overlay } from 'overlay-kit'
import { useState, useEffect, useCallback, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
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

const MAGAZINE_ITEM_TYPE = 'magazine'

interface DragItem {
  index: number
  type: string
}

interface DraggableMagazineCardProps {
  magazine: Magazine
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
}

function DraggableMagazineCard({
  magazine,
  index,
  onMove,
}: DraggableMagazineCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: MAGAZINE_ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) {
        return
      }

      const hoverClientX = clientOffset.x - hoverBoundingRect.left

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return
      }

      onMove(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: MAGAZINE_ITEM_TYPE,
    item: () => {
      return { index, type: MAGAZINE_ITEM_TYPE }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
    >
      {magazine.cover_image && (
        <div className="aspect-[3/4] mb-3 relative">
          <Image
            src={thumbnail(magazine.cover_image)}
            alt={magazine.title || 'Cover'}
            className="w-full h-full object-cover rounded-md shadow-sm"
            width={150}
            height={200}
          />
          {/* Drag indicator */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded px-2 py-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6-12a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
            </svg>
          </div>
        </div>
      )}
      <div className="mb-2">
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
            magazine.is_purchasable
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {magazine.is_purchasable ? '판매중' : '판매 정보 필요'}
        </span>
      </div>
      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
        {magazine.title || '제목 없음'}
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        {dayjs(magazine.created_at).format('YYYY.MM.DD')}
      </p>
    </div>
  )
}

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
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  )
  const [tempMagazineOrder, setTempMagazineOrder] = useState<Magazine[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

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
          formData.append(
            'price',
            magazineFormData.price !== null
              ? magazineFormData.price.toString()
              : '',
          )
          formData.append(
            'is_purchasable',
            magazineFormData.is_purchasable.toString(),
          )
          formData.append('product_id', magazineFormData.product_id || '')
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
      const previewPageNumbers =
        magazine.preview_images?.map(imagePath => {
          // 경로에서 파일명만 추출 (예: "images/preview/uuid/1.jpg" -> "1.jpg")
          const fileName = imagePath.split('/').pop() || ''
          const pageNumber = parseInt(fileName.replace('.jpg', ''))
          return pageNumber
        }) || []

      overlay.open(({ isOpen, close }) => (
        <PDFPreviewModal
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
            previewPageNumbers,
            cover_image: magazine.cover_image || null,
            price: magazine.price ?? null,
            is_purchasable: magazine.is_purchasable || false,
            product_id: magazine.product_id ?? null,
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

  const handleStartEditOrder = (categoryId: string, magazines: Magazine[]) => {
    setEditingCategoryId(categoryId)
    setTempMagazineOrder([...magazines])
  }

  const handleCancelEditOrder = () => {
    setEditingCategoryId(null)
    setTempMagazineOrder([])
  }

  const handleMoveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setTempMagazineOrder(prevMagazines => {
        const newMagazines = [...prevMagazines]
        const draggedItem = newMagazines[dragIndex]
        newMagazines.splice(dragIndex, 1)
        newMagazines.splice(hoverIndex, 0, draggedItem)
        return newMagazines
      })
    },
    [],
  )

  const handleSaveOrder = async (categoryId: string) => {
    try {
      setIsLoading(true)

      // 새로운 순서로 0부터 재정렬
      const magazine_orders = tempMagazineOrder.map((magazine, index) => ({
        magazine_id: magazine.id,
        order: index,
      }))

      const response = await fetch('/api/magazines/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: categoryId,
          magazine_orders,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder magazines')
      }

      setEditingCategoryId(null)
      setTempMagazineOrder([])
      await fetchMagazines()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setIsCreatingCategory(true)
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      setShowCategoryModal(false)
      setNewCategoryName('')
      await fetchMagazines()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    카테고리 추가
                  </button>
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
                  {magazinesByCategory.categories.map(category => {
                    const isEditing = editingCategoryId === category.id
                    const displayMagazines = isEditing
                      ? tempMagazineOrder
                      : category.magazines

                    return (
                      <div
                        key={category.id}
                        className="bg-white rounded-lg shadow overflow-hidden"
                      >
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900">
                                {category.name}
                              </h2>
                              <p className="text-sm text-gray-500 mt-1">
                                총 {category.magazines.length}개
                              </p>
                            </div>
                            {category.magazines.length > 0 && (
                              <div className="flex gap-2 items-center justify-center">
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <span className="text-sm text-gray-500 content-center">
                                      각 매거진을 드래그하여 순서를 변경할 수
                                      있어요.
                                    </span>
                                    <button
                                      onClick={handleCancelEditOrder}
                                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSaveOrder(category.id)
                                      }
                                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                      저장
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleStartEditOrder(
                                        category.id,
                                        category.magazines,
                                      )
                                    }
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                                  >
                                    순서 편집
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {category.magazines.length === 0 ? (
                          <div className="px-6 py-8 text-center">
                            <p className="text-gray-400">
                              [{category.name}] 카테고리에 속한 매거진이 없어요.
                            </p>
                          </div>
                        ) : isEditing ? (
                          <div className="p-6">
                            <div className="flex gap-4 overflow-x-auto pb-4">
                              {displayMagazines.map((magazine, index) => (
                                <div
                                  key={magazine.id}
                                  className="flex-shrink-0 w-[200px]"
                                >
                                  <DraggableMagazineCard
                                    magazine={magazine}
                                    index={index}
                                    onMove={handleMoveCard}
                                  />
                                </div>
                              ))}
                            </div>
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
                                    <div className="mb-2">
                                      <span
                                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                          magazine.is_purchasable
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {magazine.is_purchasable
                                          ? '판매중'
                                          : '판매 정보 필요'}
                                      </span>
                                    </div>
                                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                      {magazine.title || '제목 없음'}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-3">
                                      {dayjs(magazine.created_at).format(
                                        'YYYY.MM.DD',
                                      )}
                                    </p>
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}
                      </div>
                    )
                  })}

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
      />

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              새 카테고리 추가
            </h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleCreateCategory()
                } else if (e.key === 'Escape') {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                }
              }}
              placeholder="카테고리 이름을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              disabled={isCreatingCategory}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                }}
                disabled={isCreatingCategory}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingCategory ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  )
}
