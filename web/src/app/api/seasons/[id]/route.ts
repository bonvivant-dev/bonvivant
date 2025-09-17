import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/shared/lib'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await supabaseServerClient()
    const { id } = await params

    const { data: season, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching season:', error)
      return NextResponse.json(
        { error: 'Failed to fetch season' },
        { status: 500 },
      )
    }

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 })
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
        { error: 'Season name is required' },
        { status: 400 },
      )
    }

    const { data: season, error } = await supabase
      .from('seasons')
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Season name already exists' },
          { status: 409 },
        )
      }
      console.error('Error updating season:', error)
      return NextResponse.json(
        { error: 'Failed to update season' },
        { status: 500 },
      )
    }

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await supabaseServerClient()
    const { id } = params

    const { data: magazinesWithSeason } = await supabase
      .from('magazines')
      .select('id')
      .eq('season_id', id)
      .limit(1)

    if (magazinesWithSeason && magazinesWithSeason.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete season that has magazines assigned to it' },
        { status: 400 },
      )
    }

    const { error } = await supabase.from('seasons').delete().eq('id', id)

    if (error) {
      console.error('Error deleting season:', error)
      return NextResponse.json(
        { error: 'Failed to delete season' },
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
