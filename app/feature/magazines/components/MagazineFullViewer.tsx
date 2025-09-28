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
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'

import { supabase } from '@/feature/shared'

import { Magazine } from '../types'

export function MagazineFullViewer({ magazineId }: { magazineId: string }) {
  const router = useRouter()
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>('')

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
      </View>

      {/* PDF Content */}
      <View style={styles.contentContainer}>
        {pdfUrl ? (
          <WebView
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
                  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"></script>
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      background: #000;
                      font-family: Arial, sans-serif;
                      overflow: hidden;
                    }
                    .pdf-container {
                      width: 100vw;
                      height: 100vh;
                      display: flex;
                      flex-direction: row;
                      overflow-x: auto;
                      overflow-y: hidden;
                      scroll-snap-type: x mandatory;
                      -webkit-overflow-scrolling: touch;
                    }
                    .pdf-page {
                      flex: 0 0 100vw;
                      height: 100vh;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      scroll-snap-align: start;
                      padding: 10px;
                      box-sizing: border-box;
                    }
                    canvas {
                      max-width: 100%;
                      max-height: 100%;
                      object-fit: contain;
                      box-shadow: 0 0 10px rgba(255,255,255,0.1);
                    }
                    .loading {
                      color: white;
                      text-align: center;
                      padding: 20px;
                      font-size: 18px;
                    }
                    .error {
                      color: #ff6b6b;
                      text-align: center;
                      padding: 20px;
                      font-size: 16px;
                    }
                    .page-indicator {
                      position: fixed;
                      bottom: 20px;
                      left: 50%;
                      transform: translateX(-50%);
                      background: rgba(0,0,0,0.7);
                      color: white;
                      padding: 8px 16px;
                      border-radius: 20px;
                      font-size: 14px;
                      z-index: 1000;
                    }
                  </style>
                </head>
                <body>
                  <div class="pdf-container" id="pdfContainer">
                    <div class="loading">PDF 로딩 중...</div>
                  </div>
                  <div class="page-indicator" id="pageIndicator">1 / 1</div>

                  <script>
                    const url = "${pdfUrl}";
                    const container = document.getElementById('pdfContainer');
                    const pageIndicator = document.getElementById('pageIndicator');

                    // PDF.js 워커 설정
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                    // 여러 CORS 프록시 시도
                    const corsProxies = [
                      '',  // 직접 시도
                      'https://api.allorigins.win/raw?url=',
                      'https://corsproxy.io/?',
                      'https://cors-anywhere.herokuapp.com/'
                    ];

                    async function tryLoadPdf() {
                      for (let i = 0; i < corsProxies.length; i++) {
                        try {
                          const proxyUrl = corsProxies[i] + (corsProxies[i] ? encodeURIComponent(url) : url);
                          console.log('Trying proxy:', proxyUrl);

                          const pdf = await pdfjsLib.getDocument(proxyUrl).promise;
                          return pdf;
                        } catch (error) {
                          console.log('Proxy failed:', corsProxies[i], error);
                          if (i === corsProxies.length - 1) throw error;
                        }
                      }
                    }

                    tryLoadPdf().then(function(pdf) {
                      container.innerHTML = '';
                      pageIndicator.textContent = '1 / ' + pdf.numPages;

                      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const pageDiv = document.createElement('div');
                        pageDiv.className = 'pdf-page';
                        pageDiv.setAttribute('data-page', pageNum);

                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        pageDiv.appendChild(canvas);
                        container.appendChild(pageDiv);

                        pdf.getPage(pageNum).then(function(page) {
                          const scale = Math.min(
                            (window.innerWidth) / page.getViewport({scale: 1}).width,
                            (window.innerHeight) / page.getViewport({scale: 1}).height
                          );

                          const viewport = page.getViewport({scale: scale});
                          canvas.height = viewport.height;
                          canvas.width = viewport.width;

                          const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                          };

                          page.render(renderContext).promise.then(function() {
                            console.log('Page ' + pageNum + ' rendered');
                          });
                        });
                      }

                      // 스크롤 이벤트로 페이지 표시 업데이트
                      container.addEventListener('scroll', function() {
                        const currentPage = Math.round(container.scrollLeft / container.clientWidth) + 1;
                        pageIndicator.textContent = currentPage + ' / ' + pdf.numPages;

                        // React Native에 페이지 변경 알림
                        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'pageChanged',
                          currentPage: currentPage,
                          totalPages: pdf.numPages
                        }));
                      });

                    }).catch(function(error) {
                      console.error('PDF loading error:', error);
                      container.innerHTML = '<div class="error">PDF를 불러올 수 없습니다.<br>네트워크를 확인해주세요.</div>';
                    });
                  </script>
                </body>
                </html>
              `,
            }}
            style={styles.pdf}
            onLoadStart={() => console.log('PDF 로딩 시작')}
            onLoadEnd={() => console.log('PDF 로딩 완료')}
            onError={syntheticEvent => {
              const { nativeEvent } = syntheticEvent
              console.error('WebView Error: ', nativeEvent)
              handleError(nativeEvent)
            }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.pdfLoading}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mixedContentMode="compatibility"
            scrollEnabled={true}
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
