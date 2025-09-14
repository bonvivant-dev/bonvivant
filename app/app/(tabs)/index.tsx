import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MagazineItem, useMagazines, Magazine } from '@/feature/magazines'

const ITEM_MARGIN = 12

export default function Index() {
  const { magazines, loading, error } = useMagazines()

  // 3의 배수가 되도록 빈 슬롯 추가
  const createGridData = (data: Magazine[]) => {
    const remainder = data.length % 3
    if (remainder === 0) return data

    const emptySlots = 3 - remainder
    const gridData: (Magazine | null)[] = [...data]

    for (let i = 0; i < emptySlots; i++) {
      gridData.push(null)
    }

    return gridData
  }

  const handleMagazinePress = (magazine: Magazine) => {
    // TODO: 매거진 상세 페이지로 이동
    console.log('Magazine pressed:', magazine.title)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>매거진을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>오류가 발생했습니다</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const gridData = createGridData(magazines)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>매거진</Text>
      </View>

      <FlatList
        data={gridData}
        renderItem={({ item }) => (
          <MagazineItem magazine={item} onPress={handleMagazinePress} />
        )}
        numColumns={3}
        keyExtractor={(item, index) => item?.id || `empty-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: ITEM_MARGIN,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: ITEM_MARGIN,
    paddingVertical: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})
