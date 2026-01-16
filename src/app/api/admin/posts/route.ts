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
    // Build WHERE conditions
    const conditions: string[] = []

    if (status === 'published') {
      conditions.push('p.published = true')
    } else if (status === 'draft') {
      conditions.push('p.published = false')
    }

    if (search) {
      conditions.push(`(p.title ILIKE '%' || $search || '%' OR p.excerpt ILIKE '%' || $search || '%')`)
    }

    if (categoryId) {
      conditions.push(`EXISTS (SELECT 1 FROM post_categories pc2 WHERE pc2.post_id = p.id AND pc2.category_id = $categoryId)`)
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1'

    // Get total count for pagination
    let totalResult
    if (search && categoryId) {
      totalResult = await sql`
        SELECT COUNT(*) as total FROM posts p
        WHERE ${sql.unsafe(whereClause.replace('$search', `'${search.replace(/'/g, "''")}'`).replace('$categoryId', categoryId))}
      `
    } else if (search) {
      totalResult = await sql`
        SELECT COUNT(*) as total FROM posts p
        WHERE ${sql.unsafe(whereClause.replace('$search', `'${search.replace(/'/g, "''")}'`))}
      `
    } else if (categoryId) {
      totalResult = await sql`
        SELECT COUNT(*) as total FROM posts p
        WHERE ${sql.unsafe(whereClause.replace('$categoryId', categoryId))}
      `
    } else {
      totalResult = await sql`
        SELECT COUNT(*) as total FROM posts p
        WHERE ${sql.unsafe(whereClause)}
      `
    }

    const total = parseInt(totalResult[0].total as string)
    const totalPages = Math.ceil(total / limit)

    // Get posts with pagination
    let posts
    const baseQuery = `
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
      WHERE ${whereClause}
      ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    if (search && categoryId) {
      posts = await sql.unsafe(baseQuery.replace('$search', `'${search.replace(/'/g, "''")}'`).replace('$categoryId', categoryId))
    } else if (search) {
      posts = await sql.unsafe(baseQuery.replace('$search', `'${search.replace(/'/g, "''")}'`))
    } else if (categoryId) {
      posts = await sql.unsafe(baseQuery.replace('$categoryId', categoryId))
    } else {
      posts = await sql.unsafe(baseQuery)
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
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
