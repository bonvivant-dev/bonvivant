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
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 },
      )
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

    // iOS의 경우 rawPurchase.id가 실제 transactionId (JWS 아님)
    const actualTransactionId = platform === 'ios' && rawPurchase?.id
      ? rawPurchase.id
      : transactionId

    console.log('📥 Received purchase verification request:', {
      magazineId,
      productId,
      actualTransactionId,
      platform,
      price,
      currency,
    })

    // 필수 필드 검증
    if (!magazineId || !productId || !actualTransactionId || !purchaseToken) {
      console.error('❌ Missing required fields:', {
        magazineId: !!magazineId,
        productId: !!productId,
        actualTransactionId: !!actualTransactionId,
        purchaseToken: !!purchaseToken,
      })
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            magazineId: !!magazineId,
            productId: !!productId,
            actualTransactionId: !!actualTransactionId,
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
      .eq('transaction_id', actualTransactionId)
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
      // iOS의 경우 purchaseToken(JWS)만 전달
      verificationResult = await verifyIOSReceipt(purchaseToken)
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
        console.error('❌ Product ID mismatch:', {
          expected: productId,
          actual: transactionInfo.productId,
        })
        return NextResponse.json(
          { error: 'Product ID mismatch' },
          { status: 400 },
        )
      }

      console.log('✅ iOS receipt validation passed')
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
    console.log('💾 Saving purchase to database...')
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: user.id,
        magazine_id: magazineId,
        transaction_id: actualTransactionId,
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
      console.error('❌ Purchase save error:', purchaseError)

      // 중복 키 에러 (race condition)인 경우 기존 purchase 반환
      if (purchaseError.code === '23505') {
        const { data: existingPurchase } = await supabaseAdmin
          .from('purchases')
          .select()
          .eq('transaction_id', actualTransactionId)
          .single()

        if (existingPurchase) {
          console.log('Race condition detected: returning existing purchase')
          return NextResponse.json({
            success: true,
            purchase: existingPurchase,
            note: 'Purchase already exists (race condition handled)',
          })
        }
      }

      return NextResponse.json(
        { error: 'Failed to save purchase' },
        { status: 500 },
      )
    }

    console.log('✅ Purchase saved successfully:', purchase.id)

    // transaction_logs에 로그 저장 (Service Role로 RLS 우회)
    console.log('📝 Saving transaction log...')
    const { error: logError } = await supabaseAdmin
      .from('transaction_logs')
      .insert({
        user_id: user.id,
        magazine_id: magazineId,
        purchase_id: purchase.id,
        transaction_id: actualTransactionId,
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
      console.error('⚠️ Transaction log error:', logError)
      // 로그 저장 실패는 에러로 처리하지 않음
    } else {
      console.log('✅ Transaction log saved')
    }

    console.log('🎉 Sending success response')
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
