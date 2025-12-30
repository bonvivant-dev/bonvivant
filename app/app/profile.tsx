import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { router, Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native'

import { useAuth } from '@/feature/auth/components/AuthContext'
import { NameInputBottomSheet } from '@/feature/auth/components/NameInputBottomSheet'
import { Button, Text, PageHeader } from '@/feature/shared/components'

const PRIVACY_URL = 'https://bonvivant-web.vercel.app/privacy'
const TERMS_URL = 'https://bonvivant-web.vercel.app/terms'
const REFUND_URL = 'https://bonvivant-web.vercel.app/refund'

export default function ProfileScreen() {
  const { user, signOut, deleteAccount, supabase } = useAuth()
  const [showNameInput, setShowNameInput] = useState(false)
  const [currentUserName, setCurrentUserName] = useState(
    user?.user_metadata?.name || ''
  )

  // 페이지가 포커스될 때마다 최신 사용자 정보 가져오기
  useEffect(() => {
    const fetchLatestUserInfo = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.auth.getUser()
          if (!error && data.user) {
            setCurrentUserName(data.user.user_metadata?.name || '')
          }
        } catch (error) {
          console.error('Failed to fetch latest user info:', error)
        }
      }
    }

    fetchLatestUserInfo()
  }, [user, supabase])

  const handleSignOut = async () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: async () => {
          await signOut()
          router.back()
        },
      },
    ])
  }

  const handleEditName = () => {
    setShowNameInput(true)
  }

  const handleNameInputClose = () => {
    setShowNameInput(false)
  }

  const handleLoginPress = () => {
    router.replace('/login')
  }

  const handleRestorePurchases = async () => {
    // await restorePurchases()
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 탈퇴하시겠습니까?\n구매한 매거진을 포함한 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount()
              Alert.alert('완료', '회원 탈퇴가 완료되었습니다.')
              router.replace('/')
            } catch (error) {
              Alert.alert(
                '오류',
                error instanceof Error
                  ? error.message
                  : '계정 삭제에 실패했습니다.'
              )
            }
          },
        },
      ]
    )
  }

  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error('Failed to open URL:', error)
      Alert.alert('오류', 'URL을 열 수 없습니다.')
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PageHeader title="프로필" />
      {user ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.nameContainer}
              onPress={handleEditName}
            >
              <View style={styles.nameContent}>
                <Ionicons name="person-outline" size={24} color="#666" />
                {currentUserName ? (
                  <Text style={styles.userName}>{currentUserName}</Text>
                ) : (
                  <Text style={styles.namePrompt}>닉네임을 입력해주세요</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
            >
              <Ionicons name="refresh-outline" size={24} color="#007AFF" />
              <Text style={styles.restoreText}>구매 내역 복원</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteAccountText}>회원 탈퇴</Text>
            </TouchableOpacity>

            {/* 정책 링크 */}
            <View style={styles.policyLinksContainer}>
              <TouchableOpacity onPress={() => handleLinkPress(TERMS_URL)}>
                <Text style={styles.policyLinkText}>이용약관</Text>
              </TouchableOpacity>
              <Text style={styles.policySeparator}>•</Text>
              <TouchableOpacity onPress={() => handleLinkPress(PRIVACY_URL)}>
                <Text style={styles.policyLinkText}>개인정보 처리방침</Text>
              </TouchableOpacity>
              <Text style={styles.policySeparator}>•</Text>
              <TouchableOpacity onPress={() => handleLinkPress(REFUND_URL)}>
                <Text style={styles.policyLinkText}>환불 정책</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loginContainer}>
          <View style={styles.loginSection}>
            <Text style={styles.loginMessage}>
              프로필을 보려면 로그인이 필요해요
            </Text>

            <Button onPress={handleLoginPress}>로그인하고 이용하기</Button>

            {/* 정책 링크 (비로그인) */}
            <View style={styles.policyLinksContainer}>
              <TouchableOpacity onPress={() => handleLinkPress(TERMS_URL)}>
                <Text style={styles.policyLinkText}>이용약관</Text>
              </TouchableOpacity>
              <Text style={styles.policySeparator}>•</Text>
              <TouchableOpacity onPress={() => handleLinkPress(PRIVACY_URL)}>
                <Text style={styles.policyLinkText}>개인정보 처리방침</Text>
              </TouchableOpacity>
              <Text style={styles.policySeparator}>•</Text>
              <TouchableOpacity onPress={() => handleLinkPress(REFUND_URL)}>
                <Text style={styles.policyLinkText}>환불 정책</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <NameInputBottomSheet
        visible={showNameInput}
        onClose={handleNameInputClose}
        username={currentUserName}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    padding: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
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
  section: {
    gap: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  nameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  namePrompt: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
  },
  restoreText: {
    fontSize: 16,
    color: '#007AFF',
  },
  deleteAccountButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  deleteAccountText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'underline',
  },
  policyLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  policyLinkText: {
    fontSize: 12,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  policySeparator: {
    fontSize: 12,
    color: '#CCC',
  },
})
