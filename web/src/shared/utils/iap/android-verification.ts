import { google } from 'googleapis'

interface AndroidProductPurchase {
  kind: string
  purchaseTimeMillis: string
  purchaseState: number // 0: Purchased, 1: Canceled, 2: Pending
  consumptionState: number // 0: Yet to be consumed, 1: Consumed
  developerPayload?: string
  orderId: string
  purchaseType?: number
  acknowledgementState: number // 0: Yet to be acknowledged, 1: Acknowledged
  purchaseToken: string
  productId: string
  quantity?: number
  obfuscatedExternalAccountId?: string
  obfuscatedExternalProfileId?: string
  regionCode?: string
}

interface VerifyAndroidReceiptResult {
  isValid: boolean
  purchaseInfo?: AndroidProductPurchase
  error?: string
}

/**
 * Google Play Developer API를 사용한 영수증 검증
 *
 * @param packageName - 앱의 패키지 이름
 * @param productId - 상품 ID
 * @param purchaseToken - 구매 토큰
 * @returns 검증 결과
 */
export async function verifyAndroidReceipt(
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<VerifyAndroidReceiptResult> {
  try {
    // 1. Google Service Account 인증
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKey) {
      return {
        isValid: false,
        error: 'Missing Google Service Account Key',
      }
    }

    // Service Account Key 파싱 (JSON 문자열 또는 Base64)
    let credentials
    try {
      // JSON 문자열인 경우
      credentials = JSON.parse(serviceAccountKey)
    } catch {
      // Base64로 인코딩된 경우
      try {
        const decoded = Buffer.from(serviceAccountKey, 'base64').toString(
          'utf-8',
        )
        credentials = JSON.parse(decoded)
      } catch {
        return {
          isValid: false,
          error: 'Invalid Service Account Key format',
        }
      }
    }

    // 2. Google Auth 클라이언트 생성
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })

    const authClient = await auth.getClient()

    // 3. Google Play Developer API 클라이언트 생성
    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: authClient as any,
    })

    // 4. 구매 정보 조회
    const response = await androidPublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
    })

    if (!response.data) {
      return {
        isValid: false,
        error: 'No purchase data in response',
      }
    }

    const purchaseInfo = response.data as AndroidProductPurchase

    // 5. 구매 상태 검증
    // purchaseState: 0 = Purchased, 1 = Canceled, 2 = Pending
    if (purchaseInfo.purchaseState !== 0) {
      return {
        isValid: false,
        error: `Invalid purchase state: ${purchaseInfo.purchaseState}`,
      }
    }

    return {
      isValid: true,
      purchaseInfo,
    }
  } catch (error) {
    console.error('Android receipt verification error:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
