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

// Get all categories
export async function GET() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await sql`
      SELECT c.*,
        (SELECT COUNT(*) FROM post_categories pc WHERE pc.category_id = c.id) as post_count
      FROM categories c
      ORDER BY c.name ASC
    `

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 })
  }
}

// Create new category
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slug = slugify(name)

    // Check if slug already exists
    const existing = await sql`SELECT id FROM categories WHERE slug = ${slug}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO categories (name, slug, description, color)
      VALUES (${name}, ${slug}, ${description || null}, ${color || '#6b7280'})
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id, slug })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
