import { Image } from 'expo-image'
import React from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'

import { thumbnail } from '@/feature/shared/utils'

import { Magazine } from '../types'

const { width: screenWidth } = Dimensions.get('window')
const ITEM_WIDTH = screenWidth * 0.25
const ITEM_MARGIN = 12

interface MagazineCarouselProps {
  title: string
  magazines: Magazine[]
  onMagazinePress: (magazine: Magazine) => void
}

interface MagazineCardProps {
  magazine: Magazine
  onPress: (magazine: Magazine) => void
}

function MagazineCard({ magazine, onPress }: MagazineCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
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
    </TouchableOpacity>
  )
}

export const MagazineCarousel: React.FC<MagazineCarouselProps> = ({
  title,
  magazines,
  onMagazinePress,
}) => {
  if (magazines.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{title}</Text>
      </View>

      <FlatList
        data={magazines}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <MagazineCard magazine={item} onPress={onMagazinePress} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_MARGIN }} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
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
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  summary: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
})
