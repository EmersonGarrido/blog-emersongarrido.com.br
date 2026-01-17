import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Ensure comment_likes table exists
// Note: This table is now created by /api/setup
// Keeping function for backwards compatibility but it's a no-op
async function ensureCommentLikesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        visitor_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(comment_id, visitor_id)
      )
    `
  } catch {
    // Table already exists or other error - ignore
  }
}

// GET - List approved comments for a post or get count
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const countOnly = searchParams.get('count') === 'true'

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    // If only count is needed, return just the count (more efficient)
    if (countOnly) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM comments
        WHERE post_slug = ${slug} AND is_approved = true AND is_spam = false
      `
      const count = parseInt(result[0].count as string) || 0
      return NextResponse.json({ count })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               '127.0.0.1'
    const visitorId = ip

    // Try full query with comment_likes, fallback to simple query if table doesn't exist
    let comments
    try {
      await ensureCommentLikesTable()
      comments = await sql`
        SELECT
          c.id,
          c.author_name,
          c.content,
          c.created_at,
          COALESCE(c.is_edited, false) as is_edited,
          (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id)::int as likes_count,
          EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.visitor_id = ${visitorId}) as is_liked
        FROM comments c
        WHERE c.post_slug = ${slug} AND c.is_approved = true AND c.is_spam = false
        ORDER BY c.created_at DESC
      `
    } catch {
      // Fallback to simpler query without comment_likes
      comments = await sql`
        SELECT
          c.id,
          c.author_name,
          c.content,
          c.created_at,
          false as is_edited,
          0 as likes_count,
          false as is_liked
        FROM comments c
        WHERE c.post_slug = ${slug} AND c.is_approved = true AND c.is_spam = false
        ORDER BY c.created_at DESC
      `
    }

    // Include count in response for convenience
    return NextResponse.json({ comments, count: comments.length })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Failed to get comments' }, { status: 500 })
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, authorName, content } = body

    if (!slug || !content) {
      return NextResponse.json(
        { error: 'Slug and content are required' },
        { status: 400 }
      )
    }

    // Sanitize inputs - name is optional, defaults to "Anônimo"
    const sanitizedName = authorName?.trim().slice(0, 100) || 'Anônimo'
    const sanitizedContent = content.trim().slice(0, 2000)

    if (sanitizedContent.length < 3) {
      return NextResponse.json(
        { error: 'Comentário muito curto' },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               '127.0.0.1'
    const userAgent = headersList.get('user-agent') || ''

    // Insert comment (not approved by default)
    const result = await sql`
      INSERT INTO comments (post_slug, author_name, content, ip_address, user_agent, is_approved)
      VALUES (${slug}, ${sanitizedName}, ${sanitizedContent}, ${ip}, ${userAgent}, false)
      RETURNING id, author_name, content, created_at
    `

    return NextResponse.json({
      success: true,
      comment: result[0],
      message: 'Comentário enviado! Aguardando aprovação.'
    })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
