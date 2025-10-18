'use client'

import { useState } from 'react'

import { Header } from '@/shared/components'

export default function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

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
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '알림 전송에 실패했습니다.',
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
                        '전체 사용자에게 알림 전송'
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
          </div>
        </main>
      </div>
    </>
  )
}
