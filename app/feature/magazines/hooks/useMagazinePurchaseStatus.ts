import { useState, useEffect, useCallback } from 'react'

import { supabase } from '@/feature/shared/lib'

export function useMagazinePurchaseStatus(magazineId: string | null) {
  const [isPurchased, setIsPurchased] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const checkPurchaseStatus = useCallback(async () => {
    if (!magazineId) {
      setIsPurchased(false)
      return
    }

    try {
      setIsChecking(true)

      // 현재 로그인한 사용자 가져오기
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setIsPurchased(false)
        return
      }

      // purchases 테이블에서 해당 매거진의 구매 내역 확인
      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('magazine_id', magazineId)
        .eq('status', 'verified')
        .maybeSingle()

      if (error) {
        console.error('구매 확인 실패:', error)
        setIsPurchased(false)
        return
      }

      setIsPurchased(!!data)
    } catch (error) {
      console.error('구매 확인 에러:', error)
      setIsPurchased(false)
    } finally {
      setIsChecking(false)
    }
  }, [magazineId])

  useEffect(() => {
    checkPurchaseStatus()
  }, [checkPurchaseStatus])

  return {
    isPurchased,
    isChecking,
    refetch: checkPurchaseStatus,
  }
}
