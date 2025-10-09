import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { data: magazine, error } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !magazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    return NextResponse.json({ magazine })
  } catch (error) {
    console.error('Get magazine error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { data: currentMagazine, error: fetchError } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentMagazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    // Check if request has FormData (for image updates) or JSON (for simple updates)
    const contentType = request.headers.get('content-type') || ''
    let title, summary, introduction, season_id, category_ids, pageMetadata

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (image updates included)
      const formData = await request.formData()

      title = formData.get('title') as string
      summary = formData.get('summary') as string
      introduction = formData.get('introduction') as string
      season_id = formData.get('season_id') as string
      const categoryIdsStr = formData.get('category_ids') as string
      category_ids = categoryIdsStr ? JSON.parse(categoryIdsStr) : []
      pageMetadata = formData.get('pageMetadata') as string

      // Handle preview image updates if pageMetadata exists
      if (pageMetadata) {
        try {
          const metadata = JSON.parse(pageMetadata)
          const previewImages: string[] = []

          // Process new preview images
          for (let i = 0; i < metadata.length; i++) {
            const imageFile = formData.get(`image-${i}`) as File
            if (imageFile) {
              const fileName = metadata[i].fileName

              // Upload to covers bucket
              const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(
                  `${currentMagazine.storage_key}/${fileName}`,
                  imageFile,
                  {
                    contentType: 'image/jpeg',
                    upsert: true,
                  },
                )

              if (uploadError) {
                console.error('Preview image upload error:', uploadError)
              } else {
                previewImages.push(fileName)
              }
            }
          }

          // Update preview_images and cover_image in database
          if (previewImages.length > 0) {
            await supabase
              .from('magazines')
              .update({
                preview_images: previewImages,
                cover_image: previewImages[0],
              })
              .eq('id', id)
          }
        } catch (metadataError) {
          console.error('Preview image processing error:', metadataError)
        }
      }
    } else {
      // Handle JSON (simple metadata updates)
      const body = await request.json()
      title = body.title
      summary = body.summary
      introduction = body.introduction
      season_id = body.season_id
      category_ids = body.category_ids
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (summary !== undefined) updateData.summary = summary
    if (introduction !== undefined) updateData.introduction = introduction
    if (title !== undefined) updateData.title = title
    if (season_id !== undefined) {
      updateData.season_id = season_id || null
    }

    // Handle PDF file rename if title changed
    if (title && title !== currentMagazine.title) {
      try {
        const { data: files } = await supabase.storage
          .from('magazines')
          .list(currentMagazine.storage_key)

        if (files && files.length > 0) {
          const pdfFile = files.find(file => file.name.endsWith('.pdf'))
          if (pdfFile) {
            const oldFileName = pdfFile.name
            const newFileName = `${currentMagazine.storage_key}.pdf`

            if (oldFileName !== newFileName) {
              const { data: fileData } = await supabase.storage
                .from('magazines')
                .download(`${currentMagazine.storage_key}/${oldFileName}`)

              if (fileData) {
                await supabase.storage
                  .from('magazines')
                  .upload(
                    `${currentMagazine.storage_key}/${newFileName}`,
                    fileData,
                    {
                      contentType: 'application/pdf',
                      upsert: true,
                    },
                  )

                await supabase.storage
                  .from('magazines')
                  .remove([`${currentMagazine.storage_key}/${oldFileName}`])
              }
            }
          }
        }
      } catch (storageError) {
        console.error('Storage update error:', storageError)
      }
    }

    const { data: magazine, error: updateError } = await supabase
      .from('magazines')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 카테고리 관계 업데이트
    if (category_ids !== undefined) {
      // 기존 카테고리 관계 삭제
      await supabase
        .from('magazine_categories')
        .delete()
        .eq('magazine_id', id)

      // 새로운 카테고리 관계 추가
      if (category_ids.length > 0) {
        const categoryRelations = category_ids.map((categoryId: string) => ({
          magazine_id: id,
          category_id: categoryId,
        }))

        const { error: categoryError } = await supabase
          .from('magazine_categories')
          .insert(categoryRelations)

        if (categoryError) {
          console.error('Failed to update category relations:', categoryError)
        }
      }
    }

    return NextResponse.json({
      magazine,
      message: 'Magazine updated successfully',
    })
  } catch (error) {
    console.error('Update magazine error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { data: magazine, error: fetchError } = await supabase
      .from('magazines')
      .select('storage_key')
      .eq('id', id)
      .single()

    if (fetchError || !magazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    try {
      await supabase.storage.from('magazines').remove([magazine.storage_key])

      await supabase.storage.from('covers').remove([magazine.storage_key])
    } catch (storageError) {
      console.error('Storage cleanup error:', storageError)
    }

    const { error: deleteError } = await supabase
      .from('magazines')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Magazine deleted successfully',
    })
  } catch (error) {
    console.error('Delete magazine error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
