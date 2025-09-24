/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { IoMdClose } from 'react-icons/io'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

import { CategoryChip } from '@/features/category'
import { SeasonChip } from '@/features/season'

import { PDFPageImage } from '../lib/convertPdfToImages'

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
  category_id: string | null
  season_id: string | null
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
  editMode: true
  magazine: {
    id: string
    title: string
    summary: string
    introduction: string
    category_id: string | null
    season_id: string | null
    selectedPages?: number[]
  }
}

const initialFormData: MagazineFormData = {
  title: '',
  summary: '',
  introduction: '',
  category_id: '',
  season_id: '',
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pages,
  onConfirm,
  title,
  ...props
}: BasePDFPreviewModalProps | PDFEditPreviewModalProps) {
  const { editMode, magazine } = props as PDFEditPreviewModalProps
  const [selectedPageOrder, setSelectedPageOrder] = useState<number[]>([])
  const [formData, setFormData] = useState<MagazineFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      if (editMode && magazine) {
        // 편집 모드: 기존 데이터로 초기화
        setFormData({
          title: magazine.title,
          summary: magazine.summary,
          introduction: magazine.introduction,
          category_id: magazine.category_id,
          season_id: magazine.season_id,
        })
        setSelectedPageOrder(magazine.selectedPages || [])
      } else {
        // 신규 생성 모드: 기본값으로 초기화
        setFormData(initialFormData)
        setSelectedPageOrder([])
      }
    }
  }, [isOpen, title, editMode, magazine])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSeasonUpdate = (seasonId: string | null) => {
    setFormData(prev => ({ ...prev, season_id: seasonId || '' }))
  }

  const handleCategoryUpdate = (categoryId: string | null) => {
    setFormData(prev => ({ ...prev, category_id: categoryId || '' }))
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

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)

      // 선택된 순서대로 페이지 반환
      const selectedPages = selectedPageOrder
        .map(pageNumber => pages.find(page => page.pageNumber === pageNumber))
        .filter(Boolean) as PDFPageImage[]

      await onConfirm(selectedPages, formData)

      // onConfirm 성공 후 모달 닫기
      onClose()
    } catch (error) {
      // 에러가 발생한 경우 모달을 열어둠
      console.error('Failed to confirm:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPages = selectedPageOrder
    .map(pageNumber => pages.find(page => page.pageNumber === pageNumber))
    .filter(Boolean) as PDFPageImage[]

  const selectedPageNumbers = new Set(selectedPageOrder)

  if (!isOpen) return null

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-[1400px] min-w-[1200px] h-90vh bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-400">
            <div>
              <h2 className="text-xl font-semibold">
                {editMode ? `매거진 편집 - ${title}` : title}
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
            {/* Left Column - Magazine Information Form */}
            <div className="w-1/4 p-4 border-r border-gray-300 overflow-y-auto">
              <p className="text-m text-gray-600 mb-3">매거진 정보</p>
              <div className="space-y-4">
                {/* Category and Season Chips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 및 시즌
                  </label>
                  <div className="flex items-center space-x-2">
                    <SeasonChip
                      magazineId={magazine?.id}
                      currentSeasonId={formData.season_id || null}
                      setCurrentSeasonId={(seasonId: string | null) =>
                        setFormData(prev => ({
                          ...prev,
                          season_id: seasonId || '',
                        }))
                      }
                      onUpdate={handleSeasonUpdate}
                    />
                    <CategoryChip
                      magazineId={magazine?.id}
                      currentCategoryId={formData.category_id || null}
                      setCurrentCategoryId={(categoryId: string | null) =>
                        setFormData(prev => ({
                          ...prev,
                          category_id: categoryId || '',
                        }))
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
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="매거진 제목을 입력하세요"
                  />
                </div>

                {/* Summary */}
                <div>
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
                </div>

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
                    name="introduction"
                    rows={4}
                    value={formData.introduction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="매거진에 대한 자세한 소개글을 입력하세요..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - PDF Page Selection */}
            <div className="w-3/4 flex flex-col">
              {/* Swiper Section */}
              <div className="p-4 flex-1">
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
                    {selectedPages.length}개
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    (드래그하여 순서를 변경할 수 있습니다)
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto h-full">
                  {selectedPages.length > 0 ? (
                    selectedPages.map((page, index) => (
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
                        없습니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="items-center justify-between p-2 bg-gray-50 border-t border-gray-300">
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
                onClick={handleConfirm}
                disabled={
                  selectedPageOrder.length === 0 ||
                  !formData.title.trim() ||
                  isSubmitting
                }
                className="px-4 py-2 bg-blue-500 w-[100px] h-[48px] text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white m-auto"></div>
                ) : editMode ? (
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
