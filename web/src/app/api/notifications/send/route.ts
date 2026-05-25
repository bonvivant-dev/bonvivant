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

    // 알림 수신 허용된 푸시 토큰 가져오기
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('notifications_enabled', true)

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
      data: {
        url: 'bonvivant://(tabs)',
      },
    }))

    // Expo Push API는 한 요청당 최대 100개 메시지만 허용하므로 100개씩 분할 전송
    const CHUNK_SIZE = 100
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE)

      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.errors?.[0]?.message || '알 수 없는 오류',
          )
        }

        sentCount += chunk.length
      } catch (chunkError) {
        failedCount += chunk.length
        console.error(
          `Expo Push 청크 전송 실패 (${i}~${i + chunk.length}):`,
          chunkError instanceof Error ? chunkError.message : chunkError,
        )
      }
    }

    // 모든 청크가 실패한 경우 에러 응답
    if (sentCount === 0) {
      return NextResponse.json(
        { error: 'Expo Push API 오류: 알림 전송에 모두 실패했습니다.' },
        { status: 500 },
      )
    }

    // 히스토리에 저장 (실제 성공 건수 기준)
    await supabase.from('notification_history').insert({
      title,
      body,
      sent_by: user.id,
      sent_count: sentCount,
    })

    return NextResponse.json({
      message:
        failedCount > 0
          ? `${sentCount}명에게 알림을 전송했습니다. (${failedCount}명 전송 실패)`
          : '알림이 성공적으로 전송되었습니다.',
      sentCount,
      failedCount,
    })
  } catch (error) {
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
