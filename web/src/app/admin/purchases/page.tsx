'use client'

import dayjs from 'dayjs'
import Pagination from 'rc-pagination'
import { useState, useEffect, useCallback } from 'react'

import { Header } from '@/shared/components'

import 'rc-pagination/assets/index.css'

interface Purchase {
  id: string
  transactionId: string
  platform: string
  productId: string
  price: number
  currency: string
  status: string
  verifiedAt: string
  createdAt: string
  userEmail: string
  magazineTitle: string
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 페이지네이션 상태
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      const response = await fetch(`/api/purchases?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch purchases')
      }

      setPurchases(data.purchases)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }, [page])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  if (isInitialLoad) {
    return (
      <>
        <Header title="구매 내역" />
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
        <Header title="구매 내역" />
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
      <Header title="구매 내역" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">구매 내역</h2>
                <span className="text-sm text-gray-500">
                  총 {total}건
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        구매 일시
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매거진
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        플랫폼
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가격
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-sm text-gray-500">
                              로딩 중...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : purchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-gray-500">
                            구매 내역이 없습니다.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      purchases.map(purchase => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dayjs(purchase.createdAt).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.userEmail}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {purchase.magazineTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                purchase.platform === 'ios'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {purchase.platform.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {purchase.price.toLocaleString()} {purchase.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                purchase.status === 'verified'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {purchase.status}
                            </span>
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
