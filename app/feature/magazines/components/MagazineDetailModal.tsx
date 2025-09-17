import { useRouter } from 'expo-router'
import React from 'react'
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

const { width } = Dimensions.get('window')

interface MagazineDetailModalProps {
  visible: boolean
  magazine: Magazine | null
  onClose: () => void
}

export function MagazineDetailModal({
  visible,
  magazine,
  onClose,
}: MagazineDetailModalProps) {
  const router = useRouter()

  if (!magazine) return null

  const getCoverImageUrl = (magazine: Magazine) => {
    if (!magazine.cover_image) return null
    return supabase.storage
      .from('covers')
      .getPublicUrl(`${magazine.storage_key}/${magazine.cover_image}`).data
      .publicUrl
  }

  const coverImageUrl = getCoverImageUrl(magazine)

  const handlePreview = () => {
    onClose()
    router.push(`/magazine/${magazine.id}/preview`)
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
          {/* Cover Image */}
          <View style={styles.imageContainer}>
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

          {/* Title */}
          <Text style={styles.title}>{magazine.title}</Text>

          {/* Summary */}
          {magazine.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>요약</Text>
              <Text style={styles.summary}>{magazine.summary}</Text>
            </View>
          )}

          {/* Introduction */}
          {magazine.introduction && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>소개</Text>
              <Text style={styles.introduction}>{magazine.introduction}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.previewButton]}
              onPress={handlePreview}
              activeOpacity={0.8}
            >
              <Text style={styles.previewButtonText}>미리보기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.purchaseButton]}
              onPress={handlePurchase}
              activeOpacity={0.8}
            >
              <Text style={styles.purchaseButtonText}>구매하기</Text>
            </TouchableOpacity>
          </View>
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
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  coverImage: {
    width: width * 0.5,
    aspectRatio: 3 / 4,
    borderRadius: 12,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summary: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  introduction: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
})
