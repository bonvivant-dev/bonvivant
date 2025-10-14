import path from 'path'

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface UploadPdfToStorageOptions {
  supabase: any
  storageKey: string
  safeFileName: string
  pdfBuffer: Buffer
}

async function uploadPdfToStorage({
  supabase,
  storageKey,
  safeFileName,
  pdfBuffer,
}: UploadPdfToStorageOptions): Promise<void> {
  const { error: pdfUploadError } = await supabase.storage
    .from('magazines')
    .upload(`${storageKey}/${safeFileName}`, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (pdfUploadError) {
    throw new Error(`Failed to upload PDF: ${pdfUploadError.message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 },
      )
    }

    // Extract magazine metadata from form
    const title = formData.get('title') as string
    const summary = formData.get('summary') as string
    const introduction = formData.get('introduction') as string
    const categoryIdsStr = formData.get('category_ids') as string
    const categoryIds = categoryIdsStr ? JSON.parse(categoryIdsStr) : []
    const seasonId = formData.get('season_id') as string

    const storageKey = uuidv4()
    const originalFileName = file.name
    const titleWithoutExt = title || path.parse(originalFileName).name
    const fileExtension = path.parse(originalFileName).ext
    const safeFileName = `${storageKey}${fileExtension}`

    const pdfBuffer = Buffer.from(await file.arrayBuffer())

    try {
      // Upload PDF to storage
      await uploadPdfToStorage({
        supabase,
        storageKey,
        safeFileName,
        pdfBuffer,
      })

      // 페이지 메타데이터 파싱
      const pageMetadataStr = formData.get('pageMetadata') as string
      const pageMetadata = pageMetadataStr ? JSON.parse(pageMetadataStr) : []

      // 클라이언트에서 변환된 이미지들을 Supabase Storage에 업로드
      const previewImages: string[] = []
      const imageEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith('image-'))
        .sort(([a], [b]) => {
          // image-0, image-1, image-2 순서로 정렬
          const indexA = parseInt(a.split('-')[1])
          const indexB = parseInt(b.split('-')[1])
          return indexA - indexB
        })

      for (const [key, imageBlob] of imageEntries) {
        const index = parseInt(key.split('-')[1])
        const metadata = pageMetadata[index]

        if (!metadata) {
          console.error(`No metadata found for index ${index}`)
          continue
        }

        const storagePath = `preview/${storageKey}/${metadata.originalPageNumber}.jpg`
        const fullPath = `images/${storagePath}`

        const { error: imageUploadError } = await supabase.storage
          .from('images')
          .upload(storagePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (imageUploadError) {
          console.error(`Error uploading image ${index}:`, imageUploadError)
        } else {
          previewImages.push(fullPath)
        }
      }

      // null 값 제거 (업로드 실패한 이미지)
      const finalPreviewImages = previewImages.filter(Boolean)

      const { data: magazine, error: dbError } = await supabase
        .from('magazines')
        .insert({
          title: titleWithoutExt,
          summary: summary || null,
          introduction: introduction || null,
          season_id: seasonId || null,
          storage_key: storageKey,
          original_filename: originalFileName,
          safe_filename: safeFileName,
          cover_image: finalPreviewImages[0] || null,
          preview_images: finalPreviewImages,
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Failed to save magazine: ${dbError.message}`)
      }

      // 카테고리 관계 저장
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map((categoryId: string) => ({
          magazine_id: magazine.id,
          category_id: categoryId,
        }))

        const { error: categoryError } = await supabase
          .from('magazine_categories')
          .insert(categoryRelations)

        if (categoryError) {
          console.error('Failed to save category relations:', categoryError)
        }
      }

      return NextResponse.json({
        success: true,
        magazine,
        message: 'Magazine uploaded successfully',
      })
    } catch (processingError) {
      console.error('Upload processing error:', processingError)
      return NextResponse.json(
        {
          error: 'Failed to process upload',
          details:
            processingError instanceof Error
              ? processingError.message
              : 'Unknown error',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
