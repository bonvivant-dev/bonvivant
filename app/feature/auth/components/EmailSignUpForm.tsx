import { router } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'

import { Button, TextField } from '@/feature/shared'

import { AuthErrorMessage } from '../constants'

import { useAuth } from './AuthContext'

export function EmailSignUpForm() {
  const { signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.')
      return false
    }
    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.')
      return false
    }
    return true
  }

  const handleSignUpSuccess = () => {
    Alert.alert(
      '회원가입 완료',
      '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료한 후 로그인해주세요.',
      [
        {
          text: '로그인하기',
          onPress: () => router.replace('/login'),
        },
      ]
    )
  }

  const handleSignUp = async () => {
    if (!validateForm()) return
    setLoading(true)

    try {
      const result = await signUpWithEmail(email.trim(), password)
      if (result.success) {
        Alert.alert(
          '회원가입 완료',
          '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료한 후 로그인해주세요.',
          [
            {
              text: '확인',
              onPress: () => {
                handleSignUpSuccess()
              },
            },
          ]
        )
      }
    } catch (error) {
      const errorMessage = (error as Error).message

      if (errorMessage === AuthErrorMessage.USER_ALREADY_REGISTERED) {
        Alert.alert(
          '이미 가입된 이메일',
          '이미 가입된 이메일입니다. 로그인을 시도해주세요.',
          [
            {
              text: '로그인하기',
              onPress: () => router.back(),
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ]
        )
      } else {
        const displayMessage = errorMessage || '알 수 없는 오류가 발생했습니다.'
        Alert.alert('회원가입 실패', displayMessage)
      }
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
          placeholder="비밀번호 (6자 이상)"
          secureTextEntry
          editable={!loading}
        />
        <TextField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="비밀번호 확인"
          secureTextEntry
          editable={!loading}
        />
        <Button loading={loading} onPress={handleSignUp} disabled={loading}>
          회원가입
        </Button>
      </View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.toggleButtonText}>로그인하기</Text>
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
