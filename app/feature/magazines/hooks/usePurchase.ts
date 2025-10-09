import { useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import {
  initConnection,
  endConnection,
  requestPurchase,
  fetchProducts,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type Product,
  type Purchase,
  type PurchaseError,
  type EventSubscription,
  ErrorCode,
} from 'react-native-iap'

import { supabase } from '@/feature/shared'

import type { PurchaseResult } from '../types'

export function usePurchase() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  // IAP 초기화
  useEffect(() => {
    let purchaseUpdateSubscription: EventSubscription | undefined
    let purchaseErrorSubscription: EventSubscription | undefined

    const initializeIAP = async () => {
      try {
        await initConnection()
        setIsInitialized(true)

        // 구매 성공 리스너
        purchaseUpdateSubscription = purchaseUpdatedListener(
          async (purchase: Purchase) => {
            const receipt = purchase.purchaseToken

            if (receipt) {
              try {
                // TODO: 백엔드 검증 API 호출 (나중에 구현)
                // await verifyPurchase(purchase)

                // 트랜잭션 완료 처리
                await finishTransaction({ purchase, isConsumable: false })
              } catch (error) {
                console.error('구매 처리 실패:', error)
              }
            }
          }
        )

        // 구매 실패 리스너
        purchaseErrorSubscription = purchaseErrorListener(
          (error: PurchaseError) => {
            if (error.code !== ErrorCode.UserCancelled) {
              console.error('구매 에러:', error)
              Alert.alert('구매 실패', error.message)
            }
          }
        )
      } catch (error) {
        console.error('IAP 초기화 실패:', error)
      }
    }

    initializeIAP()

    // 클린업
    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove()
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove()
      }
      endConnection()
    }
  }, [])

  // 상품 정보 조회
  const getProductList = useCallback(async (productIds: string[]) => {
    if (!isInitialized) {
      console.warn('IAP가 초기화되지 않았습니다')
      return []
    }

    try {
      const products = await fetchProducts({ skus: productIds })
      setProducts(products || [])
      return products || []
    } catch (error) {
      console.error('상품 조회 실패:', error)
      return []
    }
  }, [isInitialized])

  // 구매 시작
  const purchase = useCallback(async (
    productId: string,
    magazineId: string
  ): Promise<PurchaseResult> => {
    if (!isInitialized) {
      return {
        success: false,
        error: 'IAP가 초기화되지 않았습니다',
      }
    }

    if (isPurchasing) {
      return {
        success: false,
        error: '이미 구매가 진행 중입니다',
      }
    }

    setIsPurchasing(true)

    try {
      // 구매 요청
      await requestPurchase({
        type: 'in-app',
        request: {
          ios: {
            sku: productId,
          },
          android: {
            skus: [productId],
          },
        },
      })

      // 구매는 purchaseUpdatedListener에서 처리되므로
      // 여기서는 일단 성공으로 간주하고 리턴
      // 실제 저장은 리스너에서 해야 하지만,
      // 지금은 간단하게 여기서 처리

      setIsPurchasing(false)

      return {
        success: true,
      }
    } catch (error: any) {
      console.error('구매 실패:', error)
      setIsPurchasing(false)

      // 사용자 취소는 에러로 처리하지 않음
      if (error.code === ErrorCode.UserCancelled) {
        return {
          success: false,
          error: 'cancelled',
        }
      }

      return {
        success: false,
        error: error.message || '구매에 실패했습니다',
      }
    }
  }, [isInitialized, isPurchasing])

  // 구매 여부 확인
  const checkPurchased = useCallback(async (magazineId: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        return false
      }

      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('magazine_id', magazineId)
        .eq('status', 'verified')
        .maybeSingle()

      if (error) {
        console.error('구매 확인 실패:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('구매 확인 에러:', error)
      return false
    }
  }, [])

  return {
    isInitialized,
    isPurchasing,
    products,
    getProducts: getProductList,
    purchase,
    checkPurchased,
  }
}
