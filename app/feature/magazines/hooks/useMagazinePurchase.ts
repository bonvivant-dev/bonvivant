import { useRouter } from 'expo-router'
import { Alert } from 'react-native'

// import { usePurchasedMagazinesContext } from '../contexts'
import { Magazine } from '../types'

import { useMagazinePurchaseStatus } from './useMagazinePurchaseStatus'
// import { usePurchase } from './usePurchase'

interface UseMagazinePurchaseProps {
  magazine: Magazine | null
  onClose: () => void
}

/**
 * 매거진 구매 처리를 위한 통합 훅
 * MagazinePreviewModal과 MagazinePreviewBottomSheet에서 공통으로 사용
 */
export function useMagazinePurchase({
  magazine,
  onClose,
}: UseMagazinePurchaseProps) {
  const router = useRouter()
  // const { refetch: refetchPurchasedMagazines } = usePurchasedMagazinesContext()

  // 구매 여부 확인
  const { isPurchased, isChecking, refetch } = useMagazinePurchaseStatus(
    magazine?.id || null
  )

  // 실제 구매 처리
  // const purchaseHook = usePurchase({
  //   magazineProductId: magazine?.product_id || '',
  //   onSuccess: async () => {
  //     // 구매 상태 갱신
  //     await refetch()
  //     // 내 서재 목록 갱신
  //     await refetchPurchasedMagazines()
  //     onClose()
  //     router.push(`/magazine/${magazine?.id}/view`)
  //   },
  // })

  const handlePurchase = async () => {
    if (!magazine) return

    // 이미 구매한 경우 바로 이동
    if (isPurchased) {
      onClose()
      router.push(`/magazine/${magazine.id}/view`)
      return
    }

    // 구매 가능 여부 확인
    if (!magazine.is_purchasable || !magazine.product_id) {
      Alert.alert('알림', '현재 구매할 수 없는 매거진입니다.')
      return
    }

    // 구매 진행
    // await purchaseHook.buyMagazine()
  }

  return {
    handlePurchase,
    isPurchased,
    isChecking,
    refetch,
    // ...purchaseHook,
  }
}
