import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface ReorderRequest {
  category_id: string
  magazine_orders: {
    magazine_id: string
    order: number
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ReorderRequest = await request.json()
    const { category_id, magazine_orders } = body

    if (!category_id || !magazine_orders || magazine_orders.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    // 각 매거진의 order를 업데이트
    const updatePromises = magazine_orders.map(({ magazine_id, order }) =>
      supabase
        .from('magazine_categories')
        .update({ order })
        .eq('magazine_id', magazine_id)
        .eq('category_id', category_id),
    )

    const results = await Promise.all(updatePromises)

    // 에러 체크
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Failed to update some orders:', errors)
      return NextResponse.json(
        { error: 'Failed to update some magazine orders' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Magazine order updated successfully',
    })
  } catch (error) {
    console.error('Reorder magazines error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
