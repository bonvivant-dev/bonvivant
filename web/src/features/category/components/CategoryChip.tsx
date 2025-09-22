/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

import { Portal } from '@/shared/components'
import { useOutsideClick } from '@/shared/hooks'

import { Category, CategoryListResponse } from '../types'

interface CategoryChipProps {
  magazineId?: string
  currentCategoryId: string | null
  setCurrentCategoryId: (categoryId: string | null) => void
  onUpdate: (categoryId: string | null) => void
}

export function CategoryChip({
  magazineId,
  currentCategoryId,
  setCurrentCategoryId,
  onUpdate,
}: CategoryChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategoryName, setCurrentCategoryName] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  const fetchCurrentCategory = useCallback(async () => {
    if (!currentCategoryId) {
      setCurrentCategoryName(null)
      return
    }

    try {
      const response = await fetch(`/api/categories/${currentCategoryId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentCategoryName(data.category.name)
      } else {
        setCurrentCategoryName(null)
      }
    } catch (err) {
      console.error('Failed to fetch current category:', err)
      setCurrentCategoryName(null)
    }
  }, [currentCategoryId])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data: CategoryListResponse = await response.json()
        setCategories(data.categories)
      }
    } catch (err) {
      setError('카테고리를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateMagazineCategory = async (categoryId: string | null) => {
    // 매거진 ID가 없으면 바로 상태만 업데이트 (신규 생성 모드)
    if (!magazineId) {
      onUpdate(categoryId)
      setIsOpen(false)
      return
    }

    // 매거진 ID가 있으면 서버에 업데이트 요청 (수정 모드)
    try {
      const response = await fetch(`/api/magazines/${magazineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_id: categoryId }),
      })

      if (response.ok) {
        onUpdate(categoryId)
        setIsOpen(false)
      } else {
        setError('카테고리 업데이트에 실패했습니다.')
      }
    } catch (err) {
      setError('카테고리 업데이트에 실패했습니다.')
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setIsCreating(true)
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        await fetchCategories()
        setNewCategoryName('')
        setShowCreateForm(false)
        // 새로 생성된 카테고리를 자동으로 선택
        await updateMagazineCategory(data.category.id)
        setCurrentCategoryId(data.category.id)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '카테고리 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('카테고리 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCategories()
        // 삭제된 카테고리가 현재 선택된 카테고리였다면 선택 해제
        if (currentCategoryId === categoryId) {
          await updateMagazineCategory(null)
          setCurrentCategoryId(null)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || '카테고리 삭제에 실패했습니다.')
      }
    } catch (err) {
      setError('카테고리 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    fetchCurrentCategory()
  }, [fetchCurrentCategory])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setError(null)
      setShowCreateForm(false)
      setNewCategoryName('')

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

  useEffect(() => {
    if (showCreateForm && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showCreateForm])

  useOutsideClick(dropdownRef as RefObject<HTMLElement>, () => {
    setIsOpen(false)
    setShowCreateForm(false)
    setNewCategoryName('')
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createCategory()
    } else if (e.key === 'Escape') {
      setShowCreateForm(false)
      setNewCategoryName('')
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
          currentCategoryName
            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            : 'border border-dashed border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800'
        }`}
      >
        {currentCategoryName || '카테고리'}
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
          className="fixed w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50"
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
                {/* 카테고리 없음 옵션 */}
                <button
                  onClick={() => {
                    setCurrentCategoryName(null)
                    setCurrentCategoryId(null)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    !currentCategoryId ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  (없음)
                </button>

                {/* 기존 카테고리 목록 */}
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 ${
                      currentCategoryId === category.id
                        ? 'bg-blue-50 font-medium'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCurrentCategoryName(category.name)
                        setCurrentCategoryId(category.id)
                        setIsOpen(false)
                      }}
                      className="flex-1 text-left"
                    >
                      {category.name}
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="카테고리 삭제"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* 새 카테고리 생성 폼 */}
                {showCreateForm ? (
                  <div className="px-3 py-2 border-t border-gray-100">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="새 카테고리 이름"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isCreating}
                    />
                    <div className="flex justify-end space-x-1 mt-2">
                      <button
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewCategoryName('')
                        }}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        disabled={isCreating}
                      >
                        취소
                      </button>
                      <button
                        onClick={createCategory}
                        disabled={isCreating || !newCategoryName.trim()}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isCreating ? '생성 중...' : '생성'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 border-t border-gray-100"
                  >
                    + 새 카테고리 생성
                  </button>
                )}
              </>
            )}

            {error && (
              <div className="px-3 py-2 text-xs text-red-600 border-t border-gray-100">
                {error}
              </div>
            )}
          </div>
        </div>
      </Portal>
    </>
  )
}
