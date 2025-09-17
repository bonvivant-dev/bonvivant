import { useRouter } from 'expo-router'
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import Pdf from 'react-native-pdf'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

export function MagazineFullViewer({ magazineId }: { magazineId: string }) {
  const router = useRouter()
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

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

      // PDF URL 생성
      const pdfSignedUrl = await getPdfUrl(data)
      setPdfUrl(pdfSignedUrl)
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

  const getPdfUrl = async (magazineData: Magazine) => {
    const { data, error } = await supabase.storage
      .from('magazines')
      .createSignedUrl(
        `${magazineData.storage_key}/${magazineData.storage_key}.pdf`,
        3600
      )

    if (error) {
      console.error('Error creating signed URL:', error)
      return ''
    }

    return data.signedUrl
  }

  const handleClose = () => {
    router.back()
  }

  const handleLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages)
  }

  const handlePageChanged = (page: number) => {
    setCurrentPage(page)
  }

  const handleError = (error: any) => {
    console.error('PDF Error:', error)
    Alert.alert('오류', '매거진을 불러오는 중 오류가 발생했습니다.', [
      { text: '확인', onPress: handleClose },
    ])
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

  if (error || !magazine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>매거진을 불러올 수 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{magazine.title}</Text>
        <View style={styles.pageCounter}>
          <Text style={styles.pageCounterText}>
            {currentPage} / {totalPages}
          </Text>
        </View>
      </View>

      {/* PDF Content */}
      <View style={styles.contentContainer}>
        {pdfUrl ? (
          <Pdf
            source={{ uri: pdfUrl, cache: true }}
            onLoadComplete={handleLoadComplete}
            onPageChanged={handlePageChanged}
            onError={handleError}
            style={styles.pdf}
            enablePaging={true}
            horizontal={false}
            spacing={10}
            scale={1.0}
            minScale={0.5}
            maxScale={3.0}
            enableAntialiasing={true}
            enableAnnotationRendering={true}
            renderActivityIndicator={progress => (
              <View style={styles.pdfLoading}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                  PDF 로딩 중... {Math.round(progress * 100)}%
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>PDF를 불러오는 중...</Text>
          </View>
        )}
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
  pageCounter: {
    width: 60,
    alignItems: 'flex-end',
  },
  pageCounterText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    backgroundColor: '#000',
  },
  pdfLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
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
