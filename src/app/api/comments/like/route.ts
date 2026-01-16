import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// POST - Like a comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId } = body

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               '127.0.0.1'
    const visitorId = ip

    // Insert like (ignore if already exists)
    await sql`
      INSERT INTO comment_likes (comment_id, visitor_id)
      VALUES (${commentId}, ${visitorId})
      ON CONFLICT (comment_id, visitor_id) DO NOTHING
    `

    // Get updated count
    const result = await sql`
      SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ${commentId}
    `

    return NextResponse.json({
      success: true,
      likes_count: parseInt(result[0].count as string) || 0,
      is_liked: true
    })
  } catch (error) {
    console.error('Like comment error:', error)
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 })
  }
}

// DELETE - Unlike a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               '127.0.0.1'
    const visitorId = ip

    await sql`
      DELETE FROM comment_likes WHERE comment_id = ${commentId} AND visitor_id = ${visitorId}
    `

    // Get updated count
    const result = await sql`
      SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ${commentId}
    `

    return NextResponse.json({
      success: true,
      likes_count: parseInt(result[0].count as string) || 0,
      is_liked: false
    })
  } catch (error) {
    console.error('Unlike comment error:', error)
    return NextResponse.json({ error: 'Failed to unlike comment' }, { status: 500 })
  }
}
