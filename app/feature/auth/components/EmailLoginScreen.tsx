import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

import { EmailLoginForm } from './EmailLoginForm'
import { EmailSignUpForm } from './EmailSignUpForm'

interface EmailLoginScreenProps {
  onBack: () => void
}

export function EmailLoginScreen({ onBack }: EmailLoginScreenProps) {
  const [emailForm, setEmailForm] = useState<'login' | 'signup'>('login')

  const handleLoginSuccess = () => {
    onBack()
  }

  const handleSignUpSuccess = () => {
    // 회원가입 성공 시 로그인 모드로 전환
    setEmailForm('login')
  }

  const toggleMode = () => {
    setEmailForm(emailForm === 'login' ? 'signup' : 'login')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {emailForm === 'signup' ? (
            <EmailSignUpForm
              onSuccess={handleSignUpSuccess}
              onToggleMode={toggleMode}
            />
          ) : (
            <EmailLoginForm
              onSuccess={handleLoginSuccess}
              onToggleMode={toggleMode}
            />
          )}
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
})
