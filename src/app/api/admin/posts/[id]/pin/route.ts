import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

// Toggle pin status for a post
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
    // Get current pin status
    const current = await sql`SELECT is_pinned FROM posts WHERE id = ${id}`
    if (current.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const newPinStatus = !current[0].is_pinned

    if (newPinStatus) {
      // If pinning, first unpin any other pinned post (only one can be pinned)
      await sql`UPDATE posts SET is_pinned = false WHERE is_pinned = true`
    }

    // Update the pin status
    await sql`UPDATE posts SET is_pinned = ${newPinStatus} WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      is_pinned: newPinStatus
    })
  } catch (error) {
    console.error('Pin post error:', error)
    return NextResponse.json({ error: 'Failed to pin post' }, { status: 500 })
  }
}
