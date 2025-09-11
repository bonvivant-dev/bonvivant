import { writeFileSync, unlinkSync, mkdirSync, readFileSync } from 'fs'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'
import pdf2pic from 'pdf2pic'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

import { supabaseServerClient } from '@/utils/supabase/server'

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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const tempDir = `/tmp/${storageKey}`
    mkdirSync(tempDir, { recursive: true })
    const tempPdfPath = `${tempDir}/temp.pdf`
    writeFileSync(tempPdfPath, buffer)

    try {
      const convert = pdf2pic.fromPath(tempPdfPath, {
        density: 100,
        saveFilename: 'image',
        savePath: tempDir,
        format: 'png',
        width: 600,
        height: 800,
      })

      const results = await Promise.all(
        [convert(1), convert(2), convert(3)].map(promise =>
          promise.catch(() => null),
        ),
      )

      const validResults = results.filter(result => result !== null)
      const previewImages: string[] = []

      for (let i = 0; i < validResults.length; i++) {
        if (validResults[i]) {
          const result = validResults[i]!
          const imagePath = result.path

          if (!imagePath) {
            console.error('Image path is undefined for result:', result)
            continue
          }

          const pngBuffer = readFileSync(imagePath)
          const webpBuffer = await sharp(pngBuffer)
            .webp({ quality: 80 })
            .toBuffer()

          const imageName = `image_${i}.webp`
          const { error: uploadError } = await supabase.storage
            .from('covers')
            .upload(`${storageKey}/${imageName}`, webpBuffer, {
              contentType: 'image/webp',
              upsert: true,
            })

          if (!uploadError) {
            previewImages.push(imageName)
          }

          // Clean up the generated PNG file
          try {
            unlinkSync(imagePath)
          } catch {
            // do nothing
          }
        }
      }

      const { error: pdfUploadError } = await supabase.storage
        .from('magazines')
        .upload(`${storageKey}/${safeFileName}`, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (pdfUploadError) {
        throw new Error(`Failed to upload PDF: ${pdfUploadError.message}`)
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

      unlinkSync(tempPdfPath)

      return NextResponse.json({
        success: true,
        magazine,
        message: 'Magazine uploaded successfully',
      })
    } catch (conversionError) {
      console.error('PDF conversion error:', conversionError)
      return NextResponse.json(
        {
          error: 'Failed to process PDF file',
          details:
            conversionError instanceof Error
              ? conversionError.message
              : 'Unknown error',
        },
        { status: 500 },
      )
    } finally {
      try {
        unlinkSync(tempPdfPath)
      } catch {
        // do nothing
      }
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
