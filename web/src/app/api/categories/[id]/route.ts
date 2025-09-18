import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await supabaseServerClient()
    const { id } = await params

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return NextResponse.json(
        { error: 'Failed to fetch category' },
        { status: 500 },
      )
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { name } = await request.json()
    const { id } = await params

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 },
      )
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 409 },
        )
      }
      console.error('Error updating category:', error)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 },
      )
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { id } = await params

    const { data: magazinesWithCategory } = await supabase
      .from('magazines')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (magazinesWithCategory && magazinesWithCategory.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has magazines assigned to it' },
        { status: 400 },
      )
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
