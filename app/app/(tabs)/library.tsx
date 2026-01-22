import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MagazineCard, usePurchasedMagazinesContext } from '@/feature/magazines'
import { Button, LogoHeader, Text } from '@/feature/shared/components'

import { useAuth } from '../../feature/auth/components'

const ITEM_SPACING = 12
const HORIZONTAL_PADDING = 16
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
          내 서재를 이용하려면 로그인이 필요해요
        </Text>

        <Button onPress={() => router.push('/login')}>
          로그인하고 이용하기
        </Button>
      </View>
    </View>
  )
}

export default function LibraryPage() {
  const { user, loading } = useAuth()
  const {
    magazines,
    loading: magazinesLoading,
    error: magazinesError,
    refetch,
  } = usePurchasedMagazinesContext()

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <LogoHeader />

      {/* Purchased Magazines Grid */}
      <View style={styles.librarySection}>
        <View style={styles.libraryHeader}>
          <Text fontWeight="bold" style={styles.libraryTitle}>
            내 서재
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>                   

        {magazinesLoading ? (
          <View style={styles.centered}>        
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>글을 불러오는 중...</Text>
          </View>
        ) : magazinesError ? (              
          <View style={styles.centered}>
            <Text style={styles.errorText}>글을 불러올 수 없어요</Text>
            <Text style={styles.errorSubText}>{magazinesError}</Text>
          </View>
        ) : magazines.length === 0 ? (        
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>
              마음에 드는 글을 구매하고{"\n"}내 서재에서 확인해보세요
            </Text>
          </View>                                       
        ) : (
          <FlatList
            data={magazines}
            keyExtractor={item => item.id}
            numColumns={3}
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
                  onPress={() => handleMagazinePress(item.id)}
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
  librarySection: {
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  libraryTitle: {
    fontSize: 20,
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
