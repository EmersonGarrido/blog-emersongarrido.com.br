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

// Get single post
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
    const posts = await sql`
      SELECT p.*,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
           FROM categories c
           JOIN post_categories pc ON pc.category_id = c.id
           WHERE pc.post_id = p.id), '[]'
        ) as categories
      FROM posts p
      WHERE p.id = ${id}
    `

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: posts[0] })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json({ error: 'Failed to get post' }, { status: 500 })
  }
}

// Update post
export async function PUT(
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
    const { title, excerpt, content, image, published, categories, editedBy, revisionNote } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Get current post (to save as revision before updating)
    const current = await sql`SELECT slug, published, title, excerpt, content FROM posts WHERE id = ${id}`
    if (current.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Save current version as revision before updating (if content changed)
    const contentChanged = current[0].title !== title ||
                           current[0].excerpt !== excerpt ||
                           current[0].content !== content

    if (contentChanged) {
      await sql`
        INSERT INTO post_revisions (post_id, title, excerpt, content, edited_by, revision_note)
        VALUES (${id}, ${current[0].title}, ${current[0].excerpt || null}, ${current[0].content}, ${editedBy || 'user'}, ${revisionNote || null})
      `
    }

    const newSlug = slugify(title)

    // Check if new slug conflicts with another post
    if (newSlug !== current[0].slug) {
      const existing = await sql`SELECT id FROM posts WHERE slug = ${newSlug} AND id != ${id}`
      if (existing.length > 0) {
        return NextResponse.json({ error: 'A post with this title already exists' }, { status: 400 })
      }
    }

    // Set published_at if publishing for the first time
    let publishedAt = null
    if (published && !current[0].published) {
      publishedAt = new Date()
    }

    if (publishedAt) {
      await sql`
        UPDATE posts
        SET slug = ${newSlug}, title = ${title}, excerpt = ${excerpt || null},
            content = ${content}, image = ${image || null}, published = ${published},
            published_at = ${publishedAt}, updated_at = NOW()
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE posts
        SET slug = ${newSlug}, title = ${title}, excerpt = ${excerpt || null},
            content = ${content}, image = ${image || null}, published = ${published},
            updated_at = NOW()
        WHERE id = ${id}
      `
    }

    // Update categories
    await sql`DELETE FROM post_categories WHERE post_id = ${id}`
    if (categories && Array.isArray(categories)) {
      for (const categoryId of categories) {
        await sql`
          INSERT INTO post_categories (post_id, category_id)
          VALUES (${id}, ${categoryId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    return NextResponse.json({ success: true, slug: newSlug })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await sql`DELETE FROM posts WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
