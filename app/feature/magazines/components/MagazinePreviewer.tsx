import { useRouter } from 'expo-router'
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

const { width, height } = Dimensions.get('window')

export function MagazinePreviewer({ magazineId }: { magazineId: string }) {
  const router = useRouter()
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const fetchMagazine = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .eq('id', magazineId)
        .single()

      if (error) {
        throw error
      }

      setMagazine(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [magazineId])

  useEffect(() => {
    if (!magazineId) return
    fetchMagazine()
  }, [magazineId, fetchMagazine])

  const getPreviewImageUrl = (imagePath: string) => {
    return supabase.storage
      .from('covers')
      .getPublicUrl(`${magazine?.storage_key}/${imagePath}`).data.publicUrl
  }

  const handleClose = () => {
    router.back()
  }

  const showPurchaseDialog = () => {
    Alert.alert(
      '매거진 구매',
      `${magazine?.title}의 전체 내용을 보시려면 구매가 필요합니다.\n구매하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '구매하기',
          onPress: () => {
            // TODO: 구매 기능 구현
            console.log('Purchase magazine:', magazine?.title)
            Alert.alert('구매 완료', '매거진 구매가 완료되었습니다!')
          },
        },
      ]
    )
  }

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)

    const isLastPage =
      magazine?.preview_images &&
      pageIndex === magazine.preview_images.length - 1
    // 마지막 페이지에 도달했을 때 구매 다이얼로그 표시
    if (isLastPage) {
      setTimeout(() => {
        showPurchaseDialog()
      }, 500) // 0.5초 후에 다이얼로그 표시
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>미리보기를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !magazine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>미리보기를 불러올 수 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!magazine.preview_images || magazine.preview_images.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>미리보기 이미지가 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // 첫 3개의 미리보기 이미지만 사용
  const previewImages = magazine.preview_images

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{magazine.title} 미리보기</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Preview Images */}
        <View style={styles.imageListContainer}>
          <FlatList
            data={previewImages}
            renderItem={({ item }) => {
              const imageUrl = getPreviewImageUrl(item)

              return (
                <View style={styles.pageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.pageImage}
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
                event.nativeEvent.contentOffset.x / width
              )
              handlePageChange(pageIndex)
            }}
          />
        </View>

        {/* Fixed Page Number */}
        <View style={styles.pageNumberContainer}>
          <Text style={styles.fixedPageNumber}>
            {currentPage + 1} / {previewImages.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageListContainer: {
    height: height * 0.6, // 화면 높이의 60%를 이미지 영역으로 사용
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContainer: {
    width,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageImage: {
    width: width - 24,
    height: '100%',
  },
  pageNumberContainer: {
    marginTop: 60, // 이미지 아래 60px 간격
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedPageNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
