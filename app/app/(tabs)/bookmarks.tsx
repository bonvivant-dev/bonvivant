import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { overlay } from 'overlay-kit'
import React from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '@/feature/auth/components'
import {
  MagazinePreviewBottomSheet,
  Magazine,
  useBookmarksContext,
  MagazineCard,
} from '@/feature/magazines'
import { Button, LogoHeader, Text } from '@/feature/shared'

const ITEM_SPACING = 12
const HORIZONTAL_PADDING = 20
const NUM_COLUMNS = 3

const { width: screenWidth } = Dimensions.get('window')
const ITEM_WIDTH =
  (screenWidth - HORIZONTAL_PADDING * 2 - ITEM_SPACING * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS

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

export default function BookmarksPage() {
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
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.itemContainer,
                  (index + 1) % NUM_COLUMNS !== 0 && {
                    marginRight: ITEM_SPACING,
                  },
                ]}
              >
                <MagazineCard
                  magazine={item}
                  onPress={handleMagazinePress}
                  width={ITEM_WIDTH}
                />
              </View>
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
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
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
  itemContainer: {
    width: ITEM_WIDTH,
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
