import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { OverlayProvider } from 'overlay-kit'
import { useEffect } from 'react'
import { Alert } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AuthProvider, useAuth } from '../feature/auth'
import {
  PurchasedMagazinesProvider,
  usePurchasedMagazines,
  BookmarksProvider,
  useBookmarks,
} from '../feature/magazines'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="magazine/[id]/view"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>
  )
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const {
    magazines: purchasedMagazines,
    loading: purchasedLoading,
    error: purchasedError,
    refetch: refetchPurchased,
  } = usePurchasedMagazines()

  const {
    magazines: bookmarkedMagazines,
    loading: bookmarksLoading,
    error: bookmarksError,
    refetch: refetchBookmarks,
  } = useBookmarks()

  return (
    <PurchasedMagazinesProvider
      magazines={purchasedMagazines}
      loading={purchasedLoading}
      error={purchasedError}
      refetch={refetchPurchased}
    >
      <BookmarksProvider
        magazines={bookmarkedMagazines}
        loading={bookmarksLoading}
        error={bookmarksError}
        refetch={refetchBookmarks}
      >
        {children}
      </BookmarksProvider>
    </PurchasedMagazinesProvider>
  )
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Pretendard: require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProviders>
          <BottomSheetModalProvider>
            <OverlayProvider>
              <RootLayoutNav />
            </OverlayProvider>
          </BottomSheetModalProvider>
        </AppProviders>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
