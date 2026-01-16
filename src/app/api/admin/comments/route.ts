import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

// GET - List all comments (for admin)
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'pending', 'approved', 'spam', 'all'

  try {
    let comments

    if (status === 'pending') {
      comments = await sql`
        SELECT * FROM comments
        WHERE is_approved = false AND is_spam = false
        ORDER BY created_at DESC
      `
    } else if (status === 'approved') {
      comments = await sql`
        SELECT * FROM comments
        WHERE is_approved = true
        ORDER BY created_at DESC
      `
    } else if (status === 'spam') {
      comments = await sql`
        SELECT * FROM comments
        WHERE is_spam = true
        ORDER BY created_at DESC
      `
    } else {
      comments = await sql`
        SELECT * FROM comments
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get admin comments error:', error)
    return NextResponse.json({ error: 'Failed to get comments' }, { status: 500 })
  }
}

// PATCH - Update comment (approve/reject/spam/edit)
export async function PATCH(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, action, content } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Handle edit action
    if (action === 'edit' && content !== undefined) {
      // First ensure is_edited column exists
      await sql`
        DO $$ BEGIN
          ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END $$;
      `

      await sql`
        UPDATE comments SET content = ${content}, is_edited = true WHERE id = ${id}
      `
      return NextResponse.json({ success: true })
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      await sql`
        UPDATE comments SET is_approved = true, is_spam = false WHERE id = ${id}
      `
    } else if (action === 'reject') {
      await sql`
        UPDATE comments SET is_approved = false WHERE id = ${id}
      `
    } else if (action === 'spam') {
      await sql`
        UPDATE comments SET is_spam = true, is_approved = false WHERE id = ${id}
      `
    } else if (action !== 'edit') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    await sql`DELETE FROM comments WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
