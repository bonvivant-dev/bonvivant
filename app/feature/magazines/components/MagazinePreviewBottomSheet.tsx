import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '@/feature/auth/components'
import { Text } from '@/feature/shared/components'
import { supabase } from '@/feature/shared/lib'

import { useBookmarksContext } from '../contexts'
import {
  useMagazinePurchase,
  useBookmarkStatus,
  useBookmarkToggle,
} from '../hooks'
import { Magazine } from '../types'

import { MagazinePreviewModal } from './MagazinePreviewModal'

const { width } = Dimensions.get('window')

interface MagazinePreviewBottomSheetProps {
  visible: boolean
  magazine: Magazine | null
  onClose: () => void
}

export function MagazinePreviewBottomSheet({
  visible,
  magazine,
  onClose,
}: MagazinePreviewBottomSheetProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // 통합 구매 처리 hook
  const { handlePurchase, isPurchased, isChecking, isLoading, connected } =
    useMagazinePurchase({
      magazine,
      onClose,
    })

  // 찜 목록 데이터 refetch를 위한 context
  const { refetch: refetchBookmarks } = useBookmarksContext()

  // 북마크 관련 hooks
  const { isBookmarked, refetch: refetchBookmarkStatus } = useBookmarkStatus(
    magazine?.id || ''
  )
  const { toggleBookmark, loading: bookmarkLoading } = useBookmarkToggle()

  if (!magazine) return null

  const handleBookmarkPress = async () => {
    // 로그인 체크
    if (!user) {
      Alert.alert('로그인 필요', '로그인 후 이용해주세요.', [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그인',
          onPress: () => {
            onClose()
            router.push('/login')
          },
        },
      ])
      return
    }

    try {
      await toggleBookmark(magazine.id)
      await refetchBookmarkStatus()
      // 찜 목록 갱신
      await refetchBookmarks()
    } catch (error) {
      console.error('북마크 토글 실패:', error)
      Alert.alert('오류', '찜 처리 중 오류가 발생했습니다.')
    }
  }

  const getCoverImageUrl = (magazine: Magazine) => {
    if (!magazine.cover_image) return null
    // cover_image에서 "images/" 접두사 제거 (이미 포함되어 있음)
    const path = magazine.cover_image.replace(/^images\//, '')
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
  }

  const coverImageUrl = getCoverImageUrl(magazine)

  const getPreviewImageUrl = (imagePath: string) => {
    // imagePath에서 "images/" 접두사 제거 (이미 포함되어 있음)
    const path = imagePath.replace(/^images\//, '')
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
  }

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index)
    setIsImageViewerVisible(true)
  }

  const closeImageViewer = () => {
    setIsImageViewerVisible(false)
  }

  // MagazinePreviewModal에서 구매 요청 시 호출되는 핸들러
  const handlePurchaseFromModal = async () => {
    // 먼저 이미지 뷰어 모달을 닫음
    closeImageViewer()
    // 그 다음 구매 진행
    await handlePurchase()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBookmarkPress}
            style={styles.bookmarkButton}
            disabled={bookmarkLoading}
          >
            {bookmarkLoading ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons
                name={isBookmarked ? 'heart' : 'heart-outline'}
                size={28}
                color="#FF3B30"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text fontWeight="bold" style={styles.closeButtonText}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section: Cover Image and Title */}
          <View style={styles.topSection}>
            <View style={styles.coverContainer}>
              {coverImageUrl ? (
                <Image
                  source={{ uri: coverImageUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.coverImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text fontWeight="semibold" style={styles.title}>
                {magazine.title}
              </Text>
            </View>
          </View>

          {/* Purchase Button */}
          <View style={styles.purchaseContainer}>
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (isChecking || isLoading || !connected) &&
                  styles.purchaseButtonDisabled,
                isPurchased && styles.purchaseButtonPurchased,
              ]}
              onPress={handlePurchase}
              activeOpacity={0.8}
              disabled={isChecking || isLoading || !connected}
            >
              {isChecking || isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text fontWeight="semibold" style={styles.purchaseButtonText}>
                  {isPurchased ? '읽기' : '구매하기'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.introduction}>
              {magazine.introduction || '등록된 소개글이 없어요'}
            </Text>
          </View>

          {/* Preview Images */}
          {magazine.preview_images && magazine.preview_images.length > 0 && (
            <View style={styles.previewSection}>
              <View style={styles.previewContainer}>
                <FlatList
                  data={magazine.preview_images}
                  renderItem={({ item, index }) => {
                    const imageUrl = getPreviewImageUrl(item)
                    return (
                      <TouchableOpacity
                        style={styles.previewImageContainer}
                        onPress={() => handleImagePress(index)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.previewImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )
                  }}
                  keyExtractor={(item, index) => `preview-${index}`}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Full Screen Image Viewer Modal */}
      {isImageViewerVisible && (
        <MagazinePreviewModal
          visible={isImageViewerVisible}
          magazine={magazine}
          initialImageIndex={selectedImageIndex}
          onClose={closeImageViewer}
          isPurchased={isPurchased}
          onPurchaseRequest={handlePurchaseFromModal}
        />
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
  },
  coverContainer: {
    marginRight: 16,
  },
  coverImage: {
    width: width * 0.35,
    aspectRatio: 320 / 470,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: '#333',
    lineHeight: 28,
  },
  purchaseContainer: {
    marginBottom: 24,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#ccc',
  },
  purchaseButtonPurchased: {
    backgroundColor: '#34C759',
  },
  purchaseButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  devButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  devButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  introSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  introduction: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewContainer: {
    height: 180,
  },
  previewImageContainer: {
    width: 110,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  debugTitle: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
})
