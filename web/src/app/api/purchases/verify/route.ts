import { NextRequest, NextResponse } from 'next/server'

import { verifyIOSReceipt, verifyAndroidReceipt } from '@/shared/utils/iap'
import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface VerifyPurchaseRequest {
  magazineId: string
  productId: string
  transactionId: string
  purchaseToken: string
  platform: 'ios' | 'android'
  price?: number
  currency?: string
  rawPurchase?: any // 🔍 디버깅용: purchase 객체 전체
}

export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 Bearer 토큰 추출
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    // 사용자 인증용 클라이언트 (일반 키)
    const supabase = await supabaseServerClient()

    // Bearer 토큰으로 사용자 인증
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // DB 작업용 클라이언트 (Service Role - RLS 우회)
    const supabaseAdmin = await supabaseServerClient(true)

    const body: VerifyPurchaseRequest = await request.json()
    const {
      magazineId,
      productId,
      transactionId,
      purchaseToken,
      platform,
      price,
      currency,
      rawPurchase,
    } = body

    console.log('📥 Received purchase verification request:', {
      magazineId,
      productId,
      transactionId,
      purchaseToken: purchaseToken ? '✅ exists' : '❌ missing',
      platform,
      price,
      currency,
    })

    // 🔍 디버깅: purchase 객체 전체 로그
    if (rawPurchase) {
      console.log('🔍 Raw Purchase Object:')
      console.log(JSON.stringify(rawPurchase, null, 2))
    }

    // 필수 필드 검증
    if (!magazineId || !productId || !transactionId || !purchaseToken) {
      console.error('❌ Missing required fields:', {
        magazineId: !!magazineId,
        productId: !!productId,
        transactionId: !!transactionId,
        purchaseToken: !!purchaseToken,
      })
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            magazineId: !!magazineId,
            productId: !!productId,
            transactionId: !!transactionId,
            purchaseToken: !!purchaseToken,
          },
        },
        { status: 400 },
      )
    }

    // 중복 구매 확인
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Purchase already exists', purchaseId: existingPurchase.id },
        { status: 409 },
      )
    }

    // 매거진 정보 조회
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('product_id, price, is_purchasable')
      .eq('id', magazineId)
      .single()

    if (magazineError || !magazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    // 상품 ID 검증
    if (magazine.product_id !== productId) {
      return NextResponse.json(
        { error: 'Product ID mismatch' },
        { status: 400 },
      )
    }

    // 실제 Apple/Google 영수증 검증
    let verificationResult
    if (platform === 'ios') {
      verificationResult = await verifyIOSReceipt(transactionId)
      if (!verificationResult.isValid) {
        return NextResponse.json(
          {
            error: 'iOS receipt verification failed',
            details: verificationResult.error,
          },
          { status: 400 },
        )
      }

      // 검증된 트랜잭션 정보와 요청 데이터 비교
      const { transactionInfo } = verificationResult
      if (transactionInfo && transactionInfo.productId !== productId) {
        return NextResponse.json(
          { error: 'Product ID mismatch' },
          { status: 400 },
        )
      }
    } else if (platform === 'android') {
      // Android의 경우 packageName이 필요
      const packageName = process.env.ANDROID_PACKAGE_NAME
      if (!packageName) {
        return NextResponse.json(
          { error: 'Android package name not configured' },
          { status: 500 },
        )
      }

      verificationResult = await verifyAndroidReceipt(
        packageName,
        productId,
        purchaseToken,
      )

      if (!verificationResult.isValid) {
        return NextResponse.json(
          {
            error: 'Android receipt verification failed',
            details: verificationResult.error,
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 },
      )
    }

    // 구매 데이터 저장 (Service Role로 RLS 우회)
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: user.id,
        magazine_id: magazineId,
        transaction_id: transactionId,
        platform: platform,
        product_id: productId,
        price: price || magazine.price,
        currency: currency || 'KRW',
        status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase save error:', purchaseError)
      return NextResponse.json(
        { error: 'Failed to save purchase' },
        { status: 500 },
      )
    }

    // transaction_logs에 로그 저장 (Service Role로 RLS 우회)
    const { error: logError } = await supabaseAdmin.from('transaction_logs').insert({
      user_id: user.id,
      magazine_id: magazineId,
      purchase_id: purchase.id,
      transaction_id: transactionId,
      platform: platform,
      product_id: productId,
      price: price || magazine.price,
      currency: currency || 'KRW',
      status: 'success',
      raw_receipt: purchaseToken,
      request_data: rawPurchase || body,
      response_data: verificationResult,
    })

    if (logError) {
      console.error('Transaction log error:', logError)
      // 로그 저장 실패는 에러로 처리하지 않음
    }

    return NextResponse.json({
      success: true,
      purchase,
    })
  } catch (error) {
    console.error('Verify purchase error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
