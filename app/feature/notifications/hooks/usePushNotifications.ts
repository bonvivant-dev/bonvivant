import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'

import { useAuth } from '@/feature/auth'
import { supabase } from '@/feature/shared/lib'

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
  const { session } = useAuth()
  const [expoPushToken, setExpoPushToken] = useState<string>('')
  const [notification, setNotification] = useState<Notifications.Notification>()
  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined)
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined
  )

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        Alert.alert(
          '[D1]',
          `토큰: ${token ? `${token.substring(0, 30)}...` : 'null'}`
        )
        if (token) {
          setExpoPushToken(token)
        }
      })
      .catch(err => {
        Alert.alert('[D1 ERR]', String(err))
      })

    // 알림이 수신되었을 때 (앱이 포그라운드일 때)
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification)
      })

    // 사용자가 알림을 탭했을 때
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        // data.url이 있으면 해당 화면으로, 없으면 메인 탭으로
        const url = response.notification.request.content.data?.url
        if (url && typeof url === 'string') {
          // bonvivant:// 스킴 제거하고 경로만 추출
          const path = url.replace('bonvivant://', '')
          router.push(path as any)
        } else {
          router.push('/(tabs)')
        }
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

  // 토큰 DB 저장 (세션이 준비된 후에 실행)
  useEffect(() => {
    Alert.alert(
      '[D2]',
      `토큰: ${expoPushToken ? 'O' : 'X'}, 세션: ${session ? 'O' : 'X'}`
    )
    if (expoPushToken && session) {
      savePushToken(expoPushToken)
    }
  }, [expoPushToken, session])

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
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      return
    }

    // Expo Push Token 가져오기
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: 'f8aa4906-9f3f-4185-ba7d-05fad9da9fad',
      })
    ).data
  }

  return token
}

async function savePushToken(token: string) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id || null
    Alert.alert('[D3]', `userId: ${userId || 'null'}`)

    // DB에 이미 존재하는 토큰인지 확인
    const { data: existing } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('expo_push_token', token)
      .maybeSingle()

    if (existing) {
      Alert.alert('[D4]', 'DB에 이미 존재')
      return
    }

    // 새 토큰 저장
    const { error } = await supabase.from('push_tokens').insert({
      user_id: userId,
      expo_push_token: token,
      device_type: Platform.OS as 'ios' | 'android',
    })

    if (error) {
      Alert.alert('[D5 ERR]', error.message)
    } else {
      Alert.alert('[D5]', '저장 성공!')
    }
  } catch (error) {
    Alert.alert('[D ERR]', String(error))
  }
}
