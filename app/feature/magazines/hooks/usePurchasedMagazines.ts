import { useState, useEffect, useCallback } from 'react'

import { useAuth } from '@/feature/auth/components'
import { supabase } from '@/feature/shared/lib'

import type { Magazine } from '../types'

export function usePurchasedMagazines() {
  const { user } = useAuth()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPurchasedMagazines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 현재 로그인한 사용자 가져오기
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setMagazines([])
        setLoading(false)
        return
      }

      // purchases 테이블에서 해당 사용자의 구매 내역 조회
      // status가 'verified'인 것만 가져옴
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('magazine_id')
        .eq('user_id', userData.user.id)
        .eq('status', 'verified')

      if (purchasesError) {
        throw purchasesError
      }

      if (!purchases || purchases.length === 0) {
        setMagazines([])
        setLoading(false)
        return
      }

      // 구매한 매거진 ID 목록
      const magazineIds = purchases.map(p => p.magazine_id)

      // magazines 테이블에서 해당 매거진 정보 조회
      const { data: magazinesData, error: magazinesError } = await supabase
        .from('magazines')
        .select('*')
        .in('id', magazineIds)
        .order('created_at', { ascending: false })

      if (magazinesError) {
        throw magazinesError
      }

      setMagazines(magazinesData || [])
    } catch (err) {
      console.error('구매한 매거진 조회 실패:', err)
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      )
      setMagazines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchasedMagazines()
  }, [fetchPurchasedMagazines, user])

  return {
    magazines,
    loading,
    error,
    refetch: fetchPurchasedMagazines,
  }
}
