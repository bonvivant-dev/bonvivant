import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const seasonId = searchParams.get('season_id')

    let query = supabase
      .from('magazines')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (seasonId) {
      if (seasonId === 'null') {
        query = query.is('season_id', null)
      } else {
        query = query.eq('season_id', seasonId)
      }
    }

    const { data: magazines, error } = await query.range(
      (page - 1) * limit,
      page * limit - 1,
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let countQuery = supabase
      .from('magazines')
      .select('*', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.ilike('title', `%${search}%`)
    }

    if (seasonId) {
      if (seasonId === 'null') {
        countQuery = countQuery.is('season_id', null)
      } else {
        countQuery = countQuery.eq('season_id', seasonId)
      }
    }

    const { count } = await countQuery

    return NextResponse.json({
      magazines: magazines || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Get magazines error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
