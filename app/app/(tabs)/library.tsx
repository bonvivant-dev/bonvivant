import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'

import { Button } from '@/feature/shared'

import { useAuth, NameInputBottomSheet } from '../../feature/auth/components'

function LoginRequired() {
  return (
    <View style={styles.container}>
      <View style={styles.loginSection}>
        <Text style={styles.loginMessage}>
          내 서재를 이용하려면 로그인이 필요해요
        </Text>

        <Button onPress={() => router.push('/login')}>
          로그인하고 이용하기
        </Button>
      </View>
    </View>
  )
}

export default function Library() {
  const { user, loading, signOut } = useAuth()
  const userName = user?.user_metadata?.full_name || ''
  const [showNameInputBottomSheet, setShowNameInputBottomSheet] =
    useState(false)

  const handleSignOut = async () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      { text: '확인', onPress: async () => await signOut() },
    ])
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    )
  }

  if (!user) {
    return <LoginRequired />
  }

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <TouchableOpacity onPress={() => setShowNameInputBottomSheet(true)}>
          {userName ? (
            <Text style={styles.welcomeText}>
              <Text style={styles.underline}>{userName}</Text> 님, 안녕하세요
            </Text>
          ) : (
            <Text style={styles.namePromptText}>닉네임을 입력해주세요</Text>
          )}
        </TouchableOpacity>

        <View style={styles.librarySection}>
          <Text style={styles.libraryTitle}>내 서재 목록</Text>
          <Text style={styles.emptyText}>아직 구독한 매거진이 없습니다.</Text>
        </View>
        <Button
          onPress={handleSignOut}
          style={{ width: '50%', backgroundColor: '#FF3B30' }}
        >
          로그아웃
        </Button>
      </View>
      <NameInputBottomSheet
        visible={showNameInputBottomSheet}
        onClose={() => setShowNameInputBottomSheet(false)}
        username={userName}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  userSection: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#333',
  },
  namePromptText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#333',
  },
  librarySection: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  libraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loginSection: {
    alignItems: 'center',
    width: '100%',
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
})
