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

    // profiles 테이블에서 조회 (Service Role 사용)
    const supabaseAdmin = await supabaseServerClient(true)

    // 검색 쿼리 구성
    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, name, providers, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    // 페이지네이션 적용
    const { data: users, error: usersError, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1,
    )
    console.log(users)

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError },
        { status: 500 },
      )
    }

    // 데이터 포맷 변환
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email || 'N/A',
      name: user.name || 'N/A',
      providers: user.providers || 'N/A',
      createdAt: user.created_at,
    }))

    const total = count || 0
    console.log(total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
