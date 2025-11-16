import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

const { width } = Dimensions.get('window')

interface MagazinePreviewModalProps {
  visible: boolean
  magazine: Magazine | null
  initialImageIndex?: number
  onClose: () => void
  isPurchased: boolean
  onPurchaseRequest: () => void
  isLoading?: boolean
}

export function MagazinePreviewModal({
  visible,
  magazine,
  initialImageIndex = 0,
  onClose,
  isPurchased,
  onPurchaseRequest,
  isLoading = false,
}: MagazinePreviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] =
    useState(initialImageIndex)
  const hasShownPurchaseAlert = useRef(false)

  // 모달이 열릴 때마다 alert 표시 상태 초기화
  useEffect(() => {
    if (visible) {
      hasShownPurchaseAlert.current = false
    }
  }, [visible])

  if (
    !magazine ||
    !magazine.preview_images ||
    magazine.preview_images.length === 0
  ) {
    return null
  }

  const getPreviewImageUrl = (imagePath: string) => {
    // imagePath에서 "images/" 접두사 제거 (이미 포함되어 있음)
    const path = imagePath.replace(/^images\//, '')
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
  }

  const showPurchaseAlert = () => {
    if (hasShownPurchaseAlert.current) return
    hasShownPurchaseAlert.current = true

    // 이미 구매한 매거진이면 Alert 미노출
    if (isPurchased) return

    Alert.alert(
      '매거진 구매',
      '매거진의 전체 내용을 보시겠어요?',
      [
        {
          text: '구매하기',
          onPress: onPurchaseRequest,
        },
        {
          text: '나중에',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.imageViewerContainer}>
        {/* Header - Absolute Positioned */}
        <View style={styles.imageViewerHeader}>
          <Text style={styles.imageViewerTitle}>
            (미리보기) {magazine.title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.imageViewerCloseButton}
          >
            <Text style={styles.imageViewerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Image Content - Full Screen */}
        <View style={styles.imageViewerContent}>
          <FlatList
            data={magazine.preview_images}
            renderItem={({ item }) => {
              const imageUrl = getPreviewImageUrl(item)
              return (
                <View style={styles.fullImageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </View>
              )
            }}
            keyExtractor={(item, index) => `full-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialImageIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={event => {
              const pageIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              )
              setSelectedImageIndex(pageIndex)

              // 마지막 페이지 도달 시 구매 알림 표시
              if (
                pageIndex === magazine.preview_images!.length - 1 &&
                !hasShownPurchaseAlert.current
              ) {
                // alert가 즉시 표시되지 않도록 약간의 딜레이 추가
                setTimeout(() => {
                  showPurchaseAlert()
                }, 300)
              }
            }}
          />
          {/* Page Counter - Below Images */}
          <View style={styles.imageViewerPageCounter}>
            <Text style={styles.imageViewerPageText}>
              {selectedImageIndex + 1} / {magazine.preview_images.length}
            </Text>
          </View>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>구매 처리 중...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1000,
  },
  imageViewerCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  imageViewerCloseText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },

  imageViewerContent: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullImageContainer: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width - 20,
    height: '80%',
  },

  imageViewerPageCounter: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  imageViewerPageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
})
