'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

import { useAuth } from '@/features/auth'
import { CategoryChip } from '@/features/category'
import { Magazine } from '@/features/magazine'
import { SeasonChip } from '@/features/season'
import { Season, SeasonListResponse } from '@/features/season'
import { Header } from '@/shared/components'

interface MagazineEditPageProps {
  params: Promise<{ id: string }>
}

export default function MagazineEditPage({ params }: MagazineEditPageProps) {
  const { user, isAdmin } = useAuth()
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
    category_id: '',
  })

  const fetchMagazine = useCallback(async () => {
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
        category_id: data.magazine.category_id || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    if (user && isAdmin) {
      fetchMagazine()
      fetchSeasons()
    }
  }, [user, isAdmin, fetchMagazine])

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

  const handleSeasonUpdate = (seasonId: string | null) => {
    console.log('seasonId', seasonId)
    setFormData(prev => ({ ...prev, season_id: seasonId || '' }))
  }

  const handleCategoryUpdate = (categoryId: string | null) => {
    setFormData(prev => ({ ...prev, category_id: categoryId || '' }))
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
            href="/admin/magazines"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            매거진 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header title="매거진 편집" />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      성공!
                    </h3>
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
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 및 시즌
                    </label>
                    <div className="flex items-center space-x-2">
                      <SeasonChip
                        magazineId={magazine?.id || ''}
                        currentSeasonId={formData.season_id || null}
                        onUpdate={handleSeasonUpdate}
                      />
                      <CategoryChip
                        magazineId={magazine?.id || ''}
                        currentCategoryId={formData.category_id || null}
                        onUpdate={handleCategoryUpdate}
                      />
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category and Season Chips */}

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

                    <div className="flex justify-end space-x-3">
                      <Link
                        href="/admin/magazines"
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
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${magazine.storage_key}/${magazine.cover_image}`}
                        alt="Cover"
                        className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                        width={800}
                        height={1000}
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
                            <Image
                              key={index}
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${magazine.storage_key}/${image}`}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded border"
                              width={800}
                              height={1000}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Magazine Info */}
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        제목
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formData.title || '제목 없음'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        요약
                      </dt>
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
                      <dt className="text-sm font-medium text-gray-500">
                        시즌
                      </dt>
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
                          {new Date(magazine.updated_at).toLocaleString(
                            'ko-KR',
                          )}
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
    </>
  )
}
