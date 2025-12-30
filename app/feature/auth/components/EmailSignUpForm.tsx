import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native'

import { Button, Text, TextField } from '@/feature/shared/components'

import { AuthErrorMessage } from '../constants'

import { useAuth } from './AuthContext'

const PRIVACY_URL = 'https://bonvivant-web.vercel.app/privacy'
const TERMS_URL = 'https://bonvivant-web.vercel.app/terms'

export function EmailSignUpForm() {
  const { signUpWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)

  // 회원가입 버튼 활성화 조건
  const isFormValid =
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    agreeToTerms &&
    agreeToPrivacy

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
    if (!agreeToTerms || !agreeToPrivacy) {
      Alert.alert('오류', '이용약관 및 개인정보 처리방침에 동의해주세요.')
      return false
    }
    return true
  }

  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error('Failed to open URL:', error)
      Alert.alert('오류', 'URL을 열 수 없습니다.')
    }
  }

  const handleSignUp = async () => {
    if (!validateForm()) return
    setLoading(true)

    try {
      const result = await signUpWithEmail(email.trim(), password)
      if (result.success) {
        Alert.alert(
          '회원가입 완료 🇫🇷',
          '회원가입이 완료되었어요. 이제 봉비방의 다양한 매거진을 둘러보세요.',
          [
            {
              text: '확인',
              onPress: () => {
                router.replace('/')
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

        {/* 약관 동의 */}
        <View style={styles.agreementSection}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            disabled={loading}
          >
            <View
              style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            >
              {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.agreementTextContainer}>
              <TouchableOpacity
                onPress={() => handleLinkPress(TERMS_URL)}
                disabled={loading}
              >
                <Text style={styles.linkText}>이용약관</Text>
              </TouchableOpacity>
              <Text style={styles.agreementText}>에 동의합니다</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToPrivacy(!agreeToPrivacy)}
            disabled={loading}
          >
            <View
              style={[
                styles.checkbox,
                agreeToPrivacy && styles.checkboxChecked,
              ]}
            >
              {agreeToPrivacy && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.agreementTextContainer}>
              <TouchableOpacity
                onPress={() => handleLinkPress(PRIVACY_URL)}
                disabled={loading}
              >
                <Text style={styles.linkText}>개인정보 처리방침</Text>
              </TouchableOpacity>
              <Text style={styles.agreementText}>에 동의합니다</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Button
          loading={loading}
          onPress={handleSignUp}
          disabled={!isFormValid || loading}
        >
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
  agreementSection: {
    gap: 12,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  agreementTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  agreementText: {
    fontSize: 14,
    color: '#666',
  },
})
