import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from 'react-native'

import { usePurchasedMagazinesContext } from '@/feature/magazines'
import { Button } from '@/feature/shared'
import { thumbnail } from '@/feature/shared/utils'

import { useAuth, NameInputBottomSheet } from '../../feature/auth/components'

const { width } = Dimensions.get('window')
const ITEM_SPACING = 12
const ITEMS_PER_ROW = 3
const ITEM_WIDTH = (width - ITEM_SPACING * (ITEMS_PER_ROW + 1)) / ITEMS_PER_ROW

function LoginRequired() {
  return (
    <View style={styles.loginContainer}>
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

function LibraryContent() {
  const { user, loading, signOut } = useAuth()
  const {
    magazines,
    loading: magazinesLoading,
    error: magazinesError,
    refetch,
  } = usePurchasedMagazinesContext()
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

  const handleMagazinePress = (magazineId: string) => {
    router.push(`/magazine/${magazineId}/view`)
  }

  const handleRefresh = async () => {
    await refetch()
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
      {/* Header with logout button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowNameInputBottomSheet(true)}>
          {userName ? (
            <Text style={styles.welcomeText}>
              <Text style={styles.underline}>{userName}</Text> 님, 안녕하세요
            </Text>
          ) : (
            <Text style={styles.namePromptText}>닉네임을 입력해주세요</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Purchased Magazines Grid */}
      <View style={styles.librarySection}>
        <View style={styles.libraryHeader}>
          <Text style={styles.libraryTitle}>내 서재</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {magazinesLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>매거진을 불러오는 중...</Text>
          </View>
        ) : magazinesError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>매거진을 불러올 수 없습니다</Text>
            <Text style={styles.errorSubText}>{magazinesError}</Text>
          </View>
        ) : magazines.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>아직 구매한 매거진이 없습니다</Text>
            <Text style={styles.emptySubText}>
              매거진을 구매하고 내 서재에서 확인해보세요
            </Text>
          </View>
        ) : (
          <FlatList
            data={magazines}
            keyExtractor={item => item.id}
            numColumns={ITEMS_PER_ROW}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.magazineItem}
                onPress={() => handleMagazinePress(item.id)}
              >
                {item.cover_image ? (
                  <Image
                    source={{ uri: thumbnail(item.cover_image) }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="book" size={40} color="#999" />
                  </View>
                )}
                <Text style={styles.magazineTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <NameInputBottomSheet
        visible={showNameInputBottomSheet}
        onClose={() => setShowNameInputBottomSheet(false)}
        username={userName}
      />
    </View>
  )
}

export default function Library() {
  return <LibraryContent />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  logoutButton: {
    padding: 8,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#333',
  },
  namePromptText: {
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#333',
  },
  librarySection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  libraryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  gridContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: ITEM_SPACING,
  },
  magazineItem: {
    width: ITEM_WIDTH,
    marginRight: ITEM_SPACING,
  },
  coverImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.4,
    backgroundColor: '#E5E5E5',
  },
  placeholderImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.4,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  magazineTitle: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
    lineHeight: 16,
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
