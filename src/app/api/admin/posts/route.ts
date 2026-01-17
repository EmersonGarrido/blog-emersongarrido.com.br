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

// Get all posts with search, filter, and pagination
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  try {
    // Build the query based on filters
    let posts
    let totalResult

    // Simple approach: different queries based on filter combination
    if (search && categoryId) {
      // Search + category filter
      const searchPattern = `%${search}%`
      const catId = parseInt(categoryId)

      totalResult = await sql`
        SELECT COUNT(DISTINCT p.id) as total
        FROM posts p
        JOIN post_categories pc ON pc.post_id = p.id
        WHERE pc.category_id = ${catId}
        AND (p.title ILIKE ${searchPattern} OR p.excerpt ILIKE ${searchPattern})
        ${status === 'published' ? sql`AND p.published = true` : status === 'draft' ? sql`AND p.published = false` : sql``}
      `

      posts = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
             FROM categories c
             JOIN post_categories pc2 ON pc2.category_id = c.id
             WHERE pc2.post_id = p.id), '[]'
          ) as categories,
          (SELECT COUNT(*) FROM page_views pv WHERE pv.post_slug = p.slug)::int as views_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
        FROM posts p
        JOIN post_categories pc ON pc.post_id = p.id
        WHERE pc.category_id = ${catId}
        AND (p.title ILIKE ${searchPattern} OR p.excerpt ILIKE ${searchPattern})
        ${status === 'published' ? sql`AND p.published = true` : status === 'draft' ? sql`AND p.published = false` : sql``}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (search) {
      // Search only
      const searchPattern = `%${search}%`

      totalResult = await sql`
        SELECT COUNT(*) as total FROM posts p
        WHERE (p.title ILIKE ${searchPattern} OR p.excerpt ILIKE ${searchPattern})
        ${status === 'published' ? sql`AND p.published = true` : status === 'draft' ? sql`AND p.published = false` : sql``}
      `

      posts = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
             FROM categories c
             JOIN post_categories pc ON pc.category_id = c.id
             WHERE pc.post_id = p.id), '[]'
          ) as categories,
          (SELECT COUNT(*) FROM page_views pv WHERE pv.post_slug = p.slug)::int as views_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
        FROM posts p
        WHERE (p.title ILIKE ${searchPattern} OR p.excerpt ILIKE ${searchPattern})
        ${status === 'published' ? sql`AND p.published = true` : status === 'draft' ? sql`AND p.published = false` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (categoryId) {
      // Category filter only
      const catId = parseInt(categoryId)

      totalResult = await sql`
        SELECT COUNT(DISTINCT p.id) as total
        FROM posts p
        JOIN post_categories pc ON pc.post_id = p.id
        WHERE pc.category_id = ${catId}
        ${status === 'published' ? sql`AND p.published = true` : status === 'draft' ? sql`AND p.published = false` : sql``}
      `

      posts = await sql`
        SELECT p.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
             FROM categories c
             JOIN post_categories pc2 ON pc2.category_id = c.id
             WHERE pc2.post_id = p.id), '[]'
          ) as categories,
          (SELECT COUNT(*) FROM page_views pv WHERE pv.post_slug = p.slug)::int as views_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
        FROM posts p
        JOIN post_categories pc ON pc.post_id = p.id
        WHERE pc.category_id = ${catId}
        ${status === 'published' ? sql`AND p.published = true` : status === 'draft' ? sql`AND p.published = false` : sql``}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      // No search or category filter
      if (status === 'published') {
        totalResult = await sql`SELECT COUNT(*) as total FROM posts p WHERE p.published = true`
        posts = await sql`
          SELECT p.*,
            COALESCE(
              (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
               FROM categories c
               JOIN post_categories pc ON pc.category_id = c.id
               WHERE pc.post_id = p.id), '[]'
            ) as categories,
            (SELECT COUNT(*) FROM page_views pv WHERE pv.post_slug = p.slug)::int as views_count,
            (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
            (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
          FROM posts p
          WHERE p.published = true
          ORDER BY p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (status === 'draft') {
        totalResult = await sql`SELECT COUNT(*) as total FROM posts p WHERE p.published = false`
        posts = await sql`
          SELECT p.*,
            COALESCE(
              (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
               FROM categories c
               JOIN post_categories pc ON pc.category_id = c.id
               WHERE pc.post_id = p.id), '[]'
            ) as categories,
            (SELECT COUNT(*) FROM page_views pv WHERE pv.post_slug = p.slug)::int as views_count,
            (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
            (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
          FROM posts p
          WHERE p.published = false
          ORDER BY p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        totalResult = await sql`SELECT COUNT(*) as total FROM posts p`
        posts = await sql`
          SELECT p.*,
            COALESCE(
              (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
               FROM categories c
               JOIN post_categories pc ON pc.category_id = c.id
               WHERE pc.post_id = p.id), '[]'
            ) as categories,
            (SELECT COUNT(*) FROM page_views pv WHERE pv.post_slug = p.slug)::int as views_count,
            (SELECT COUNT(*) FROM likes l WHERE l.post_slug = p.slug)::int as likes_count,
            (SELECT COUNT(*) FROM comments cm WHERE cm.post_slug = p.slug AND cm.is_approved = true)::int as comments_count
          FROM posts p
          ORDER BY p.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }

    const total = parseInt(totalResult[0].total as string)
    const totalPages = Math.ceil(total / limit)

    // Get counts for all statuses (for filter badges)
    const countsResult = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE published = true) as published_count,
        COUNT(*) FILTER (WHERE published = false) as draft_count
      FROM posts
    `
    const counts = {
      all: parseInt(countsResult[0].total as string),
      published: parseInt(countsResult[0].published_count as string),
      draft: parseInt(countsResult[0].draft_count as string)
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      counts
    })
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
