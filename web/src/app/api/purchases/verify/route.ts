import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface VerifyPurchaseRequest {
  magazineId: string
  productId: string
  transactionId: string
  purchaseToken: string
  platform: 'ios' | 'android'
  price?: number
  currency?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: VerifyPurchaseRequest = await request.json()
    const {
      magazineId,
      productId,
      transactionId,
      purchaseToken,
      platform,
      price,
      currency,
    } = body

    // 필수 필드 검증
    if (!magazineId || !productId || !transactionId || !purchaseToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 중복 구매 확인
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Purchase already exists', purchaseId: existingPurchase.id },
        { status: 409 }
      )
    }

    // 매거진 정보 조회
    const { data: magazine, error: magazineError } = await supabase
      .from('magazines')
      .select('product_id, price, is_purchasable')
      .eq('id', magazineId)
      .single()

    if (magazineError || !magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    // 상품 ID 검증
    if (magazine.product_id !== productId) {
      return NextResponse.json(
        { error: 'Product ID mismatch' },
        { status: 400 }
      )
    }

    // TODO: 실제 Apple/Google 영수증 검증
    // iOS: https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
    // Android: https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products/get

    // 구매 데이터 저장
    const { data: purchase, error: purchaseError } = await supabase
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
        { status: 500 }
      )
    }

    // transaction_logs에 로그 저장
    const { error: logError } = await supabase.from('transaction_logs').insert({
      user_id: user.id,
      magazine_id: magazineId,
      transaction_id: transactionId,
      platform: platform,
      product_id: productId,
      price: price || magazine.price,
      currency: currency || 'KRW',
      status: 'success',
      raw_receipt: purchaseToken,
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
      { status: 500 }
    )
  }
}
