import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import {
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
import { PageHeader, Text } from '@/feature/shared/components'

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithApple } = useAuth()
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>()

  const handleLoginSuccess = useCallback(() => {
    if (returnUrl) return router.replace(returnUrl as any)
    router.replace('/')
  }, [returnUrl])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      Alert.alert('구글 로그인 실패', errorMessage)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      Alert.alert('Apple 로그인 실패', errorMessage)
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
        <View style={styles.socialButtonContainer}>
          {Platform.OS === 'ios' && (
            <Pressable
              onPress={handleAppleSignIn}
              style={styles.appleButton}
            >
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              <Text style={styles.appleButtonText}>Apple로 로그인</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleGoogleSignIn}
            style={styles.googleButton}
            android_ripple={{ color: '#E8E8E8' }}
          >
            <IconGoogle width={20} height={20} />
            <Text style={styles.googleButtonText}>Google로 로그인</Text>
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
  socialButtonContainer: {
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 50,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 50,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
