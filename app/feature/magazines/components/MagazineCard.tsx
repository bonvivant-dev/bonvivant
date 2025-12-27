import { Image } from 'expo-image'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Text } from '@/feature/shared/components'
import { thumbnail } from '@/feature/shared/utils'

import { Magazine } from '../types'

interface MagazineCardProps {
  magazine: Magazine
  onPress: (magazine: Magazine) => void
  width?: number
}

const { width: screenWidth } = Dimensions.get('window')
const DEFAULT_ITEM_WIDTH = screenWidth * 0.27

export function MagazineCard({ magazine, onPress, width }: MagazineCardProps) {
  const cardWidth = width ?? DEFAULT_ITEM_WIDTH
  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => onPress(magazine)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {magazine.cover_image ? (
          <Image
            source={{ uri: thumbnail(magazine.cover_image) }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Cover</Text>
          </View>
        )}
      </View>
      {/* show magazine title */}
      <Text fontWeight="semibold" style={styles.title} numberOfLines={2}>
        {magazine.title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 320 / 470,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
    height: 36,
  },
})
