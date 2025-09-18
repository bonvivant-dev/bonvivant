import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await supabaseServerClient()

    const { data: seasons, error } = await supabase
      .from('seasons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching seasons:', error)
      return NextResponse.json(
        { error: 'Failed to fetch seasons' },
        { status: 500 },
      )
    }

    return NextResponse.json({ seasons })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServerClient()
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Season name is required' },
        { status: 400 },
      )
    }

    const { data: season, error } = await supabase
      .from('seasons')
      .insert([{ name: name.trim() }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Season name already exists' },
          { status: 409 },
        )
      }
      console.error('Error creating season:', error)
      return NextResponse.json(
        { error: 'Failed to create season' },
        { status: 500 },
      )
    }

    return NextResponse.json({ season })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
