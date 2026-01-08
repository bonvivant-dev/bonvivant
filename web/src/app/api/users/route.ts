import { NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET() {
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

    // 전체 사용자 목록 조회 (Service Role 필요)
    const supabaseAdmin = await supabaseServerClient(true)
    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError },
        { status: 500 },
      )
    }

    // 데이터 포맷 변환 (이메일, 이름, provider 추출)
    const formattedUsers = usersData.users.map(user => ({
      id: user.id,
      email: user.email || 'N/A',
      name:
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name ||
        'N/A',
      providers:
        user.app_metadata?.providers
          ?.map((provider: string) => provider)
          .filter(Boolean)
          .join(', ') || 'N/A',
      createdAt: user.created_at,
    }))

    // 가입일 기준 최신순 정렬
    formattedUsers.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
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
