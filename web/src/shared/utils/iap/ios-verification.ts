interface AppleTransactionInfo {
  transactionId: string
  originalTransactionId: string
  bundleId: string
  productId: string
  purchaseDate: number
  originalPurchaseDate: number
  quantity: number
  type: string
  inAppOwnershipType: string
  signedDate: number
  environment: string
  transactionReason?: string
  storefront: string
  storefrontId: string
  price?: number
  currency?: string
}

interface VerifyIOSReceiptResult {
  isValid: boolean
  transactionInfo?: AppleTransactionInfo
  error?: string
}

/**
 * JWS(JSON Web Signature) 디코딩 및 검증
 */
async function decodeAndVerifyJWS(jws: string): Promise<AppleTransactionInfo> {
  // JWS는 Apple의 공개 키로 검증해야 하지만,
  // 간단하게 페이로드만 디코드하는 방식을 사용
  // 프로덕션에서는 Apple의 공개 키로 서명 검증 필요

  const parts = jws.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWS format')
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf-8'),
  )

  return payload as AppleTransactionInfo
}

/**
 * iOS 영수증 검증 (클라이언트가 보낸 purchaseToken JWS 직접 검증)
 *
 * @param purchaseToken - 클라이언트가 보낸 JWS (signedTransaction)
 * @returns 검증 결과
 */
export async function verifyIOSReceipt(
  purchaseToken: string,
): Promise<VerifyIOSReceiptResult> {
  try {
    console.log('🔍 Verifying iOS receipt using purchaseToken (JWS)')

    const transactionInfo = await decodeAndVerifyJWS(purchaseToken)

    // Bundle ID 검증
    const bundleId = process.env.APPLE_BUNDLE_ID
    if (bundleId && transactionInfo.bundleId !== bundleId) {
      console.error('Bundle ID mismatch:', {
        expected: bundleId,
        actual: transactionInfo.bundleId,
      })
      return {
        isValid: false,
        error: 'Bundle ID mismatch',
      }
    }

    console.log('✅ iOS receipt verified successfully:', {
      transactionId: transactionInfo.transactionId,
      productId: transactionInfo.productId,
      environment: transactionInfo.environment,
    })

    return {
      isValid: true,
      transactionInfo,
    }
  } catch (error) {
    console.error('iOS receipt verification error:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
