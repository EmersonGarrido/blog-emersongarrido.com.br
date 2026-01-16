import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// GET - List approved comments for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const comments = await sql`
      SELECT id, author_name, content, created_at
      FROM comments
      WHERE post_slug = ${slug} AND is_approved = true AND is_spam = false
      ORDER BY created_at DESC
    `

    return NextResponse.json({ comments })
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
