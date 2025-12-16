import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { overlay } from 'overlay-kit'
import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '@/feature/auth/components'
import {
  MagazinePreviewBottomSheet,
  Magazine,
  useBookmarksContext,
} from '@/feature/magazines'
import { Button, LogoHeader } from '@/feature/shared'
import { thumbnail } from '@/feature/shared/utils'

const { width } = Dimensions.get('window')
const ITEM_SPACING = 12
const ITEMS_PER_ROW = 3
const ITEM_WIDTH = (width - ITEM_SPACING * (ITEMS_PER_ROW + 1)) / ITEMS_PER_ROW

function LoginRequired() {
  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginSection}>
        <Text style={styles.loginMessage}>
          찜한 매거진을 보려면 로그인이 필요해요
        </Text>

        <Button onPress={() => router.push('/login')}>
          로그인하고 이용하기
        </Button>
      </View>
    </View>
  )
}

export default function Bookmarks() {
  const { user, loading } = useAuth()
  const {
    magazines: bookmarks,
    loading: bookmarksLoading,
    error: bookmarksError,
  } = useBookmarksContext()

  const handleMagazinePress = (magazine: Magazine) => {
    overlay.open(({ isOpen, close }) => (
      <MagazinePreviewBottomSheet
        visible={isOpen}
        magazine={magazine}
        onClose={close}
      />
    ))
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </SafeAreaView>
    )
  }

  if (!user) {
    return <LoginRequired />
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LogoHeader />

      {/* Bookmarked Magazines Grid */}
      <View style={styles.bookmarksSection}>
        {bookmarksLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>매거진을 불러오는 중...</Text>
          </View>
        ) : bookmarksError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>매거진을 불러올 수 없습니다</Text>
            <Text style={styles.errorSubText}>{bookmarksError}</Text>
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>아직 찜한 매거진이 없습니다</Text>
            <Text style={styles.emptySubText}>
              마음에 드는 매거진을 찜해보세요
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={item => item.id}
            numColumns={ITEMS_PER_ROW}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.magazineItem}
                onPress={() => handleMagazinePress(item)}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  bookmarksSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
