import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Get all posts
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // all, published, draft

  try {
    let posts
    if (status === 'published') {
      posts = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
             FROM categories c
             JOIN post_categories pc ON pc.category_id = c.id
             WHERE pc.post_id = p.id), '[]'
          ) as categories,
          (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
        FROM posts p
        WHERE p.published = true
        ORDER BY p.published_at DESC
      `
    } else if (status === 'draft') {
      posts = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
             FROM categories c
             JOIN post_categories pc ON pc.category_id = c.id
             WHERE pc.post_id = p.id), '[]'
          ) as categories,
          (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
        FROM posts p
        WHERE p.published = false
        ORDER BY p.created_at DESC
      `
    } else {
      posts = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
             FROM categories c
             JOIN post_categories pc ON pc.category_id = c.id
             WHERE pc.post_id = p.id), '[]'
          ) as categories,
          (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
        FROM posts p
        ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
      `
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: 'Failed to get posts' }, { status: 500 })
  }
}

// Create new post
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, excerpt, content, image, published, categories } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = slugify(title)

    // Check if slug already exists
    const existing = await sql`SELECT id FROM posts WHERE slug = ${slug}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A post with this title already exists' }, { status: 400 })
    }

    const publishedAt = published ? new Date() : null

    const result = await sql`
      INSERT INTO posts (slug, title, excerpt, content, image, published, published_at)
      VALUES (${slug}, ${title}, ${excerpt || null}, ${content}, ${image || null}, ${published || false}, ${publishedAt})
      RETURNING id
    `

    const postId = result[0].id

    // Add categories
    if (categories && Array.isArray(categories)) {
      for (const categoryId of categories) {
        await sql`
          INSERT INTO post_categories (post_id, category_id)
          VALUES (${postId}, ${categoryId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    return NextResponse.json({ success: true, id: postId, slug })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
