'use client'

import { Portal } from './Portal'

interface LoadingOverlayProps {
  isOpen: boolean
  icon: React.ReactNode
  title: string
  message: string
}

export function LoadingOverlay({
  isOpen,
  icon,
  title,
  message,
}: LoadingOverlayProps) {
  return (
    <Portal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* PDF 아이콘 */}
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              {icon}
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>

            {/* 파일명 */}
            <p className="text-sm text-gray-600 mb-4">{message}</p>

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
