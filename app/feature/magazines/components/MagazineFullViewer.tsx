import { useRouter } from 'expo-router'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'

import { Text } from '@/feature/shared/components'
import { supabase } from '@/feature/shared/lib'

import { Magazine } from '../types'

export function MagazineFullViewer({ magazineId }: { magazineId: string }) {
  const router = useRouter()
  const [magazine, setMagazine] = useState<Magazine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const webViewRef = useRef<any>(null)

  const getSignedUrl = useCallback(async (magazineData: Magazine) => {
    const { data, error } = await supabase.storage
      .from('magazines')
      .createSignedUrl(
        `${magazineData.storage_key}/${magazineData.storage_key}.pdf`,
        3600
      )
    if (error || !data?.signedUrl) throw error
    return data.signedUrl
  }, [])

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

      const url = await getSignedUrl(data)
      setPdfUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [magazineId, getSignedUrl])

  useEffect(() => {
    if (!magazineId) return
    fetchMagazine()
  }, [magazineId, fetchMagazine])

  const handleClose = () => {
    router.back()
  }

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.type === 'console') {
        if (data.level === 'error') {
          console.error('[WebView]', data.message)
        } else {
          console.log('[WebView]', data.message)
        }
      } else if (data.type === 'pdfLoaded') {
        setPdfLoaded(true)
      } else if (data.type === 'pageChanged') {
        // 페이지 변경 이벤트 처리 (필요시)
      }
    } catch (error) {
      console.error('WebView 메시지 파싱 에러:', error)
    }
  }

  const getInjectedJavaScript = () => {
    if (!pdfUrl) return ''

    return `
      (function() {
        if (typeof loadPdfUrl === 'function') {
          loadPdfUrl('${pdfUrl}');
        } else {
          console.error('loadPdfUrl 함수를 찾을 수 없습니다');
        }
      })();
      true;
    `
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>글을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !magazine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>글을 불러올 수 없어요</Text>
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
        <Text style={styles.headerTitle}>{magazine.title}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Content */}
      <View style={styles.contentContainer}>
        {pdfUrl ? (
          <>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              onError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                console.error('WebView Error:', nativeEvent)
              }}
              onHttpError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                console.error('WebView HTTP Error:', nativeEvent)
              }}
              onMessage={handleWebViewMessage}
              renderError={errorName => (
                <View style={styles.centered}>
                  <Text style={styles.errorText}>
                    WebView 에러: {errorName}
                  </Text>
                </View>
              )}
              injectedJavaScript={getInjectedJavaScript()}
              source={{
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
                  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
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
                    // 콘솔 로그를 React Native로 전송
                    const originalLog = console.log;
                    const originalError = console.error;

                    console.log = function(...args) {
                      originalLog.apply(console, args);
                      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'console',
                        level: 'log',
                        message: args.join(' ')
                      }));
                    };
                    console.error = function(...args) {
                      originalError.apply(console, args);
                      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'console',
                        level: 'error',
                        message: args.join(' ')
                      }));
                    };

                    const container = document.getElementById('pdfContainer');
                    const pageIndicator = document.getElementById('pageIndicator');

                    // PDF.js 워커 설정
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                    function renderPage(pdf, pageNum, pageDiv) {
                      pdf.getPage(pageNum).then(function(page) {
                        var scale = Math.min(window.devicePixelRatio || 1, 1.5);
                        var viewport = page.getViewport({scale: scale});

                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        canvas.style.width = '100%';
                        canvas.style.height = '100%';
                        pageDiv.appendChild(canvas);

                        page.render({canvasContext: context, viewport: viewport}).promise.then(function() {
                          // 첫 페이지 렌더 완료 시 React Native에 알림
                          if (pageNum === 1) {
                            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'pdfLoaded',
                              totalPages: pdf.numPages
                            }));
                          }
                        });
                      });
                    }

                    // URL로 PDF 로드 (injectedJavaScript에서 호출됨)
                    window.loadPdfUrl = function(url) {
                      pdfjsLib.getDocument({url: url}).promise.then(function(pdf) {
                        console.log('PDF 로드 성공, 페이지 수:', pdf.numPages);
                        container.innerHTML = '';
                        var totalPages = pdf.numPages;
                        pageIndicator.textContent = '1 / ' + totalPages;

                        var pageDivs = [];

                        // 전체 페이지 수만큼 placeholder div 생성
                        for (var i = 1; i <= totalPages; i++) {
                          var pageDiv = document.createElement('div');
                          pageDiv.className = 'pdf-page';
                          pageDiv.setAttribute('data-page', i);
                          container.appendChild(pageDiv);
                          pageDivs.push(pageDiv);
                        }

                        // IntersectionObserver로 뷰포트 진입 시 해당 페이지만 렌더링
                        var observer = new IntersectionObserver(function(entries) {
                          entries.forEach(function(entry) {
                            if (entry.isIntersecting && !entry.target.dataset.rendered) {
                              var pageNum = parseInt(entry.target.getAttribute('data-page'));
                              entry.target.dataset.rendered = 'true';
                              renderPage(pdf, pageNum, entry.target);
                            }
                          });
                        }, {threshold: 0.1});

                        pageDivs.forEach(function(div) { observer.observe(div); });

                        // 스크롤 이벤트로 페이지 표시 업데이트
                        container.addEventListener('scroll', function() {
                          var currentPage = Math.round(container.scrollLeft / container.clientWidth) + 1;
                          pageIndicator.textContent = currentPage + ' / ' + totalPages;

                          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'pageChanged',
                            currentPage: currentPage,
                            totalPages: totalPages
                          }));
                        });

                      }).catch(function(error) {
                        console.error('PDF 렌더링 에러:', error);
                        container.innerHTML = '<div class="error">PDF를 불러올 수 없습니다.<br>네트워크를 확인해주세요.</div>';
                      });
                    };

                    // React Native에 준비 완료 알림
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'ready'
                    }));
                  </script>
                </body>
                </html>
              `,
              }}
              style={styles.pdf}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mixedContentMode="compatibility"
              scrollEnabled={true}
            />
            {/* Unified Loading Overlay */}
            {!pdfLoaded && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>글을 불러오는 중...</Text>
              </View>
            )}
          </>
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
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1000,
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
  },
})
