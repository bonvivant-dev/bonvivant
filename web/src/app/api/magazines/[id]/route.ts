import path from 'path'

import { NextRequest, NextResponse } from 'next/server'

import { supabaseServerClient } from '@/utils/supabase/server'

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

    const body = await request.json()
    const { title, summary, introduction, season_id } = body

    const { id } = await params
    const { data: currentMagazine, error: fetchError } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentMagazine) {
      return NextResponse.json({ error: 'Magazine not found' }, { status: 404 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (summary !== undefined) updateData.summary = summary
    if (introduction !== undefined) updateData.introduction = introduction
    if (title !== undefined) updateData.title = title
    if (season_id !== undefined) {
      updateData.season_id = season_id || null
    }

    if (title && title !== currentMagazine.title) {
      try {
        const { data: files } = await supabase.storage
          .from('magazines')
          .list(currentMagazine.storage_key)

        if (files && files.length > 0) {
          const oldFile = files[0]
          const oldFileName = oldFile.name
          const fileExtension = path.extname(oldFileName)
          const newFileName = `${title}${fileExtension}`

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
      await supabase.storage.from('magazines').remove([magazine.storage_key])

      await supabase.storage.from('covers').remove([magazine.storage_key])
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
