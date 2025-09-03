import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { Tabs } from 'expo-router'
import { useEffect } from 'react'
import { Alert } from 'react-native'

import { AuthProvider, useAuth } from '../feature/auth'

function TabsLayout() {
  const { supabase } = useAuth()

  useEffect(() => {
    // Handle deep links for email confirmation
    const handleUrl = (url: string) => {
      const { hostname, path, queryParams } = Linking.parse(url)

      // Handle Supabase auth callback
      if (hostname === 'auth-callback' || path?.includes('auth-callback')) {
        const { access_token, refresh_token, type } = queryParams as any

        if (access_token && refresh_token) {
          supabase.auth
            .setSession({
              access_token,
              refresh_token,
            })
            .then(({ error }) => {
              if (error) {
                Alert.alert('인증 오류', error.message)
              } else if (type === 'signup') {
                Alert.alert('환영합니다!', '이메일 인증이 완료되었습니다.')
              }
            })
        }
      }
    }

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url)
    })

    // Handle initial URL (if app was opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl(url)
      }
    })

    return () => subscription?.remove()
  }, [supabase])

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: '내 서재',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TabsLayout />
    </AuthProvider>
  )
}
