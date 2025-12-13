import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 클라이언트에서 이미 Supabase Storage에 업로드 완료
    // 메타데이터만 받아서 DB에 저장
    const body = await request.json()

    const {
      storage_key,
      original_filename,
      safe_filename,
      preview_images,
      title,
      summary,
      introduction,
      category_ids,
      season_id,
      cover_image_url,
      price,
      is_purchasable,
      product_id,
    } = body

    if (!storage_key || !original_filename || !safe_filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    try {
      const { data: magazine, error: dbError } = await supabase
        .from('magazines')
        .insert({
          title: title || original_filename,
          summary: summary || null,
          introduction: introduction || null,
          season_id: season_id || null,
          storage_key,
          original_filename,
          safe_filename,
          cover_image: cover_image_url || null,
          preview_images: preview_images || [],
          price: price !== null && price !== undefined ? price : null,
          is_purchasable: is_purchasable || false,
          product_id: product_id || null,
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Failed to save magazine: ${dbError.message}`)
      }

      // 카테고리 관계 저장
      if (category_ids && category_ids.length > 0) {
        // 각 카테고리의 현재 최대 order 조회
        const categoryRelations = []
        for (const categoryId of category_ids) {
          const { data: maxOrderData } = await supabase
            .from('magazine_categories')
            .select('order')
            .eq('category_id', categoryId)
            .order('order', { ascending: false })
            .limit(1)
            .single()

          const nextOrder = maxOrderData ? (maxOrderData.order ?? 0) + 1 : 0

          categoryRelations.push({
            magazine_id: magazine.id,
            category_id: categoryId,
            order: nextOrder,
          })
        }

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
