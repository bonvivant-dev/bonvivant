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

import { useAuth, NameInputBottomSheet } from '../../feature/auth/components'

function LoginRequired() {
  const handleLoginButtonPress = () => {
    router.push('/login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginSection}>
        <Text style={styles.loginMessage}>
          내 서재를 이용하려면 로그인이 필요합니다
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLoginButtonPress}
        >
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
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
    try {
      await signOut()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('로그아웃 실패', '로그아웃 중 오류가 발생했습니다.')
    }
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

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>로그아웃</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
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
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginSection: {
    alignItems: 'center',
    width: '100%',
  },
  loginMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})
