import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface ReorderRequest {
  category_orders: {
    category_id: string
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
    const { category_orders } = body

    if (!category_orders || category_orders.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    // 각 카테고리의 order를 업데이트
    const updatePromises = category_orders.map(({ category_id, order }) =>
      supabase
        .from('categories')
        .update({ order })
        .eq('id', category_id),
    )

    const results = await Promise.all(updatePromises)

    // 에러 체크
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Failed to update some orders:', errors)
      return NextResponse.json(
        { error: 'Failed to update some category orders' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category order updated successfully',
    })
  } catch (error) {
    console.error('Reorder categories error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
