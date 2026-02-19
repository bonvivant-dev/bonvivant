import { NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await supabaseServerClient()

    // 관리자 권한 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 },
      )
    }

    const { count, error } = await supabase
      .from('push_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('notifications_enabled', true)

    if (error) {
      throw error
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '수신 인원 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    )
  }
}
