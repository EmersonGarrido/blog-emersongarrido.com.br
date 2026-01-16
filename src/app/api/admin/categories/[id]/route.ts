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

// Update category
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
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slug = slugify(name)

    // Check if new slug conflicts with another category
    const existing = await sql`SELECT id FROM categories WHERE slug = ${slug} AND id != ${id}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
    }

    await sql`
      UPDATE categories
      SET name = ${name}, slug = ${slug}, description = ${description || null}, color = ${color || '#6b7280'}
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// Delete category
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
    // Check if category has posts
    const postCount = await sql`SELECT COUNT(*) as count FROM post_categories WHERE category_id = ${id}`
    if (parseInt(postCount[0].count as string) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with posts. Remove posts from this category first.' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM categories WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
