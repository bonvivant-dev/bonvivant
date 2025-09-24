import { NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

interface MagazinesByCategory {
  categories: Array<{
    id: string
    name: string
    magazines: any[]
  }>
  uncategorized: any[]
}

export async function GET() {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 모든 카테고리 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (categoriesError) {
      return NextResponse.json(
        { error: categoriesError.message },
        { status: 500 },
      )
    }

    // 모든 매거진 조회
    const { data: magazines, error: magazinesError } = await supabase
      .from('magazines')
      .select('*')
      .order('created_at', { ascending: false })

    if (magazinesError) {
      return NextResponse.json(
        { error: magazinesError.message },
        { status: 500 },
      )
    }

    // 카테고리별로 매거진 그룹핑
    const result: MagazinesByCategory = {
      categories: [],
      uncategorized: [],
    }

    // 카테고리가 있는 매거진들을 카테고리별로 분류
    for (const category of categories || []) {
      const categoryMagazines = (magazines || []).filter(
        magazine => magazine.category_id === category.id,
      )

      result.categories.push({
        id: category.id,
        name: category.name,
        magazines: categoryMagazines,
      })
    }

    // 카테고리가 없는 매거진들
    result.uncategorized = (magazines || []).filter(
      magazine => !magazine.category_id,
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get magazines by categories error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}