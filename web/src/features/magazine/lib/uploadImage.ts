import imageCompression from 'browser-image-compression'

import { supabaseBrowserClient } from '@/shared/utils/supabase/client'

/**
 * 이미지를 압축하고 WebP로 변환하여 Supabase Storage에 업로드합니다.
 * @param file - 업로드할 이미지 파일
 * @param storagePath - images 버킷 내 저장할 경로 (예: 'cover', 'magazine/thumbnails')
 * @returns 업로드된 이미지의 public URL
 */
export async function uploadImage(
  file: File,
  storagePath: string,
): Promise<string> {
  try {
    // 1. 이미지 압축 옵션 설정
    const options = {
      maxSizeMB: 0.5, // 500KB 이하로 압축
      useWebWorker: true,
      fileType: 'image/webp', // WebP로 변환
    }

    // 2. 이미지 압축 및 WebP 변환
    const compressedFile = await imageCompression(file, options)

    // 3. 파일명 생성: yyyymmdd_hhmmss_microsecond.webp
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const microseconds = String(now.getMilliseconds() * 1000).padStart(6, '0')

    const fileName = `${year}${month}${day}_${hours}${minutes}${seconds}_${microseconds}.webp`

    // 4. 전체 파일 경로 생성 (images 버킷 내 경로)
    const fullPath = storagePath.endsWith('/')
      ? `${storagePath}${fileName}`
      : `${storagePath}/${fileName}`

    // 5. Supabase Storage에 업로드
    const supabase = supabaseBrowserClient
    const { data, error } = await supabase.storage
      .from('images') // 버킷 이름
      .upload(fullPath, compressedFile, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (error) {
      throw new Error(`이미지 업로드 실패: ${error.message}`)
    }

    // 6. Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error)
    throw error
  }
}
