import { router, Stack } from 'expo-router'
import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

import { useAuth } from '@/feature/auth/components/AuthContext'
import { Button, PageHeader, TextField } from '@/feature/shared/components'

export default function ChangePasswordPage() {
  const { user, supabase } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!currentPassword.trim()) {
      Alert.alert('오류', '현재 비밀번호를 입력해주세요.')
      return false
    }
    if (!newPassword.trim()) {
      Alert.alert('오류', '새 비밀번호를 입력해주세요.')
      return false
    }
    if (newPassword.length < 6) {
      Alert.alert('오류', '새 비밀번호는 6자 이상이어야 합니다.')
      return false
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.')
      return false
    }
    if (currentPassword === newPassword) {
      Alert.alert('오류', '현재 비밀번호와 새 비밀번호가 같습니다.')
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!validateForm()) return
    if (!user?.email) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.')
      return
    }

    setLoading(true)

    try {
      // 1. 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        Alert.alert('오류', '현재 비밀번호가 올바르지 않습니다.')
        return
      }

      // 2. 새 비밀번호로 변경
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        Alert.alert('오류', '비밀번호 변경에 실패했습니다.')
        return
      }

      Alert.alert('완료', '비밀번호가 성공적으로 변경되었습니다.', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      console.error('Change password error:', error)
      Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PageHeader title="비밀번호 변경" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <TextField
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="현재 비밀번호"
            secureTextEntry
            editable={!loading}
          />

          <TextField
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="새 비밀번호 (6자 이상)"
            secureTextEntry
            editable={!loading}
          />

          <TextField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="새 비밀번호 확인"
            secureTextEntry
            editable={!loading}
          />

          <Button
            loading={loading}
            onPress={handleChangePassword}
            disabled={loading}
            style={{ marginTop: 10 }}
          >
            비밀번호 변경
          </Button>
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
  content: {
    flex: 1,
    padding: 20,
  },
})
