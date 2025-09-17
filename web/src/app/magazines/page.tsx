'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

import { useAuth } from '@/features/auth'
import { Magazine, MagazineListResponse } from '@/features/magazine'
import { convertPdfToImages } from '@/features/magazine'
import { Season, SeasonListResponse } from '@/features/season'

export default function MagazinesPage() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [uploading, setUploading] = useState(false)

  const fetchMagazines = async (page = 1, search = '', seasonId = '') => {
    try {
      setIsLoading(true)
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
      })

      if (seasonId) {
        searchParams.append('season_id', seasonId)
      }

      const response = await fetch(`/api/magazines?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch magazines')
      }

      const data: MagazineListResponse = await response.json()
      setMagazines(data.magazines)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
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

  useEffect(() => {
    if (user && isAdmin) {
      Promise.all([
        fetchMagazines(currentPage, searchTerm, selectedSeasonId),
        fetchSeasons(),
      ])
    }
  }, [user, isAdmin, currentPage, searchTerm, selectedSeasonId])

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('PDF 파일만 업로드 가능합니다.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // 클라이언트 사이드에서 PDF를 이미지로 변환
      const imageBlobs = await convertPdfToImages(file)

      const formData = new FormData()
      formData.append('file', file)

      // 변환된 이미지들도 FormData에 추가
      imageBlobs.forEach((blob, index) => {
        formData.append(`image-${index}`, blob, `page-${index + 1}.jpg`)
      })

      const response = await fetch('/api/magazines/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      await fetchMagazines(1, searchTerm, selectedSeasonId)
      setCurrentPage(1)

      event.target.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 매거진을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/magazines/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete magazine')
      }

      await fetchMagazines(currentPage, searchTerm, selectedSeasonId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchMagazines(1, searchTerm, selectedSeasonId)
  }

  const handleSeasonFilter = (seasonId: string) => {
    setSelectedSeasonId(seasonId)
    setCurrentPage(1)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← 대시보드로 돌아가기
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">매거진 관리</h1>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                새 매거진 업로드
              </h3>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      uploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    }`}
                  >
                    {uploading ? '업로드 중...' : 'PDF 파일 선택'}
                  </span>
                </label>
                <span className="text-sm text-gray-500">
                  PDF 파일만 업로드 가능합니다. 첫 3페이지가 미리보기로
                  변환됩니다.
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="매거진 제목으로 검색..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    검색
                  </button>
                </form>
              </div>
            </div>
          </div>

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

          {/* Magazines List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
            {/* flex div */}
            <div className="flex items-center justify-between px-4 py-5">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  매거진 목록
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  총 {magazines.length}개의 매거진이 있습니다.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedSeasonId}
                  onChange={e => handleSeasonFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">모든 시즌</option>
                  <option value="null">시즌 없음</option>
                  {seasons.map(season => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">로딩 중...</p>
              </div>
            ) : magazines.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">
                  {searchTerm
                    ? '검색 결과가 없습니다.'
                    : '등록된 매거진이 없습니다.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {magazines.map(magazine => (
                  <li key={magazine.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                          {magazine.cover_image && (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${magazine.storage_key}/${magazine.cover_image}`}
                              alt={magazine.title || 'Cover'}
                              className="w-20 h-25 object-cover rounded-md shadow-sm"
                              width={80}
                              height={100}
                            />
                          )}
                          <div className="flex flex-col justify-between space-x-4">
                            <div className="flex flex-col items-start">
                              <p className="text-lg font-medium text-gray-900">
                                {magazine.title || '제목 없음'}
                              </p>
                            </div>
                            <div className="flex flex-col items-start">
                              <p className="text-sm text-gray-500">
                                {magazine.summary || '요약 없음'}
                              </p>
                              <p className="text-xs text-gray-400">
                                생성일:{' '}
                                {new Date(
                                  magazine.created_at,
                                ).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/magazines/${magazine.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            편집
                          </Link>
                          <button
                            onClick={() => handleDelete(magazine.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      총 <span className="font-medium">{totalPages}</span>{' '}
                      페이지 중{' '}
                      <span className="font-medium">{currentPage}</span> 페이지
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
