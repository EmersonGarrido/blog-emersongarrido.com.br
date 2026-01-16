import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get view count for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM page_views WHERE post_slug = ${slug}
    `
    const views = parseInt(result[0].count as string) || 0

    return NextResponse.json({ views })
  } catch (error) {
    console.error('Get views error:', error)
    return NextResponse.json({ views: 0 })
  }
}
