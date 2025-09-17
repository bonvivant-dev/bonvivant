import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'

import IconGoogle from '@/assets/icons/ic-google.svg'
import { useAuth, EmailLoginForm } from '@/feature/auth/components'
import { PageHeader } from '@/feature/shared'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>()

  const handleLoginSuccess = useCallback(() => {
    if (returnUrl) return router.replace(returnUrl as any)
    if (router.canGoBack()) return router.back()
    router.replace('/')
  }, [returnUrl])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      handleLoginSuccess()
    } catch (error) {
      Alert.alert('구글 로그인 실패', error as string)
    }
  }

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user && !loading) {
      handleLoginSuccess()
    }
  }, [user, loading, handleLoginSuccess])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <PageHeader title="로그인" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <EmailLoginForm />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={handleGoogleSignIn}>
            <IconGoogle width={32} height={32} />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
})
