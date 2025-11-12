import { NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET() {
  try {
    // 관리자 인증 체크 (필요시 추가)
    const supabase = await supabaseServerClient(true) // Admin client 사용

    // 구매 내역 조회 (magazine 정보만 join)
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select(
        `
        id,
        transaction_id,
        platform,
        product_id,
        price,
        currency,
        status,
        verified_at,
        created_at,
        user_id,
        magazine_id,
        magazines(title)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch purchases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchases', details: error },
        { status: 500 },
      )
    }

    // 사용자 정보를 별도로 조회
    const { data: users } = await supabase.auth.admin.listUsers()

    // user_id로 이메일 매핑
    const userEmailMap = new Map(
      users.users.map(user => [user.id, user.email || 'N/A']),
    )

    // 데이터 포맷 변환
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      transactionId: purchase.transaction_id,
      platform: purchase.platform,
      productId: purchase.product_id,
      price: purchase.price,
      currency: purchase.currency,
      status: purchase.status,
      verifiedAt: purchase.verified_at,
      createdAt: purchase.created_at,
      userEmail: userEmailMap.get(purchase.user_id) || 'N/A',
      magazineTitle: (purchase.magazines as any)?.title || 'N/A',
    }))

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      total: formattedPurchases.length,
    })
  } catch (error) {
    console.error('Get purchases error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
