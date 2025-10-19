'use client'

import { useEffect, useState } from 'react'

import { Header } from '@/shared/components'

interface NotificationHistory {
  id: string
  title: string
  body: string
  sent_count: number
  created_at: string
}

export default function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // 히스토리 불러오기
  const loadHistory = async () => {
    try {
      const response = await fetch('/api/notifications/history')
      const data = await response.json()

      if (response.ok) {
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('히스토리 조회 오류:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setMessage({ type: 'error', text: '제목과 내용을 모두 입력해주세요.' })
      return
    }

    setIsSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '알림 전송에 실패했습니다.')
      }

      setMessage({
        type: 'success',
        text: `${data.sentCount}명에게 알림을 전송했습니다.`,
      })
      setTitle('')
      setBody('')
      // 히스토리 새로고침
      loadHistory()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : '알림 전송에 실패했습니다.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Header title="알림 관리" />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                  푸시 알림 전송
                </h3>

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

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      알림 제목
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="예: 새 매거진이 출간되었습니다!"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      disabled={isSending}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="body"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      알림 내용
                    </label>
                    <textarea
                      id="body"
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="예: 이번 주 매거진을 확인해보세요."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      disabled={isSending}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSendNotification}
                      disabled={isSending || !title.trim() || !body.trim()}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          전송 중...
                        </>
                      ) : (
                        '알림 전송하기'
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    안내사항
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 앱이 설치된 모든 사용자에게 알림이 전송됩니다.</li>
                    <li>• 알림 권한을 허용한 사용자만 받을 수 있습니다.</li>
                    <li>
                      • 전송된 알림은 취소할 수 없으니 신중하게 작성해주세요.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 전송 히스토리 */}
            <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  전송 히스토리
                </h3>

                {isLoadingHistory ? (
                  <div className="text-center py-8 text-gray-500">
                    히스토리를 불러오는 중...
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    아직 전송된 알림이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map(item => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">
                            {item.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {new Date(item.created_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.body}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                            />
                          </svg>
                          {item.sent_count}명에게 전송됨
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
