'use client'

import Link from 'next/link'

import { Header } from '@/shared/components'

export default function Home() {
  return (
    <>
      <Header title="관리자 대시보드" />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  관리자 대시보드
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Link href="/admin/magazines">
                    <div className="bg-green-50 overflow-hidden shadow rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                매거진 관리
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                클릭하여 이동
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/admin/notifications">
                    <div className="bg-purple-50 overflow-hidden shadow rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                알림 관리
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                클릭하여 이동
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
