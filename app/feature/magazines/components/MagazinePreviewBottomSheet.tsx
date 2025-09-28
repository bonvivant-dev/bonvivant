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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

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
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0)

  if (!magazine) return null

  const getCoverImageUrl = (magazine: Magazine) => {
    if (!magazine.cover_image) return null
    return supabase.storage
      .from('covers')
      .getPublicUrl(`${magazine.storage_key}/${magazine.cover_image}`).data
      .publicUrl
  }

  const coverImageUrl = getCoverImageUrl(magazine)

  const getPreviewImageUrl = (imagePath: string) => {
    return supabase.storage
      .from('covers')
      .getPublicUrl(`${magazine.storage_key}/${imagePath}`).data.publicUrl
  }

  // TODO: 구매 기능 구현
  const handlePurchase = () => {
    // 구매 후 이동
    onClose()
    router.push(`/magazine/${magazine.id}/view`)
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
              style={styles.purchaseButton}
              onPress={handlePurchase}
              activeOpacity={0.8}
            >
              <Text style={styles.purchaseButtonText}>구매하기</Text>
            </TouchableOpacity>
          </View>

          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.sectionTitle}>소개</Text>
            <Text style={styles.introduction}>
              {magazine.introduction || '등록된 소개글이 없어요'}
            </Text>
          </View>

          {/* Preview Images */}
          {magazine.preview_images && magazine.preview_images.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>미리보기</Text>
              <View style={styles.previewContainer}>
                <FlatList
                  data={magazine.preview_images}
                  renderItem={({ item }) => {
                    const imageUrl = getPreviewImageUrl(item)
                    return (
                      <View style={styles.previewImageContainer}>
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.previewImage}
                          resizeMode="contain"
                        />
                      </View>
                    )
                  }}
                  keyExtractor={(item, index) => `preview-${index}`}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={event => {
                    const pageIndex = Math.round(
                      event.nativeEvent.contentOffset.x / (width * 0.7)
                    )
                    setCurrentPreviewPage(pageIndex)
                  }}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
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
  purchaseButtonText: {
    fontSize: 16,
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
})
