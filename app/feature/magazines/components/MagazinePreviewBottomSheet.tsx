import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
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

import { supabase } from '@/feature/shared'

import { useMagazinePurchase } from '../hooks'
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
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // 통합 구매 처리 hook
  const {
    handlePurchase,
    isPurchased,
    isChecking,
    isLoading,
    connected,
    products,
    refetch,
  } = useMagazinePurchase({
    magazine,
    onClose,
  })

  if (!magazine) return null

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

  // 개발용 모의 구매 함수
  const handleMockPurchase = async () => {
    if (!magazine) return

    // 구매 가능 여부 확인
    if (
      !magazine.product_id ||
      !magazine.is_purchasable ||
      magazine.price === null ||
      magazine.price === undefined
    ) {
      Alert.alert('알림', '현재 구매할 수 없는 매거진입니다.')
      return
    }

    try {
      setIsProcessing(true)

      // 현재 로그인한 사용자 가져오기
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        Alert.alert('오류', '로그인이 필요합니다.')
        return
      }

      // purchases 테이블에 구매 데이터 삽입
      const { error } = await supabase.from('purchases').insert({
        user_id: userData.user.id,
        magazine_id: magazine.id,
        transaction_id: `mock_${Date.now()}`,
        platform: 'ios', // 개발용은 기본 ios
        product_id: magazine.product_id,
        price: magazine.price,
        currency: 'KRW',
        status: 'verified',
        verified_at: new Date().toISOString(),
      })

      if (error) {
        console.error('모의 구매 실패:', error)
        Alert.alert('오류', '구매 데이터 삽입에 실패했습니다.')
        return
      }

      // 구매 상태 갱신
      await refetch()

      Alert.alert('구매 완료', '(개발용) 매거진을 구매했습니다!', [
        {
          text: '확인',
          onPress: () => {
            onClose()
            router.push(`/magazine/${magazine.id}/view`)
          },
        },
      ])
    } catch (error) {
      console.error('모의 구매 에러:', error)
      Alert.alert('오류', '구매에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index)
    setIsImageViewerVisible(true)
  }

  const closeImageViewer = () => {
    setIsImageViewerVisible(false)
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
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
              <Text style={styles.title}>{magazine.title}</Text>
            </View>
          </View>

          {/* Purchase Button */}
          <View style={styles.purchaseContainer}>
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (isChecking || isProcessing || isLoading || !connected) &&
                  styles.purchaseButtonDisabled,
                isPurchased && styles.purchaseButtonPurchased,
              ]}
              onPress={handlePurchase}
              activeOpacity={0.8}
              disabled={isChecking || isProcessing || isLoading || !connected}
            >
              {isChecking || isProcessing || isLoading || !connected ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  {isPurchased ? '읽기' : '구매하기'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Development Only - Mock Purchase Button */}
            <TouchableOpacity
              style={styles.devButton}
              onPress={handleMockPurchase}
              activeOpacity={0.8}
              disabled={isChecking || isProcessing}
            >
              {isChecking || isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.devButtonText}>
                  (개발용) {isPurchased ? '읽기' : '구매하기'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Development Only - Debug Info */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🔍 디버그 정보</Text>
              <Text style={styles.debugText}>
                연결 상태: {connected ? '✅ 연결됨' : '❌ 연결 안됨'}
              </Text>
              <Text style={styles.debugText}>
                상품 ID: {magazine.product_id || '없음'}
              </Text>
              <Text style={styles.debugText}>
                상품 로드:{' '}
                {products && products.length > 0 ? '✅ 성공' : '❌ 실패'}
              </Text>
              {products && products.length > 0 && (
                <Text style={styles.debugText}>
                  상품 개수: {products.length}
                </Text>
              )}
              {products && products.length > 0 && (
                <Text style={styles.debugText}>
                  가격:{' '}
                  {'price' in products[0] ? products[0].price || 'N/A' : 'N/A'}
                </Text>
              )}
            </View>
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
      <MagazinePreviewModal
        visible={isImageViewerVisible}
        magazine={magazine}
        initialImageIndex={selectedImageIndex}
        onClose={closeImageViewer}
      />
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#fff',
  },
  introSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '600',
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
