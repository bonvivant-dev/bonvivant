import { useState, useCallback } from 'react'
import { Platform, Alert } from 'react-native'
import {
  Purchase,
  getAvailablePurchases,
  finishTransaction,
} from 'react-native-iap'

import { supabase } from '@/feature/shared'

// API 베이스 URL (환경에 따라 변경)
const API_BASE_URL = __DEV__
  ? 'http://localhost:3030'
  : 'https://bonvivant-web.vercel.app'

export function usePurchaseRestore() {
  const [isRestoring, setIsRestoring] = useState(false)

  // 영수증 검증 함수
  const validatePurchase = useCallback(async (purchase: Purchase) => {
    try {
      // transactionId 추출
      const transactionId =
        Platform.OS === 'android'
          ? purchase.transactionId ||
            (purchase as any).orderId ||
            purchase.purchaseToken
          : purchase.transactionId || purchase.purchaseToken

      // 매거진 정보 가져오기
      const { data: magazine, error: magazineError } = await supabase
        .from('magazines')
        .select('id, price')
        .eq('product_id', purchase.productId)
        .single()

      if (magazineError || !magazine) {
        console.warn(`Magazine not found for product: ${purchase.productId}`)
        return false
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('로그인이 필요합니다.')
      }

      const requestBody = {
        magazineId: magazine.id,
        productId: purchase.productId,
        transactionId,
        purchaseToken: purchase.purchaseToken,
        platform: Platform.OS,
        price: magazine.price,
        currency: 'KRW',
        rawPurchase: purchase,
      }

      const response = await fetch(`${API_BASE_URL}/api/purchases/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Verification failed:', result)
        return false
      }

      return true
    } catch (error) {
      console.error('Purchase validation error:', error)
      return false
    }
  }, [])

  // 구매 복원
  const restorePurchases = useCallback(async () => {
    setIsRestoring(true)
    try {
      // 로그인 확인
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        Alert.alert('오류', '로그인이 필요합니다.')
        setIsRestoring(false)
        return { success: false, error: '로그인이 필요합니다.' }
      }

      // 이전에 구매한 모든 항목 가져오기
      const availablePurchases = await getAvailablePurchases()

      if (!availablePurchases || availablePurchases.length === 0) {
        Alert.alert('구매 복원', '복원할 구매 내역이 없습니다.')
        setIsRestoring(false)
        return { success: true, restoredCount: 0 }
      }

      let successCount = 0
      let failureCount = 0

      // 각 구매 항목에 대해 검증 및 복원 수행
      for (const purchase of availablePurchases) {
        try {
          const result = await validatePurchase(purchase)

          if (result) {
            successCount++
          } else {
            failureCount++
          }

          // 검증 후 트랜잭션 종료
          await finishTransaction({
            purchase,
            isConsumable: true,
          })
        } catch (error) {
          console.error('Purchase restoration error:', error)
          failureCount++
        }
      }

      setIsRestoring(false)

      // 결과 메시지 표시
      if (successCount > 0) {
        Alert.alert(
          '구매 복원 완료',
          `${successCount}개의 구매 내역이 복원되었습니다.`
        )
      } else if (failureCount > 0) {
        Alert.alert(
          '구매 복원',
          '복원할 구매 내역이 없거나 이미 복원되었습니다.'
        )
      }

      return {
        success: successCount > 0 || failureCount === 0,
        restoredCount: successCount,
        failedCount: failureCount,
      }
    } catch (error) {
      setIsRestoring(false)
      Alert.alert(
        '구매 복원 실패',
        error instanceof Error
          ? error.message
          : '구매 복원에 실패했습니다. 잠시 후 다시 시도해주세요.'
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : '구매 복원 실패',
      }
    }
  }, [validatePurchase])

  return {
    isRestoring,
    restorePurchases,
  }
}
