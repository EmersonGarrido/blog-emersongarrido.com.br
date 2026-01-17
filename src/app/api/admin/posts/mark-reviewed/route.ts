import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

// Mark all published posts as reviewed by AI
export async function POST() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sql`
      UPDATE posts
      SET ai_reviewed = true
      WHERE published = true
      RETURNING id, title
    `

    return NextResponse.json({
      success: true,
      count: result.length,
      posts: result
    })
  } catch (error) {
    console.error('Mark reviewed error:', error)
    return NextResponse.json({ error: 'Failed to mark posts as reviewed' }, { status: 500 })
  }
}
