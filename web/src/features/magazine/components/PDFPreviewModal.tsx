/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

import { PDFPageImage } from '../lib/convertPdfToImages'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pages: PDFPageImage[]
  onConfirm: (selectedPages: PDFPageImage[]) => void
  title: string
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pages,
  onConfirm,
  title,
}: PDFPreviewModalProps) {
  const [selectedPageNumbers, setSelectedPageNumbers] = useState<Set<number>>(
    new Set(),
  )
  const [, setCurrentSlide] = useState(0)

  // 초기에 첫 3페이지를 선택된 상태로 설정
  useEffect(() => {
    if (pages.length > 0) {
      const initialSelection = new Set(
        pages.slice(0, Math.min(3, pages.length)).map(page => page.pageNumber),
      )
      setSelectedPageNumbers(initialSelection)
    }
  }, [pages])

  const togglePageSelection = (pageNumber: number) => {
    const newSelection = new Set(selectedPageNumbers)
    if (newSelection.has(pageNumber)) {
      newSelection.delete(pageNumber)
    } else {
      newSelection.add(pageNumber)
    }
    setSelectedPageNumbers(newSelection)
  }

  const handleConfirm = () => {
    const selectedPages = pages.filter(page =>
      selectedPageNumbers.has(page.pageNumber),
    )
    onConfirm(selectedPages)
    onClose()
  }

  const selectedPages = pages.filter(page =>
    selectedPageNumbers.has(page.pageNumber),
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[1400px] min-w-[1200px] h-90vh bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-400">
          <div>
            <h2 className="text-xl font-semibold">
              {title} - 총 {pages.length}페이지
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col">
          {/* Swiper Section */}
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              미리보기로 사용할 페이지를 선택하세요
            </p>
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                spaceBetween={12}
                slidesPerView={4}
                onSlideChange={swiper => setCurrentSlide(swiper.activeIndex)}
                className="h-full"
              >
                {pages.map(page => (
                  <SwiperSlide
                    key={page.pageNumber}
                    className="flex items-center justify-center content-center"
                  >
                    <div
                      className="relative cursor-pointer border border-gray-400 p-1 hover:opacity-80"
                      onClick={() => togglePageSelection(page.pageNumber)}
                    >
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                        {page.pageNumber}
                      </div>
                      <button
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          selectedPageNumbers.has(page.pageNumber)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 text-gray-600'
                        }`}
                      >
                        {selectedPageNumbers.has(page.pageNumber) && '✓'}
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <div className="flex justify-center mt-4 gap-4">
                <button className="swiper-button-prev-custom bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                  ‹
                </button>
                <button className="swiper-button-next-custom bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Selected Images Section */}
          <div className="border-t border-gray-400 bg-gray-50 p-4 h-[280px] flex flex-col">
            <h3 className="text-sm text-gray-600 mb-3">
              선택한 페이지가 순서대로 보여집니다
            </h3>
            <div className="flex gap-2 overflow-x-auto h-full">
              {selectedPages.length > 0 ? (
                selectedPages
                  .sort((a, b) => a.pageNumber - b.pageNumber)
                  .map(page => (
                    <div
                      key={page.pageNumber}
                      className="flex-shrink-0 relative"
                    >
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="h-full object-cover rounded border"
                      />
                      <button
                        onClick={() => togglePageSelection(page.pageNumber)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))
              ) : (
                <div className="h-[200px] w-[150px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                  <p className="text-center">
                    선택된 페이지가
                    <br />
                    없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="items-center justify-between p-2 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 w-[100px] border border-gray-300 rounded hover:bg-gray-200 cursor-pointer text-lg"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedPageNumbers.size === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-lg"
            >
              확인 ({selectedPageNumbers.size}개)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
