import { NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

const DEFAULT_PASSWORD = 'bonvivant2026'

export async function POST(request: Request) {
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

    // 요청 본문에서 userId 추출
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      )
    }

    // Service Role로 비밀번호 업데이트
    const supabaseAdmin = await supabaseServerClient(true)
    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: DEFAULT_PASSWORD,
      })

    if (updateError) {
      console.error('Failed to reset password:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password', details: updateError },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `비밀번호가 '${DEFAULT_PASSWORD}'로 초기화되었습니다.`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
