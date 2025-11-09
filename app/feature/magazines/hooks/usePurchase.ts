import { useEffect, useState, useCallback } from 'react'
import { Platform, Alert } from 'react-native'
import {
  Purchase,
  useIAP,
  finishTransaction,
  ErrorCode,
} from 'react-native-iap'

import { supabase } from '@/feature/shared'

// API 베이스 URL (환경에 따라 변경)
const API_BASE_URL = __DEV__
  ? 'http://localhost:3030'
  : 'https://bonvivant-web.vercel.app'

export function usePurchase({
  magazineProductId,
  onSuccess,
}: {
  magazineProductId: string
  onSuccess?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    connected,
    fetchProducts,
    requestPurchase,
    products,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      const result = await validatePurchase(purchase)

      if (result) {
        await finishTransaction({
          purchase,
          isConsumable: true,
        })
        onSuccess?.()
      }
      setIsLoading(false)
    },
    onPurchaseError: error => {
      // 사용자 취소는 알림 표시 안 함
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert(
          '구매 실패',
          `onPurchaseError: ${error.message} ${error.code}`
        )
      }
      setIsLoading(false)
    },
  })

  // 상품 정보 가져오기
  useEffect(() => {
    if (!connected || !magazineProductId) return
    fetchProducts({ skus: [magazineProductId], type: 'in-app' })
  }, [connected, magazineProductId, fetchProducts])

  // 매거진 구매
  const buyMagazine = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: magazine, error: magazineError } = await supabase
        .from('magazines')
        .select('*')
        .eq('product_id', magazineProductId)
        .single()
      if (magazineError || !magazine) {
        setIsLoading(false)
        Alert.alert('구매 실패', '매거진을 찾을 수 없습니다.')
        return
      }

      // 상품이 로드되었는지 확인
      if (!products || products.length === 0) {
        setIsLoading(false)
        Alert.alert(
          'SKU not found',
          `상품 ID "${magazineProductId}"를 찾을 수 없습니다.\n\n확인사항:\n- App Store Connect에서 상품이 "Ready to Submit" 상태인지\n- 번들 ID가 일치하는지\n- 상품 동기화 시간이 충분한지 (수 시간 소요)`
        )
        return
      }
      await requestPurchase({
        request: {
          ios: { sku: magazineProductId },
          android: { skus: [magazineProductId] },
        },
        type: 'in-app',
      })

      return {
        success: true,
      }
    } catch (error) {
      Alert.alert(
        '구매 실패',
        error instanceof Error
          ? error.message
          : 'buyMagazine 구매에 실패했습니다.'
      )
      setIsLoading(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : '구매에 실패했습니다.',
      }
    }
  }, [magazineProductId, requestPurchase, products])

  // 영수증 검증
  const validatePurchase = async (purchase: Purchase) => {
    try {
      // 서버 측 검증 및 DB 저장
      // (클라이언트 검증은 보안상 제거하고 서버 검증만 사용)
      const { data: magazine, error: magazineError } = await supabase
        .from('magazines')
        .select('id, price')
        .eq('product_id', magazineProductId)
        .single()

      if (magazineError || !magazine) {
        throw new Error('매거진을 찾을 수 없습니다.')
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('로그인이 필요합니다.')
      }

      const response = await fetch(`${API_BASE_URL}/api/purchases/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          magazineId: magazine.id,
          productId: magazineProductId,
          transactionId: purchase.transactionId,
          purchaseToken: purchase.purchaseToken,
          platform: Platform.OS,
          price: magazine.price,
          currency: 'KRW',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '서버 검증에 실패했습니다.')
      }

      return true
    } catch (error) {
      console.error('Validation failed:', error)
      Alert.alert(
        '영수증 검증 실패',
        error instanceof Error ? error.message : '영수증 검증에 실패했습니다.'
      )
      return false
    }
  }

  return {
    isLoading,
    buyMagazine,
    connected,
    products, // 디버깅용 추가
  }
}
