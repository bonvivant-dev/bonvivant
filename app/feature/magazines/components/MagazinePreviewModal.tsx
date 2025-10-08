import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

const { width } = Dimensions.get('window')

interface MagazinePreviewModalProps {
  visible: boolean
  magazine: Magazine | null
  initialImageIndex?: number
  onClose: () => void
}

export function MagazinePreviewModal({
  visible,
  magazine,
  initialImageIndex = 0,
  onClose,
}: MagazinePreviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] =
    useState(initialImageIndex)

  if (
    !magazine ||
    !magazine.preview_images ||
    magazine.preview_images.length === 0
  ) {
    return null
  }

  const getPreviewImageUrl = (imagePath: string) => {
    return supabase.storage
      .from('covers')
      .getPublicUrl(`${magazine.storage_key}/${imagePath}`).data.publicUrl
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
            }}
          />
          {/* Page Counter - Below Images */}
          <View style={styles.imageViewerPageCounter}>
            <Text style={styles.imageViewerPageText}>
              {selectedImageIndex + 1} / {magazine.preview_images.length}
            </Text>
          </View>
        </View>
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
})
