import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient()

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      )
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 구매 내역 조회 (magazine 정보만 join)
    // RLS policy로 admin은 모든 구매 내역 조회 가능
    const { data: purchases, error, count } = await supabase
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
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Failed to fetch purchases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchases', details: error },
        { status: 500 },
      )
    }

    // 사용자 정보를 별도로 조회 (Service Role 필요)
    const supabaseAdmin = await supabaseServerClient(true)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()

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

    const total = count || 0

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
