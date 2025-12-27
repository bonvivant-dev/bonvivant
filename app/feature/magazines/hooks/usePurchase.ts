import { useEffect, useState, useCallback, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import {
  Purchase,
  useIAP,
  finishTransaction,
  ErrorCode,
  getAvailablePurchases,
} from 'react-native-iap'

import { supabase } from '@/feature/shared/lib'

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
  const isValidatingRef = useRef(false)
  const processedTransactionsRef = useRef<Set<string>>(new Set())

  // 영수증 검증 함수를 먼저 선언
  const validatePurchase = useCallback(
    async (purchase: Purchase) => {
      // 🔒 STEP 1: 이미 검증 중이면 즉시 반환 (가장 먼저 체크)
      if (isValidatingRef.current) {
        return false
      }

      // 즉시 플래그 설정하여 동시 실행 차단
      isValidatingRef.current = true

      // transactionId 추출 (purchaseToken을 fallback으로 사용)
      const transactionId =
        Platform.OS === 'android'
          ? purchase.transactionId ||
            (purchase as any).orderId ||
            purchase.purchaseToken
          : purchase.transactionId || purchase.purchaseToken

      // 🔒 STEP 2: 이미 처리한 transaction인지 확인
      if (processedTransactionsRef.current.has(transactionId)) {
        isValidatingRef.current = false
        return false
      }

      // 즉시 추가하여 중복 호출 방지
      processedTransactionsRef.current.add(transactionId)

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

        const requestBody = {
          magazineId: magazine.id,
          productId: magazineProductId,
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
          const errorMessage = result.error || '서버 검증에 실패했습니다.'
          const details = result.details
            ? `\n\n상세 정보:\n${JSON.stringify(result.details, null, 2)}`
            : ''
          throw new Error(errorMessage + details)
        }

        // 검증 완료 후 Set에서 제거 (finishTransaction으로 완료되므로 더 이상 필요 없음)
        processedTransactionsRef.current.delete(transactionId)

        return true
      } catch (error) {
        // 실패 시 Set에서 제거하여 재시도 가능하게 함
        processedTransactionsRef.current.delete(transactionId)

        Alert.alert(
          '영수증 검증 실패',
          error instanceof Error ? error.message : '영수증 검증에 실패했습니다.'
        )
        return false
      } finally {
        isValidatingRef.current = false
      }
    },
    [magazineProductId]
  )

  // onPurchaseSuccess 콜백을 useCallback으로 메모이제이션
  // 이렇게 하지 않으면 매 렌더링마다 새로운 함수가 생성되어 useIAP에 중복 등록됨
  const handlePurchaseSuccess = useCallback(
    async (purchase: Purchase) => {
      // 🚨 중요: 이 훅이 처리해야 할 상품이 아니면 무시
      // useIAP는 전역적으로 이벤트를 리스닝하므로, 여러 인스턴스가 있으면 모두 호출됨
      if (purchase.productId !== magazineProductId) {
        return
      }

      try {
        const result = await validatePurchase(purchase)

        if (result) {
          onSuccess?.()
        }
      } finally {
        // 검증 성공/실패 여부와 관계없이 트랜잭션 종료
        // iOS는 finishTransaction이 호출되지 않으면 트랜잭션을 계속 pending으로 유지
        await finishTransaction({
          purchase,
          isConsumable: true,
        })
        setIsLoading(false)
      }
    },
    [magazineProductId, validatePurchase, onSuccess]
  )

  // onPurchaseError 콜백도 useCallback으로 메모이제이션
  const handlePurchaseError = useCallback((error: any) => {
    // 사용자 취소는 알림 표시 안 함
    if (error.code !== ErrorCode.UserCancelled) {
      Alert.alert(
        '구매 실패',
        `onPurchaseError: ${error.message} ${error.code}`
      )
    }
    setIsLoading(false)
  }, [])

  const { connected, fetchProducts, requestPurchase, products } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
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

  // 구매 복원
  const restorePurchases = useCallback(async () => {
    setIsLoading(true)
    try {
      // 이전에 구매한 모든 항목 가져오기
      const availablePurchases = await getAvailablePurchases()

      if (!availablePurchases || availablePurchases.length === 0) {
        Alert.alert('구매 복원', '복원할 구매 내역이 없습니다.')
        setIsLoading(false)
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

      setIsLoading(false)

      // 결과 메시지 표시
      if (successCount > 0) {
        Alert.alert(
          '구매 복원 완료',
          `${successCount}개의 구매 내역이 복원되었습니다.`
        )
        onSuccess?.()
      } else if (failureCount > 0) {
        Alert.alert(
          '구매 복원 실패',
          '구매 내역 복원에 실패했습니다.\n잠시 후 다시 시도해주세요.'
        )
      }

      return {
        success: successCount > 0,
        restoredCount: successCount,
        failedCount: failureCount,
      }
    } catch (error) {
      setIsLoading(false)
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
  }, [validatePurchase, onSuccess])

  return {
    isLoading,
    buyMagazine,
    restorePurchases,
    connected,
    products, // 디버깅용 추가
  }
}
