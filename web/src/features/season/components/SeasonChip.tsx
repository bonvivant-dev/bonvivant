/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

import { Portal } from '@/shared/components'
import { useOutsideClick } from '@/shared/hooks'

import { Season, SeasonListResponse } from '../types'

interface SeasonChipProps {
  magazineId?: string
  currentSeasonId: string | null
  setCurrentSeasonId: (seasonId: string | null) => void
  onUpdate: (seasonId: string | null) => void
}

export function SeasonChip({
  magazineId,
  currentSeasonId,
  setCurrentSeasonId,
  onUpdate,
}: SeasonChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [currentSeasonName, setCurrentSeasonName] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSeasonName, setNewSeasonName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  const fetchCurrentSeason = useCallback(async () => {
    if (!currentSeasonId) {
      setCurrentSeasonName(null)
      return
    }

    try {
      const response = await fetch(`/api/seasons/${currentSeasonId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentSeasonName(data.season.name)
      } else {
        setCurrentSeasonName(null)
      }
    } catch (err) {
      console.error('Failed to fetch current season:', err)
      setCurrentSeasonName(null)
    }
  }, [currentSeasonId])

  const fetchSeasons = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/seasons')
      if (response.ok) {
        const data: SeasonListResponse = await response.json()
        setSeasons(data.seasons)
      }
    } catch (err) {
      setError('시즌을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateMagazineSeason = async (seasonId: string | null) => {
    // 매거진 ID가 없으면 바로 상태만 업데이트 (신규 생성 모드)
    if (!magazineId) {
      onUpdate(seasonId)
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
        body: JSON.stringify({ season_id: seasonId }),
      })

      if (response.ok) {
        onUpdate(seasonId)
        setIsOpen(false)
      } else {
        setError('시즌 업데이트에 실패했습니다.')
      }
    } catch (err) {
      setError('시즌 업데이트에 실패했습니다.')
    }
  }

  const createSeason = async () => {
    if (!newSeasonName.trim()) return

    try {
      setIsCreating(true)
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newSeasonName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        await fetchSeasons()
        setNewSeasonName('')
        setShowCreateForm(false)
        // 새로 생성된 시즌을 자동으로 선택
        await updateMagazineSeason(data.season.id)
        setCurrentSeasonId(data.season.id)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '시즌 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('시즌 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const deleteSeason = async (seasonId: string) => {
    if (!confirm('이 시즌을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSeasons()
        // 삭제된 시즌이 현재 선택된 시즌이었다면 선택 해제
        if (currentSeasonId === seasonId) {
          await updateMagazineSeason(null)
          setCurrentSeasonId(null)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || '시즌 삭제에 실패했습니다.')
      }
    } catch (err) {
      setError('시즌 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    fetchCurrentSeason()
  }, [fetchCurrentSeason])

  useEffect(() => {
    if (isOpen) {
      fetchSeasons()
      setError(null)
      setShowCreateForm(false)
      setNewSeasonName('')

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
    setNewSeasonName('')
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createSeason()
    } else if (e.key === 'Escape') {
      setShowCreateForm(false)
      setNewSeasonName('')
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
          currentSeasonName
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'border border-dashed border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800'
        }`}
      >
        {currentSeasonName || '시즌'}
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
                {/* 시즌 없음 옵션 */}
                <button
                  onClick={() => {
                    setCurrentSeasonName(null)
                    setCurrentSeasonId(null)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    !currentSeasonId ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  (없음)
                </button>

                {/* 기존 시즌 목록 */}
                {seasons.map(season => (
                  <div
                    key={season.id}
                    className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 ${
                      currentSeasonId === season.id
                        ? 'bg-green-50 font-medium'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCurrentSeasonName(season.name)
                        setCurrentSeasonId(season.id)
                        setIsOpen(false)
                      }}
                      className="flex-1 text-left"
                    >
                      {season.name}
                    </button>
                    <button
                      onClick={() => deleteSeason(season.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="시즌 삭제"
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

                {/* 새 시즌 생성 폼 */}
                {showCreateForm ? (
                  <div className="px-3 py-2 border-t border-gray-100">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newSeasonName}
                      onChange={e => setNewSeasonName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="새 시즌 이름"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      disabled={isCreating}
                    />
                    <div className="flex justify-end space-x-1 mt-2">
                      <button
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewSeasonName('')
                        }}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        disabled={isCreating}
                      >
                        취소
                      </button>
                      <button
                        onClick={createSeason}
                        disabled={isCreating || !newSeasonName.trim()}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isCreating ? '생성 중...' : '생성'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-gray-100 border-t border-gray-100"
                  >
                    + 새 시즌 생성
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
