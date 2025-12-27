import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

import { usePurchaseRestore } from '@/feature/magazines/hooks'
import { Button, Text } from '@/feature/shared'

import { useAuth } from './AuthContext'
import { NameInputBottomSheet } from './NameInputBottomSheet'

interface UserProfileBottomSheetProps {
  visible: boolean
  onClose: () => void
}

export function UserProfileBottomSheet({
  visible,
  onClose,
}: UserProfileBottomSheetProps) {
  const { user, signOut, deleteAccount, supabase } = useAuth()
  const { isRestoring, restorePurchases } = usePurchaseRestore()
  const [showNameInput, setShowNameInput] = useState(false)
  const [currentUserName, setCurrentUserName] = useState(
    user?.user_metadata?.full_name || ''
  )

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  // variables
  const snapPoints = useMemo(() => ['40%'], [])

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose()
      }
    },
    [onClose]
  )

  // effects
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
    }
  }, [visible])

  // 바텀시트가 열릴 때마다 최신 사용자 정보 가져오기
  useEffect(() => {
    const fetchLatestUserInfo = async () => {
      if (visible && user) {
        try {
          const { data, error } = await supabase.auth.getUser()
          if (!error && data.user) {
            setCurrentUserName(data.user.user_metadata?.full_name || '')
          }
        } catch (error) {
          console.error('Failed to fetch latest user info:', error)
        }
      }
    }

    fetchLatestUserInfo()
  }, [visible, user, supabase])

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
          bottomSheetModalRef.current?.dismiss()
        },
      },
    ])
  }

  const handleEditName = () => {
    bottomSheetModalRef.current?.dismiss()
    setTimeout(() => {
      setShowNameInput(true)
    }, 300)
  }

  const handleNameInputClose = () => {
    setShowNameInput(false)
  }

  const handleLoginPress = () => {
    bottomSheetModalRef.current?.dismiss()
    router.push('/login')
  }

  const handleRestorePurchases = async () => {
    await restorePurchases()
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
              bottomSheetModalRef.current?.dismiss()
              Alert.alert('완료', '회원 탈퇴가 완료되었습니다.')
            } catch (error) {
              Alert.alert(
                '오류',
                error instanceof Error ? error.message : '계정 삭제에 실패했습니다.'
              )
            }
          },
        },
      ]
    )
  }

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheet}
        handleIndicatorStyle={styles.indicator}
        enableDynamicSizing={false}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.header}>
            <Text fontWeight="semibold" style={styles.title}>
              {user ? '프로필' : '로그인이 필요합니다'}
            </Text>
          </View>

          {user ? (
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
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                )}
                <Text style={styles.restoreText}>
                  {isRestoring ? '복원 중...' : '구매 복원'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteAccountText}>회원 탈퇴</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              <Button onPress={handleLoginPress}>로그인하고 이용하기</Button>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>

      <NameInputBottomSheet
        visible={showNameInput}
        onClose={handleNameInputClose}
        username={currentUserName}
      />
    </>
  )
}

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  indicator: {
    backgroundColor: '#DDD',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#333',
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
    paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'underline',
  },
})
