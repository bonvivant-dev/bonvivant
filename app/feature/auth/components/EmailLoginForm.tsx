import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'

import { TextField } from '@/feature/shared'

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
      // get error message
      const errorMessage = (error as Error).message
      if (errorMessage === AuthErrorMessage.EMAIL_NOT_CONFIRMED) {
        Alert.alert('로그인 실패', '이메일 인증을 완료해주세요.')
      } else {
        Alert.alert('로그인 실패', '아이디와 비밀번호를 확인해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = () => {
    router.push('/signup')
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <TextField
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <TextField
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>로그인</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.toggleButtonText}>회원가입하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
})
