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

    const storageKey = uuidv4()
    const originalFileName = file.name
    const titleWithoutExt = path.parse(originalFileName).name
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

      // 클라이언트에서 변환된 이미지들을 Supabase Storage에 업로드
      const previewImages: string[] = []
      const imageEntries = Array.from(formData.entries()).filter(([key]) =>
        key.startsWith('image-'),
      )

      for (const [key, imageBlob] of imageEntries) {
        const index = key.split('-')[1]
        const fileName = `${storageKey}/page-${parseInt(index) + 1}.jpg`

        const { error: imageUploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (imageUploadError) {
          console.error(`Error uploading image ${index}:`, imageUploadError)
        } else {
          // Public URL 생성
          const {
            data: { publicUrl },
          } = supabase.storage.from('covers').getPublicUrl(fileName)

          // get only filename from publicUrl
          const filename = publicUrl.split('/').pop() || ''
          previewImages.push(filename)
        }
      }

      const { data: magazine, error: dbError } = await supabase
        .from('magazines')
        .insert({
          title: titleWithoutExt,
          storage_key: storageKey,
          original_filename: originalFileName,
          safe_filename: safeFileName,
          cover_image: previewImages[0] || null,
          preview_images: previewImages,
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Failed to save magazine: ${dbError.message}`)
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
