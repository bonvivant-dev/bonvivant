'use client'
import dayjs from 'dayjs'
import Pagination from 'rc-pagination'
import { useState, useEffect, useCallback } from 'react'

import { Header } from '@/shared/components'

import 'rc-pagination/assets/index.css'

interface User {
  id: string
  email: string
  name: string
  providers: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // 페이지네이션 상태
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalAll, setTotalAll] = useState(0)
  const limit = 10

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // 검색 디바운스 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }

      const response = await fetch(`/api/users?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.users)
      setTotal(data.total)
      setTotalAll(data.totalAll)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `${userEmail} 사용자의 비밀번호를 'bonvivant2026'으로 초기화하시겠습니까?`,
      )
    ) {
      return
    }

    try {
      setResettingUserId(userId)
      setMessage(null)

      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setMessage({
        type: 'success',
        text: data.message || '비밀번호가 초기화되었습니다.',
      })

      // 3초 후 메시지 자동 제거
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : '비밀번호 초기화에 실패했습니다.',
      })
    } finally {
      setResettingUserId(null)
    }
  }

  if (isInitialLoad) {
    return (
      <>
        <Header title="회원 관리" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header title="회원 관리" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">오류가 발생했습니다: {error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="회원 관리" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                회원 관리
              </h2>

              {/* 안내 메시지 */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  비밀번호 초기화는 이메일로 가입한 사용자만 가능합니다.
                </p>
              </div>

              {/* 검색 입력 및 회원 수 */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <input
                  type="text"
                  placeholder="이메일 또는 이름으로 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">
                  {debouncedSearch
                    ? `총 ${totalAll}명 / 검색 결과 ${total}명`
                    : `총 ${totalAll}명`}
                </span>
              </div>

              {message && (
                <div
                  className={`mb-4 p-4 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-sm text-gray-500">
                              로딩 중...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-gray-500">
                            {debouncedSearch
                              ? '검색 결과가 없습니다.'
                              : '등록된 회원이 없습니다.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.providers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayjs(user.createdAt).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.providers.includes('email') && (
                              <button
                                onClick={() =>
                                  handleResetPassword(user.id, user.email)
                                }
                                disabled={resettingUserId === user.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {resettingUserId === user.id
                                  ? '초기화 중...'
                                  : '비밀번호 초기화'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={limit}
                  onChange={newPage => setPage(newPage)}
                  disabled={loading}
                  showTitle={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
