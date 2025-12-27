import React from 'react'
import { View, FlatList, StyleSheet } from 'react-native'

import { Text } from '@/feature/shared/components'

import { Magazine } from '../types'

import { MagazineCard } from './MagazineCard'

const ITEM_MARGIN = 12

interface MagazineCarouselProps {
  title: string
  magazines: Magazine[]
  onMagazinePress: (magazine: Magazine) => void
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
        <Text fontWeight="bold" style={styles.categoryTitle}>
          {title}
        </Text>
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
    marginBottom: 24,
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
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
})
