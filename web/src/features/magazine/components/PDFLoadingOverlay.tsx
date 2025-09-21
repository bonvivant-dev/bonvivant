'use client'

import { Portal } from '@/shared/components/Portal'

interface PDFLoadingOverlayProps {
  isOpen: boolean
  fileName: string
}

export function PDFLoadingOverlay({
  isOpen,
  fileName,
}: PDFLoadingOverlayProps) {
  return (
    <Portal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* PDF 아이콘 */}
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              PDF 변환 중
            </h3>

            {/* 파일명 */}
            <p className="text-sm text-gray-600 mb-4">
              {fileName}을 이미지로 변환하고 있습니다...
            </p>

            {/* 스피너 */}
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
