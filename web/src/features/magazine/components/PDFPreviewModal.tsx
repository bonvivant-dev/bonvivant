/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useForm } from 'react-hook-form'
import { IoMdClose } from 'react-icons/io'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

import { MultiCategoryChip } from '@/features/category/components'
import { PDFPageImage } from '@/features/magazine/types'
import { SeasonChip } from '@/features/season/components'
import { Toggle } from '@/shared/components'
import { thumbnail, uploadImage } from '@/shared/utils'

const ITEM_TYPE = 'image'

interface DragItem {
  index: number
  type: string
}

interface DraggableImageItemProps {
  page: PDFPageImage
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
  onRemove: (pageNumber: number) => void
}

function DraggableImageItem({
  page,
  index,
  onMove,
  onRemove,
}: DraggableImageItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ITEM_TYPE,
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
    type: ITEM_TYPE,
    item: () => {
      return { index, type: ITEM_TYPE }
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
      className="flex-shrink-0 relative cursor-grab active:cursor-grabbing"
    >
      <img
        src={page.dataUrl}
        alt={`Page ${page.pageNumber}`}
        className="h-full object-cover rounded border"
        draggable={false}
      />
      <div className="absolute top-1 left-1 bg-black/60 text-white px-2 py-1 rounded text-sm">
        {page.pageNumber}
      </div>
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove(page.pageNumber)
        }}
        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 cursor-pointer"
      >
        ×
      </button>
      {/* Drag indicator */}
      <div className="absolute bottom-1 right-1 bg-black/60 text-white rounded px-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6-12a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        </svg>
      </div>
    </div>
  )
}

interface MagazineFormData {
  title: string
  summary: string
  introduction: string
  category_ids: string[]
  season_id: string | null
  cover_image?: File | null
  cover_image_url?: string | null
  price: number | null
  is_purchasable: boolean
  product_id: string | null
}

interface BasePDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pages: PDFPageImage[]
  onConfirm: (
    selectedPages: PDFPageImage[],
    formData: MagazineFormData,
  ) => Promise<void>
  title: string
}

interface PDFEditPreviewModalProps extends BasePDFPreviewModalProps {
  magazine: {
    id: string
    title: string
    summary: string
    introduction: string
    category_ids: string[]
    season_id: string | null
    previewPageNumbers?: number[]
    cover_image?: string | null
    price: number | null
    is_purchasable?: boolean
    product_id?: string | null
  }
  onDelete?: (id: string, title: string) => Promise<void>
}

