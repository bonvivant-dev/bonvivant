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

    // 클라이언트에서 이미 Supabase Storage에 업로드 완료
    // 메타데이터만 받아서 DB에 저장
    const body = await request.json()

    const title = body.title
    const summary = body.summary
    const introduction = body.introduction
    const season_id = body.season_id
    const category_ids = body.category_ids
    const price = body.price
    const is_purchasable = body.is_purchasable
    const product_id = body.product_id
    const preview_images = body.preview_images
    const cover_image_url = body.cover_image_url

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (summary !== undefined) updateData.summary = summary
    if (introduction !== undefined) updateData.introduction = introduction
    if (title !== undefined) updateData.title = title
    if (season_id !== undefined) {
      updateData.season_id = season_id || null
    }
    if (price !== undefined) updateData.price = price
    if (is_purchasable !== undefined) updateData.is_purchasable = is_purchasable
    if (product_id !== undefined) updateData.product_id = product_id || null
    if (preview_images !== undefined) updateData.preview_images = preview_images
    if (cover_image_url !== undefined)
      updateData.cover_image = cover_image_url || null

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
      // 기존 카테고리 관계 조회 (order 포함)
      const { data: existingRelations } = await supabase
        .from('magazine_categories')
        .select('category_id, order')
        .eq('magazine_id', id)

      // 기존 카테고리별 order를 맵으로 저장
      const existingOrderMap = new Map<string, number>()
      existingRelations?.forEach(rel => {
        existingOrderMap.set(rel.category_id, rel.order ?? 0)
      })

      // 기존 카테고리 관계 삭제
      await supabase
        .from('magazine_categories')
        .delete()
        .eq('magazine_id', id)

      // 새로운 카테고리 관계 추가
      if (category_ids.length > 0) {
        const categoryRelations = []

        for (const categoryId of category_ids) {
          let order: number

          if (existingOrderMap.has(categoryId)) {
            // 기존에 있던 카테고리면 기존 order 유지
            order = existingOrderMap.get(categoryId)!
          } else {
            // 새로운 카테고리면 해당 카테고리의 최대 order + 1
            const { data: maxOrderData } = await supabase
              .from('magazine_categories')
              .select('order')
              .eq('category_id', categoryId)
              .order('order', { ascending: false })
              .limit(1)
              .single()

            order = maxOrderData ? (maxOrderData.order ?? 0) + 1 : 0
          }

          categoryRelations.push({
            magazine_id: id,
            category_id: categoryId,
            order,
          })
        }

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
      // Remove PDF from magazines storage
      await supabase.storage.from('magazines').remove([magazine.storage_key])

      // Remove preview images from images storage
      const { data: previewFiles } = await supabase.storage
        .from('images')
        .list(`preview/${magazine.storage_key}`)

      if (previewFiles && previewFiles.length > 0) {
        const filePaths = previewFiles.map(
          file => `preview/${magazine.storage_key}/${file.name}`,
        )
        await supabase.storage.from('images').remove(filePaths)
      }
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
