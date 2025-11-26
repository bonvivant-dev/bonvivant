'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { IoMdClose } from 'react-icons/io'

import { Category } from '../types'

const CATEGORY_ITEM_TYPE = 'category'

interface DragItem {
  index: number
  type: string
}

interface DraggableCategoryItemProps {
  category: Category
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
}

function DraggableCategoryItem({
  category,
  index,
  onMove,
}: DraggableCategoryItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: CATEGORY_ITEM_TYPE,
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
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) {
        return
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
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
    type: CATEGORY_ITEM_TYPE,
    item: () => {
      return { index, type: CATEGORY_ITEM_TYPE }
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
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing"
    >
      {/* Drag Handle */}
      <div className="text-gray-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6-12a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        </svg>
      </div>
      {/* Category Name */}
      <div className="flex-1 font-medium text-gray-900">{category.name}</div>
    </div>
  )
}

interface CategoryOrderModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onSave: (reorderedCategories: Category[]) => Promise<void>
}

export function CategoryOrderModal({
  isOpen,
  onClose,
  categories,
  onSave,
}: CategoryOrderModalProps) {
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // 카테고리를 order 순서로 정렬
      const sorted = [...categories].sort((a, b) => a.order - b.order)
      setOrderedCategories(sorted)
    }
  }, [isOpen, categories])

  const handleMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setOrderedCategories(prevCategories => {
      const newCategories = [...prevCategories]
      const draggedItem = newCategories[dragIndex]
      newCategories.splice(dragIndex, 1)
      newCategories.splice(hoverIndex, 0, draggedItem)
      return newCategories
    })
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(orderedCategories)
      onClose()
    } catch (error) {
      console.error('Failed to save category order:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-[600px] max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              카테고리 순서 변경
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm text-gray-600 mb-4">
              카테고리를 드래그하여 순서를 변경할 수 있습니다.
            </p>
            <div className="space-y-2">
              {orderedCategories.map((category, index) => (
                <DraggableCategoryItem
                  key={category.id}
                  category={category}
                  index={index}
                  onMove={handleMove}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-w-[80px]"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
