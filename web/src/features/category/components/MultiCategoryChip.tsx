'use client'

import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

import { Portal } from '@/shared/components'
import { useOutsideClick } from '@/shared/hooks'

import { Category } from '../types'

interface MultiCategoryChipProps {
  magazineId?: string
  currentCategoryIds: string[]
  setCurrentCategoryIds: (categoryIds: string[]) => void
  onUpdate: (categoryIds: string[]) => void
}

export function MultiCategoryChip({
  magazineId,
  currentCategoryIds,
  setCurrentCategoryIds,
  onUpdate,
}: MultiCategoryChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  )
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
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

  const updateMagazineCategories = async (categoryIds: string[]) => {
    // 매거진 ID가 없으면 바로 상태만 업데이트 (신규 생성 모드)
    if (!magazineId) {
      onUpdate(categoryIds)
      return
    }

    // 매거진 ID가 있으면 서버에 업데이트 요청 (수정 모드)
    try {
      const response = await fetch(`/api/magazines/${magazineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_ids: categoryIds }),
      })

      if (response.ok) {
        onUpdate(categoryIds)
      }
    } catch (err) {
      console.error('Failed to update magazine categories:', err)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newCategoryIds = currentCategoryIds.includes(categoryId)
      ? currentCategoryIds.filter(id => id !== categoryId)
      : [...currentCategoryIds, categoryId]

    setCurrentCategoryIds(newCategoryIds)
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

        // 새로 생성한 카테고리를 자동으로 선택
        const newCategoryIds = [...currentCategoryIds, data.category.id]
        setCurrentCategoryIds(newCategoryIds)
        await updateMagazineCategories(newCategoryIds)
      }
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const updateCategory = async (categoryId: string, newName: string) => {
    if (!newName.trim()) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (response.ok) {
        await fetchCategories()
        await fetchSelectedCategories()
        setEditingCategoryId(null)
        setEditingCategoryName('')
      }
    } catch (err) {
      console.error('Failed to update category:', err)
    } finally {
      setIsUpdating(false)
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
        // 삭제된 카테고리가 선택된 카테고리 중 하나였다면 선택 해제
        if (currentCategoryIds.includes(categoryId)) {
          const newCategoryIds = currentCategoryIds.filter(
            id => id !== categoryId,
          )
          setCurrentCategoryIds(newCategoryIds)
          await updateMagazineCategories(newCategoryIds)
        }
      } else {
        // HTTP 에러 응답 처리
        const errorData = await response.json()
        alert(errorData.error || '카테고리 삭제에 실패했습니다')
      }
    } catch {
      alert('카테고리 삭제 중 오류가 발생했습니다')
    }
  }

  useEffect(() => {
    fetchSelectedCategories()
  }, [fetchSelectedCategories])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
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

  useEffect(() => {
    if (editingCategoryId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingCategoryId])

  useOutsideClick(dropdownRef as RefObject<HTMLElement>, () => {
    setIsOpen(false)
    setShowCreateForm(false)
    setNewCategoryName('')
    setEditingCategoryId(null)
    setEditingCategoryName('')
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createCategory()
    } else if (e.key === 'Escape') {
      setShowCreateForm(false)
      setNewCategoryName('')
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      updateCategory(categoryId, editingCategoryName)
    } else if (e.key === 'Escape') {
      setEditingCategoryId(null)
      setEditingCategoryName('')
    }
  }

  const startEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategoryId(categoryId)
    setEditingCategoryName(currentName)
  }

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
                    className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 ${
                      currentCategoryIds.includes(category.id)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    {editingCategoryId === category.id ? (
                      <>
                        <div className="flex items-center flex-1">
                          <input
                            type="checkbox"
                            checked={currentCategoryIds.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="mr-2"
                          />
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingCategoryName}
                            onChange={e =>
                              setEditingCategoryName(e.target.value)
                            }
                            onKeyDown={e => handleEditKeyDown(e, category.id)}
                            className="flex-1 px-1 py-0.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={isUpdating}
                          />
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() =>
                              updateCategory(category.id, editingCategoryName)
                            }
                            disabled={isUpdating || !editingCategoryName.trim()}
                            className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50"
                            title="수정 완료"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryId(null)
                              setEditingCategoryName('')
                            }}
                            disabled={isUpdating}
                            className="text-gray-500 hover:text-gray-700 p-1 disabled:opacity-50"
                            title="수정 취소"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentCategoryIds.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="mr-2"
                          />
                          {category.name}
                        </label>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() =>
                              startEditCategory(category.id, category.name)
                            }
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="카테고리 수정"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
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
                      </>
                    )}
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
          </div>
        </div>
      </Portal>
    </>
  )
}
