import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

import { PageHeader, Text } from '@/feature/shared/components'

import { useAuth, EmailSignUpForm } from '../feature/auth/components'

export default function SignUpPage() {
  const { user, loading } = useAuth()
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>()

  useEffect(() => {
    if (user && !loading) {
      if (returnUrl) {
        router.replace(returnUrl as any)
      } else if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/')
      }
    }
  }, [user, loading, returnUrl])

  if (user && !loading) {
    return null
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <PageHeader title="회원가입" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <EmailSignUpForm />
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
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
})
