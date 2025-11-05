import { SignJWT, importPKCS8 } from 'jose'

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
 * App Store Connect API용 JWT 토큰 생성
 */
async function generateAppStoreConnectToken(): Promise<string> {
  const keyId = process.env.APPLE_KEY_ID
  const issuerId = process.env.APPLE_ISSUER_ID
  const privateKey = process.env.APPLE_PRIVATE_KEY

  if (!keyId || !issuerId || !privateKey) {
    throw new Error('Missing Apple credentials in environment variables')
  }

  // Private Key 파싱 (Base64 또는 PEM 형식 모두 지원)
  let pemKey = privateKey
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    // Base64로 인코딩된 경우 디코딩
    pemKey = Buffer.from(privateKey, 'base64').toString('utf-8')
  }

  // PKCS8 형식의 Private Key 가져오기
  const privateKeyObject = await importPKCS8(pemKey, 'ES256')

  const jwt = await new SignJWT({})
    .setProtectedHeader({
      alg: 'ES256',
      kid: keyId,
      typ: 'JWT',
    })
    .setIssuedAt()
    .setIssuer(issuerId)
    .setAudience('appstoreconnect-v1')
    .setExpirationTime('10m')
    .sign(privateKeyObject)

  return jwt
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
    Buffer.from(parts[1], 'base64url').toString('utf-8')
  )

  return payload as AppleTransactionInfo
}

/**
 * iOS App Store Server API를 사용한 영수증 검증
 *
 * @param transactionId - App Store에서 발급한 트랜잭션 ID
 * @returns 검증 결과
 */
export async function verifyIOSReceipt(
  transactionId: string
): Promise<VerifyIOSReceiptResult> {
  try {
    // 1. JWT 토큰 생성
    const token = await generateAppStoreConnectToken()

    // 2. App Store Server API 호출
    const isProduction = process.env.NODE_ENV === 'production'
    const baseURL = isProduction
      ? 'https://api.storekit.itunes.apple.com'
      : 'https://api.storekit-sandbox.itunes.apple.com'

    const response = await fetch(
      `${baseURL}/inApps/v1/transactions/${transactionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        isValid: false,
        error: `Apple API error: ${errorData.errorMessage || response.statusText}`,
      }
    }

    const data = await response.json()

    // 3. JWS 디코딩
    if (!data.signedTransaction) {
      return {
        isValid: false,
        error: 'No signed transaction in response',
      }
    }

    const transactionInfo = await decodeAndVerifyJWS(data.signedTransaction)

    // 4. 트랜잭션 정보 검증
    const bundleId = process.env.APPLE_BUNDLE_ID
    if (bundleId && transactionInfo.bundleId !== bundleId) {
      return {
        isValid: false,
        error: 'Bundle ID mismatch',
      }
    }

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
