import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const posts = await sql`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        p.published,
        p.published_at,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
           FROM categories c
           JOIN post_categories pc ON pc.category_id = c.id
           WHERE pc.post_id = p.id), '[]'
        ) as categories,
        (SELECT COUNT(*) FROM page_views WHERE post_slug = p.slug) as views_count,
        (SELECT COUNT(*) FROM likes WHERE post_slug = p.slug) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_slug = p.slug AND is_approved = true) as comments_count
      FROM posts p
      WHERE p.slug = ${slug}
      LIMIT 1
    `

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: posts[0] })
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
