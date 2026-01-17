import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

// Get all revisions for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const revisions = await sql`
      SELECT id, title, excerpt, content, edited_by, revision_note, created_at
      FROM post_revisions
      WHERE post_id = ${id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ revisions })
  } catch (error) {
    console.error('Get revisions error:', error)
    return NextResponse.json({ error: 'Failed to get revisions' }, { status: 500 })
  }
}

// Restore a specific revision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { revisionId } = body

    if (!revisionId) {
      return NextResponse.json({ error: 'Revision ID is required' }, { status: 400 })
    }

    // Get the revision
    const revision = await sql`
      SELECT title, excerpt, content
      FROM post_revisions
      WHERE id = ${revisionId} AND post_id = ${id}
    `

    if (revision.length === 0) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
    }

    // Get current post content (to save as revision before restoring)
    const current = await sql`
      SELECT title, excerpt, content
      FROM posts
      WHERE id = ${id}
    `

    if (current.length > 0) {
      // Save current version as revision before restoring
      await sql`
        INSERT INTO post_revisions (post_id, title, excerpt, content, edited_by, revision_note)
        VALUES (${id}, ${current[0].title}, ${current[0].excerpt || null}, ${current[0].content}, 'user', 'Antes de restaurar versão anterior')
      `
    }

    // Restore the revision
    await sql`
      UPDATE posts
      SET title = ${revision[0].title},
          excerpt = ${revision[0].excerpt},
          content = ${revision[0].content},
          updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Restore revision error:', error)
    return NextResponse.json({ error: 'Failed to restore revision' }, { status: 500 })
  }
}
