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

    // 'new' 카테고리를 맨 위로 정렬
    const sortedCategories = categories ? [...categories].sort((a, b) => {
      if (a.name.toLowerCase() === 'new') return -1
      if (b.name.toLowerCase() === 'new') return 1
      return 0
    }) : []

    if (categoriesError) {
      return NextResponse.json(
        { error: categoriesError.message },
        { status: 500 },
      )
    }

    // 모든 매거진과 카테고리 관계 조회
    const { data: magazines, error: magazinesError } = await supabase
      .from('magazines')
      .select(`
        *,
        magazine_categories (
          category_id,
          order,
          categories (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (magazinesError) {
      return NextResponse.json(
        { error: magazinesError.message },
        { status: 500 },
      )
    }

    // 매거진 데이터 정리 (category_ids와 order 정보 추가)
    const processedMagazines = (magazines || []).map(magazine => {
      // 카테고리별 order를 매핑으로 저장
      const categoryOrders: { [categoryId: string]: number } = {}
      magazine.magazine_categories?.forEach((mc: any) => {
        if (mc.category_id) {
          categoryOrders[mc.category_id] = mc.order ?? 0
        }
      })

      return {
        ...magazine,
        category_ids: magazine.magazine_categories?.map((mc: any) => mc.category_id) || [],
        categories: magazine.magazine_categories?.map((mc: any) => mc.categories).filter(Boolean) || [],
        category_orders: categoryOrders,
      }
    })

    // 카테고리별로 매거진 그룹핑
    const result: MagazinesByCategory = {
      categories: [],
      uncategorized: [],
    }

    // 카테고리가 있는 매거진들을 카테고리별로 분류
    for (const category of sortedCategories) {
      const categoryMagazines = processedMagazines
        .filter(magazine => magazine.category_ids.includes(category.id))
        .sort((a, b) => {
          const orderA = a.category_orders[category.id] ?? 0
          const orderB = b.category_orders[category.id] ?? 0
          return orderA - orderB
        })

      result.categories.push({
        id: category.id,
        name: category.name,
        magazines: categoryMagazines,
      })
    }

    // 카테고리가 없는 매거진들
    result.uncategorized = processedMagazines.filter(
      magazine => magazine.category_ids.length === 0,
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