const initialFormData: MagazineFormData = {
  title: '',
  summary: '',
  introduction: '',
  category_ids: [],
  season_id: '',
  cover_image: null,
  cover_image_url: null,
  price: null,
  is_purchasable: false,
  product_id: null,
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pages,
  onConfirm,
  title,
  ...props
}: BasePDFPreviewModalProps | PDFEditPreviewModalProps) {
  const { magazine, onDelete } = props as PDFEditPreviewModalProps

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<MagazineFormData>({
    mode: 'onChange',
    defaultValues: initialFormData,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPageOrder, setSelectedPageOrder] = useState<number[]>([])

  // Watch form values for conditional rendering
  const coverImageUrl = watch('cover_image_url')
  const seasonId = watch('season_id')
  const categoryIds = watch('category_ids')
  const isPurchasable = watch('is_purchasable')

  const previewImages = selectedPageOrder
    .map(pageNumber => pages.find(page => page.pageNumber === pageNumber))
    .filter(Boolean) as PDFPageImage[]

  const selectedPageNumbers = new Set(selectedPageOrder)

  // Move function for drag and drop
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setSelectedPageOrder(prevOrder => {
      const newOrder = [...prevOrder]
      const draggedItem = newOrder[dragIndex]
      newOrder.splice(dragIndex, 1)
      newOrder.splice(hoverIndex, 0, draggedItem)
      return newOrder
    })
  }, [])

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (magazine) {
        // 편집 모드: 기존 데이터로 초기화
        reset({
          title: magazine.title,
          summary: magazine.summary,
          introduction: magazine.introduction,
          category_ids: magazine.category_ids,
          season_id: magazine.season_id,
          cover_image: null,
          cover_image_url: magazine.cover_image || null,
          price: magazine.price ?? null,
          is_purchasable: magazine.is_purchasable || false,
          product_id: magazine.product_id ?? null,
        })
        setSelectedPageOrder(magazine.previewPageNumbers || [])
      } else {
        // 신규 생성 모드: 기본값으로 초기화 (단, 모달이 처음 열릴 때만)
        reset(initialFormData)
        setSelectedPageOrder([])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, magazine])

  const handleSeasonUpdate = (seasonId: string | null) => {
    setValue('season_id', seasonId || '', { shouldValidate: true })
  }

  const handleCategoryUpdate = (categoryIds: string[]) => {
    setValue('category_ids', categoryIds, { shouldValidate: true })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    try {
      setIsUploading(true)

      // Supabase Storage에 업로드
      const uploadedUrl = await uploadImage(file, 'cover')

      // 업로드된 URL로 폼 데이터 업데이트
      setValue('cover_image', file, { shouldValidate: true })
      setValue('cover_image_url', uploadedUrl, { shouldValidate: true })
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsUploading(false)
      // input 초기화 (같은 파일 재선택 가능하도록)
      e.target.value = ''
    }
  }

  const handleImageRemove = () => {
    // URL 해제
    if (coverImageUrl) {
      URL.revokeObjectURL(coverImageUrl)
    }
    setValue('cover_image', null, { shouldValidate: true })
    setValue('cover_image_url', null, { shouldValidate: true })
  }

  const togglePageSelection = (pageNumber: number) => {
    setSelectedPageOrder(prevOrder => {
      if (prevOrder.includes(pageNumber)) {
        // 선택 해제: 배열에서 제거
        return prevOrder.filter(num => num !== pageNumber)
      }
      // 선택: 배열 끝에 추가 (선택 순서 유지)
      return [...prevOrder, pageNumber]
    })
  }

  const onSubmit = async (data: MagazineFormData) => {
    try {
      setIsSubmitting(true)

      // 선택된 순서대로 페이지 반환
      const selectedPages = selectedPageOrder
        .map(pageNumber => pages.find(page => page.pageNumber === pageNumber))
        .filter(Boolean) as PDFPageImage[]

      await onConfirm(selectedPages, data)

      // onConfirm 성공 후 모달 닫기
      onClose()
    } catch (error) {
      // 에러가 발생한 경우 모달을 열어둠
      console.error('Failed to confirm:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!magazine || !onDelete) return

    if (!confirm(`[${magazine.title}] 매거진을 삭제할까요?`)) return

    try {
      setIsSubmitting(true)
      await onDelete(magazine.id, magazine.title)
      onClose()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert(`${magazine.title} 삭제에 실패했어요`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        {/* Upload Loading Overlay */}
        {isUploading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
              <p className="text-lg font-medium text-gray-700">
                업로드 중입니다...
              </p>
            </div>
          </div>
        )}

        <div className="w-[1400px] min-w-[1200px] h-90vh bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-400">
            <div>
              <h2 className="text-xl font-semibold">
                {magazine ? `[매거진 편집] ${title}` : title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-xl font-bold cursor-pointer"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          <div className="flex h-full">
            {/* Left Column - Basic Information */}
            <div className="w-1/4 p-4 border-r border-gray-300 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  기본 정보
                </h3>
              </div>
              <div className="space-y-4">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    커버 이미지
                  </label>
                  <div className="relative flex items-center justify-center">
                    <input
                      type="file"
                      id="cover-image-input"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {coverImageUrl ? (
                      <div className="relative w-[200px] aspect-[2/3] border-2 border-solid border-gray-300 rounded overflow-hidden">
                        <img
                          src={thumbnail(coverImageUrl)}
                          alt="커버 이미지"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleImageRemove}
                          className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="cover-image-input"
                        className="w-[200px] aspect-[2/3] border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="mt-2 text-xs text-gray-500">
                          이미지 선택
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Category and Season Chips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 및 시즌
                  </label>
                  <div className="flex items-center space-x-2">
                    <SeasonChip
                      magazineId={magazine?.id}
                      currentSeasonId={seasonId || null}
                      setCurrentSeasonId={(seasonId: string | null) =>
                        setValue('season_id', seasonId || '', {
                          shouldValidate: true,
                        })
                      }
                      onUpdate={handleSeasonUpdate}
                    />
                    <MultiCategoryChip
                      magazineId={magazine?.id}
                      currentCategoryIds={categoryIds}
                      setCurrentCategoryIds={(categoryIds: string[]) =>
                        setValue('category_ids', categoryIds, {
                          shouldValidate: true,
                        })
                      }
                      onUpdate={handleCategoryUpdate}
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    제목 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title', {
                      required: '제목을 입력해주세요.',
                      validate: value =>
                        value.trim().length > 0 || '제목을 입력해주세요.',
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="제목을 입력하세요"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Summary */}
                {/* <div>
                  <label
                    htmlFor="summary"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    요약
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    rows={3}
                    value={formData.summary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="매거진의 간단한 요약을 입력하세요..."
                  />
                </div> */}

                {/* Introduction */}
                <div>
                  <label
                    htmlFor="introduction"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    소개글
                  </label>
                  <textarea
                    id="introduction"
                    {...register('introduction')}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.introduction ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="구매 전 독자가 읽을 수 있는 간단한 소개글을 입력해주세요"
                  />
                  {errors.introduction && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.introduction.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - Sales Information */}
            <div className="w-1/5 p-4 border-r border-gray-300 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  판매 정보
                </h3>
              </div>
              <div className="space-y-4">
                {/* Is Purchasable Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    판매 가능 여부
                  </label>
                  <Toggle
                    enabled={isPurchasable}
                    onChange={value =>
                      setValue('is_purchasable', value, {
                        shouldValidate: true,
                      })
                    }
                    label={isPurchasable ? '판매 가능' : '판매 불가'}
                  />
                </div>

                {/* Price Input */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    id="price"
                    {...register('price', {
                      setValueAs: value =>
                        value === '' || value === null ? null : Number(value),
                      validate: value => {
                        if (value !== null && value < 0) {
                          return '가격은 0원 이상이어야 합니다.'
                        }
                        return true
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="가격을 입력하세요 (선택사항)"
                    min="0"
                    step="100"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Product ID Input */}
                <div>
                  <label
                    htmlFor="product_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    상품 ID {magazine?.product_id ? '(수정 불가)' : ''}
                  </label>
                  <input
                    type="text"
                    id="product_id"
                    {...register('product_id')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.product_id ? 'border-red-300' : 'border-gray-300'
                    } ${magazine?.product_id ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                    placeholder="인앱 결제 상품 ID를 입력하세요"
                    disabled={magazine?.product_id ? true : false}
                  />
                  {errors.product_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.product_id.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - PDF Page Selection */}
            <div className="w-[55%] flex flex-col">
              {/* Swiper Section */}
              <div className="p-4 flex-1 content-center">
                <p className="text-m text-gray-600 mb-3">
                  미리보기로 사용할 페이지를 선택하세요 (총 {pages.length}
                  페이지)
                </p>
                <div className="relative">
                  <Swiper
                    modules={[Navigation]}
                    navigation={{
                      nextEl: '.swiper-button-next-custom',
                      prevEl: '.swiper-button-prev-custom',
                    }}
                    spaceBetween={12}
                    slidesPerView={4}
                    className="h-full"
                  >
                    {pages.map(page => (
                      <SwiperSlide
                        key={page.pageNumber}
                        className="flex items-center justify-center content-center"
                      >
                        <div
                          className="relative cursor-pointer border border-gray-400 p-1 hover:opacity-80"
                          onClick={() => togglePageSelection(page.pageNumber)}
                        >
                          <img
                            src={page.dataUrl}
                            alt={`Page ${page.pageNumber}`}
                            className="max-h-full max-w-full object-contain"
                          />
                          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                            {page.pageNumber}
                          </div>
                          <button
                            className={`absolute cursor-pointer top-2 right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              selectedPageNumbers.has(page.pageNumber)
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'bg-white border-gray-300 text-gray-600'
                            }`}
                          >
                            {selectedPageNumbers.has(page.pageNumber) && '✓'}
                          </button>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <div className="flex justify-center mt-4 gap-4">
                    <button className="swiper-button-prev-custom bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                      ‹
                    </button>
                    <button className="swiper-button-next-custom bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                      ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Images Section with Drag & Drop */}
              <div className="border-t border-gray-400 bg-gray-50 p-4 h-[280px] flex flex-col">
                <div className="flex items-center mb-3">
                  <h3 className="text-m text-gray-600">
                    선택한 순서대로 미리보기에 사용됩니다 - 총{' '}
                    {previewImages.length}개
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    (드래그하여 순서를 변경할 수 있습니다)
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto h-full">
                  {previewImages.length > 0 ? (
                    previewImages.map((page, index) => (
                      <DraggableImageItem
                        key={page.pageNumber}
                        index={index}
                        page={page}
                        onMove={moveCard}
                        onRemove={togglePageSelection}
                      />
                    ))
                  ) : (
                    <div className="h-[200px] w-[150px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                      <p className="text-center">
                        선택된 페이지가
                        <br />
                        없어요.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-300">
            {/* Delete button on the left (only in edit mode) */}
            <div className="flex justify-start">
              {magazine && onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 w-[100px] h-[48px] text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-lg"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white m-auto"></div>
                  ) : (
                    '삭제'
                  )}
                </button>
              )}
            </div>

            {/* Cancel and Confirm buttons on the right */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 w-[100px] h-[48px] border border-gray-300 rounded hover:bg-gray-200 cursor-pointer text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 m-auto"></div>
                ) : (
                  '취소'
                )}
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={
                  selectedPageOrder.length === 0 || !isValid || isSubmitting
                }
                className="px-4 py-2 bg-blue-500 w-[100px] h-[48px] text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white m-auto"></div>
                ) : magazine ? (
                  '수정'
                ) : (
                  '확인'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
