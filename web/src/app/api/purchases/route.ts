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
    const search = searchParams.get('search') || ''

    // 사용자 정보를 별도로 조회 (Service Role 필요)
    const supabaseAdmin = await supabaseServerClient(true)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()

    // user_id로 이메일 매핑
    const userEmailMap = new Map(
      users.users.map(u => [u.id, u.email || 'N/A']),
    )

    // 검색어가 있으면 매칭되는 user_id, magazine_id 목록 추출
    let searchFilter: string | null = null
    if (search) {
      const searchLower = search.toLowerCase()

      // 이메일 매칭 user_id 목록
      const matchedUserIds = users.users
        .filter(u => u.email?.toLowerCase().includes(searchLower))
        .map(u => u.id)

      // 매거진 제목 매칭 magazine_id 목록
      const { data: matchedMagazines } = await supabase
        .from('magazines')
        .select('id')
        .ilike('title', `%${search}%`)

      const matchedMagazineIds = (matchedMagazines || []).map(m => m.id)

      // OR 필터 조건 조합
      const conditions: string[] = []
      if (matchedUserIds.length > 0) {
        conditions.push(`user_id.in.(${matchedUserIds.join(',')})`)
      }
      if (matchedMagazineIds.length > 0) {
        conditions.push(`magazine_id.in.(${matchedMagazineIds.join(',')})`)
      }

      // 매칭 결과 없으면 빈 결과 반환
      if (conditions.length === 0) {
        const { count: totalAll } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })

        return NextResponse.json({
          success: true,
          purchases: [],
          total: 0,
          totalAll: totalAll || 0,
          page,
          limit,
          totalPages: 0,
        })
      }

      searchFilter = conditions.join(',')
    }

    // 구매 내역 조회 (magazine 정보만 join)
    // RLS policy로 admin은 모든 구매 내역 조회 가능
    let query = supabase
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

    if (searchFilter) {
      query = query.or(searchFilter)
    }

    const { data: purchases, error, count: totalFiltered } = await query.range(
      (page - 1) * limit,
      page * limit - 1,
    )

    if (error) {
      console.error('Failed to fetch purchases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchases', details: error },
        { status: 500 },
      )
    }

    // 전체 구매 건수 (검색 없이)
    const { count: totalAll } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })

    // 데이터 포맷 변환
    const formattedPurchases = (purchases || []).map(purchase => ({
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

    const total = totalFiltered || 0

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      total,
      totalAll: totalAll || 0,
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
