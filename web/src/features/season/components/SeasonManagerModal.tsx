'use client'

import { useState, useEffect } from 'react'

import { Season, SeasonListResponse } from '../types'

interface SeasonManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSeasonChange?: () => void
}

export function SeasonManagerModal({
  isOpen,
  onClose,
  onSeasonChange,
}: SeasonManagerModalProps) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newSeasonName, setNewSeasonName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const fetchSeasons = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/seasons')

      if (!response.ok) {
        throw new Error('Failed to fetch seasons')
      }

      const data: SeasonListResponse = await response.json()
      setSeasons(data.seasons)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSeasons()
      setError(null)
      setNewSeasonName('')
      setEditingId(null)
      setEditingName('')
    }
  }, [isOpen])

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSeasonName.trim()) return

    try {
      setIsCreating(true)
      setError(null)

      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newSeasonName.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create season')
      }

      setNewSeasonName('')
      await fetchSeasons()
      onSeasonChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create season')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditSeason = async (id: string) => {
    if (!editingName.trim()) return

    try {
      setError(null)

      const response = await fetch(`/api/seasons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingName.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update season')
      }

      setEditingId(null)
      setEditingName('')
      await fetchSeasons()
      onSeasonChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update season')
    }
  }

  const handleDeleteSeason = async (id: string, name: string) => {
    if (!confirm(`"${name}" 시즌을 삭제하시겠습니까?`)) return

    try {
      setError(null)

      const response = await fetch(`/api/seasons/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete season')
      }

      await fetchSeasons()
      onSeasonChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete season')
    }
  }

  const startEditing = (season: Season) => {
    setEditingId(season.id)
    setEditingName(season.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleClose = () => {
    setEditingId(null)
    setEditingName('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">시즌 관리</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">닫기</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
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

        <form onSubmit={handleCreateSeason} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSeasonName}
              onChange={e => setNewSeasonName(e.target.value)}
              placeholder="새 시즌 이름"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !newSeasonName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '생성 중...' : '시즌 추가'}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            기존 시즌 ({seasons.length}개)
          </h4>

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">로딩 중...</p>
            </div>
          ) : seasons.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              등록된 시즌이 없습니다.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {seasons.map(season => (
                <div
                  key={season.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  {editingId === season.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleEditSeason(season.id)
                          } else if (e.key === 'Escape') {
                            cancelEditing()
                          }
                        }}
                      />
                      <button
                        onClick={() => handleEditSeason(season.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {season.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          생성일:{' '}
                          {new Date(season.created_at).toLocaleDateString(
                            'ko-KR',
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(season)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                        >
                          수정
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSeason(season.id, season.name)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
