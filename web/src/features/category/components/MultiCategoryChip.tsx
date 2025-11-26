'use client'

import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

import { Portal } from '@/shared/components'
import { useOutsideClick } from '@/shared/hooks'

import { Category } from '../types'

interface MultiCategoryChipProps {
  currentCategoryIds: string[]
  setCurrentCategoryIds: (categoryIds: string[]) => void
}

export function MultiCategoryChip({
  currentCategoryIds,
  setCurrentCategoryIds,
}: MultiCategoryChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  const fetchSelectedCategories = useCallback(async () => {
    if (currentCategoryIds.length === 0) {
      setSelectedCategories([])
      return
    }

    try {
      const categoryPromises = currentCategoryIds.map(id =>
        fetch(`/api/categories/${id}`).then(res => res.json()),
      )
      const responses = await Promise.all(categoryPromises)
      const validCategories = responses
        .filter(data => data.category)
        .map(data => data.category)
      setSelectedCategories(validCategories)
    } catch (err) {
      console.error('Failed to fetch selected categories:', err)
      setSelectedCategories([])
    }
  }, [currentCategoryIds])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data: { categories: Category[] } = await response.json()
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newCategoryIds = currentCategoryIds.includes(categoryId)
      ? currentCategoryIds.filter(id => id !== categoryId)
      : [...currentCategoryIds, categoryId]

    setCurrentCategoryIds(newCategoryIds)
  }

  useEffect(() => {
    fetchSelectedCategories()
  }, [fetchSelectedCategories])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()

      // Calculate dropdown position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
        })
      }
    }
  }, [isOpen])

  useOutsideClick(dropdownRef as RefObject<HTMLElement>, () => {
    setIsOpen(false)
  })

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors border border-dashed border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800"
      >
        {selectedCategories.length > 0 ? (
          <div className="flex items-center gap-1">
            <span>{selectedCategories.length}개 카테고리</span>
            {selectedCategories.length <= 2 && (
              <span className="text-blue-600">
                ({selectedCategories.map(c => c.name).join(', ')})
              </span>
            )}
          </div>
        ) : (
          '카테고리 선택'
        )}
        <svg
          className="ml-1 h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <Portal isOpen={isOpen}>
        <div
          ref={dropdownRef}
          className="fixed w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="py-1 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">로딩 중...</div>
            ) : (
              <>
                {/* 선택된 카테고리 표시 */}
                {selectedCategories.length > 0 && (
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">
                      선택된 카테고리:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.map(category => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {category.name}
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 기존 카테고리 목록 */}
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`px-3 py-2 text-sm hover:bg-gray-100 ${
                      currentCategoryIds.includes(category.id)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentCategoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="mr-2"
                      />
                      {category.name}
                    </label>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </Portal>
    </>
  )
}
