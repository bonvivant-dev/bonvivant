import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'

import { AuthErrorMessage } from '../constants'

import { useAuth } from './AuthContext'

interface EmailSignUpFormProps {
  onSuccess: () => void
  onToggleMode: () => void
}

export function EmailSignUpForm({
  onSuccess,
  onToggleMode,
}: EmailSignUpFormProps) {
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
                onSuccess()
              },
            },
          ]
        )
      }
    } catch (error) {
      console.log(error)
      const errorMessage = (error as Error).message

      if (errorMessage === AuthErrorMessage.USER_ALREADY_REGISTERED) {
        Alert.alert(
          '이미 가입된 이메일',
          '이미 가입된 이메일입니다. 로그인을 시도해주세요.',
          [
            {
              text: '로그인하기',
              onPress: () => onToggleMode(),
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
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="이메일을 입력하세요"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요 (6자 이상)"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="비밀번호를 다시 입력하세요"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>회원가입</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={onToggleMode}
          disabled={loading}
        >
          <Text style={styles.toggleButtonText}>
            이미 계정이 있으신가요? 로그인
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
