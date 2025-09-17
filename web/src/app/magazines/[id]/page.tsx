'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { Magazine, Season, SeasonListResponse } from '@/types/magazine'

interface MagazineEditPageProps {
  params: Promise<{ id: string }>
}

export default function MagazineEditPage({ params }: MagazineEditPageProps) {
  const { user, loading, signOut, isAdmin } = useAuth()
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    introduction: '',
    season_id: '',
  })

  useEffect(() => {
    if (user && isAdmin) {
      fetchMagazine()
      fetchSeasons()
    }
  }, [user, isAdmin])

  const fetchMagazine = async () => {
    try {
      setIsLoading(true)
      const { id } = await params
      const response = await fetch(`/api/magazines/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch magazine')
      }

      const data = await response.json()
      setMagazine(data.magazine)
      setFormData({
        title: data.magazine.title || '',
        summary: data.magazine.summary || '',
        introduction: data.magazine.introduction || '',
        season_id: data.magazine.season_id || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons')
      if (response.ok) {
        const data: SeasonListResponse = await response.json()
        setSeasons(data.seasons)
      }
    } catch (err) {
      console.error('Failed to fetch seasons:', err)
    }
  }

  const getSeasonName = (seasonId: string | null) => {
    if (!seasonId) return '시즌 없음'
    const season = seasons.find(s => s.id === seasonId)
    return season?.name || '알 수 없는 시즌'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { id } = await params
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update magazine')
      }

      const data = await response.json()
      setMagazine(data.magazine)
      setSuccessMessage('매거진이 성공적으로 업데이트되었습니다.')

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h2>
          <p className="text-gray-600">관리자 권한이 필요한 페이지입니다.</p>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer mt-4"
          >
            로그아웃
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!magazine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            매거진을 찾을 수 없습니다
          </h2>
          <Link
            href="/magazines"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            매거진 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/magazines"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← 매거진 목록으로 돌아가기
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">매거진 편집</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} (관리자)
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">성공!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    {successMessage}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-400 hover:text-green-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  매거진 정보 편집
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      제목 *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      제목을 변경하면 스토리지의 파일명도 함께 변경됩니다.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="summary"
                      className="block text-sm font-medium text-gray-700"
                    >
                      요약
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="summary"
                        name="summary"
                        rows={3}
                        value={formData.summary}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="매거진의 간단한 요약을 입력하세요..."
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="introduction"
                      className="block text-sm font-medium text-gray-700"
                    >
                      소개글
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="introduction"
                        name="introduction"
                        rows={6}
                        value={formData.introduction}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="매거진에 대한 자세한 소개글을 입력하세요..."
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="season_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      시즌
                    </label>
                    <div className="mt-1">
                      <select
                        id="season_id"
                        name="season_id"
                        value={formData.season_id}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">시즌 없음</option>
                        {seasons.map(season => (
                          <option key={season.id} value={season.id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      매거진이 속할 시즌을 선택하세요.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link
                      href="/magazines"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      취소
                    </Link>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                        isSaving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  미리보기
                </h3>

                {/* Cover Image */}
                {magazine.cover_image && (
                  <div className="mb-6">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${magazine.storage_key}/${magazine.cover_image}`}
                      alt="Cover"
                      className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Preview Images */}
                {magazine.preview_images &&
                  magazine.preview_images.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        미리보기 이미지들
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {magazine.preview_images.map((image, index) => (
                          <img
                            key={index}
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${magazine.storage_key}/${image}`}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Magazine Info */}
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">제목</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.title || '제목 없음'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">요약</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.summary || '요약 없음'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      소개글
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {formData.introduction || '소개글 없음'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">시즌</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getSeasonName(formData.season_id || null)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      스토리지 키
                    </dt>
                    <dd className="mt-1 text-xs text-gray-600 font-mono">
                      {magazine.storage_key}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      생성일
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(magazine.created_at).toLocaleString('ko-KR')}
                    </dd>
                  </div>

                  {magazine.updated_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        수정일
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(magazine.updated_at).toLocaleString('ko-KR')}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
