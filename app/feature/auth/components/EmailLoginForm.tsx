import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native'

import { Button, Text, TextField } from '@/feature/shared/components'

import { AuthErrorMessage } from '../constants'

import { useAuth } from './AuthContext'

export function EmailLoginForm() {
  const { signInWithEmail } = useAuth()
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.')
      return false
    }
    if (!password.trim()) {
      Alert.alert('오류', '비밀번호를 입력해주세요.')
      return false
    }
    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.')
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validateForm()) return
    setLoading(true)

    try {
      await signInWithEmail(email.trim(), password)
      if (returnUrl) {
        router.replace(returnUrl as any)
      } else if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/')
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage === AuthErrorMessage.EMAIL_NOT_CONFIRMED) {
        return Alert.alert('로그인 실패', '이메일 인증을 완료해주세요.')
      }
      Alert.alert('로그인 실패', '아이디와 비밀번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <View style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <TextField
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
          editable={!loading}
        />
        <Button loading={loading} onPress={handleLogin}>
          로그인
        </Button>
      </View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => router.push('/signup')}
        disabled={loading}
      >
        <Text style={styles.toggleButtonText}>회원가입하기</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
})
