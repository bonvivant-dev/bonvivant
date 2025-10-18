import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface ExpoPushMessage {
  to: string
  title: string
  body: string
  sound?: 'default'
  data?: Record<string, any>
}

export async function POST(request: NextRequest) {
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

    // 요청 본문 파싱
    const { title, body } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 },
      )
    }

    // 모든 푸시 토큰 가져오기
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('expo_push_token')

    if (tokensError) {
      throw tokensError
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { message: '등록된 푸시 토큰이 없습니다.', sentCount: 0 },
        { status: 200 },
      )
    }

    // Expo Push 메시지 생성
    const messages: ExpoPushMessage[] = tokens.map(token => ({
      to: token.expo_push_token,
      title,
      body,
      sound: 'default',
    }))

    // Expo Push Notification API 호출
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Expo Push API 오류: ${errorData.errors?.[0]?.message || '알 수 없는 오류'}`,
      )
    }

    const result = await response.json()
    console.log('Expo Push 결과:', result)

    return NextResponse.json({
      message: '알림이 성공적으로 전송되었습니다.',
      sentCount: tokens.length,
      result,
    })
  } catch (error) {
    console.error('알림 전송 오류:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '알림 전송 중 오류가 발생했습니다.',
      },
      { status: 500 },
    )
  }
}
