import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

interface MagazineItemProps {
  magazine: Magazine | null
  onPress?: (magazine: Magazine) => void
}

const { width } = Dimensions.get('window')
const ITEM_MARGIN = 12
const ITEM_WIDTH = (width - ITEM_MARGIN * 4) / 3

export function MagazineItem({ magazine, onPress }: MagazineItemProps) {
  if (!magazine) {
    return <View style={styles.emptyItem} />
  }

  const getCoverImageUrl = (magazine: Magazine) => {
    if (!magazine.cover_image) return null
    return supabase.storage
      .from('covers')
      .getPublicUrl(`${magazine.storage_key}/${magazine.cover_image}`).data
      .publicUrl
  }

  const coverImageUrl = getCoverImageUrl(magazine)

  return (
    <TouchableOpacity
      style={styles.magazineItem}
      onPress={() => onPress?.(magazine)}
      activeOpacity={0.8}
    >
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
      <Text style={styles.title} numberOfLines={2}>
        {magazine.title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  emptyItem: {
    backgroundColor: 'transparent',
  },
  magazineItem: {
    width: ITEM_WIDTH,
    marginHorizontal: ITEM_MARGIN / 2,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4, // 매거진 비율
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
    textAlign: 'center',
  },
})
