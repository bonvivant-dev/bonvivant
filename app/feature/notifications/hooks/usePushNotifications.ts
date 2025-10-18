import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { supabase } from '@/feature/shared'

// 알림이 포그라운드에서 왔을 때 어떻게 처리할지 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function usePushNotifications() {
  const router = useRouter()
  const [expoPushToken, setExpoPushToken] = useState<string>('')
  const [notification, setNotification] =
    useState<Notifications.Notification>()
  const notificationListener =
    useRef<Notifications.EventSubscription | undefined>(undefined)
  const responseListener =
    useRef<Notifications.EventSubscription | undefined>(undefined)

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token)
        // 토큰을 DB에 저장
        savePushToken(token)
      }
    })

    // 알림이 수신되었을 때 (앱이 포그라운드일 때)
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('알림 수신:', notification)
        setNotification(notification)
      })

    // 사용자가 알림을 탭했을 때
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('알림 탭:', response)
        // 테스트: 메인 페이지(홈 탭)로 이동
        router.push('/(tabs)')
      })

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [router])

  return {
    expoPushToken,
    notification,
  }
}

async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      alert('푸시 알림 권한이 필요합니다!')
      return
    }

    // Expo Push Token 가져오기
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: 'f8aa4906-9f3f-4185-ba7d-05fad9da9fad',
      })
    ).data
    console.log('Expo Push Token:', token)
  } else {
    alert('실제 기기에서만 푸시 알림을 사용할 수 있습니다.')
  }

  return token
}

async function savePushToken(token: string) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id || null

    // 이미 존재하는 토큰인지 확인
    const { data: existing } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('expo_push_token', token)
      .maybeSingle()

    if (existing) {
      console.log('이미 등록된 푸시 토큰입니다.')
      return
    }

    // 새 토큰 저장
    const { error } = await supabase.from('push_tokens').insert({
      user_id: userId,
      expo_push_token: token,
      device_type: Platform.OS as 'ios' | 'android',
    })

    if (error) {
      console.error('푸시 토큰 저장 실패:', error)
    } else {
      console.log('푸시 토큰 저장 성공')
    }
  } catch (error) {
    console.error('푸시 토큰 저장 에러:', error)
  }
}
