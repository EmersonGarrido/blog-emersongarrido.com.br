import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Ensure shares table exists
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS shares (
      id SERIAL PRIMARY KEY,
      post_slug VARCHAR(255) NOT NULL,
      share_method VARCHAR(50) NOT NULL,
      visitor_id VARCHAR(100),
      ip_address VARCHAR(50),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  // Add index for faster queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_shares_post_slug ON shares(post_slug)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at)
  `
}

// GET - Get share count for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    await ensureTable()

    const result = await sql`
      SELECT COUNT(*) as count FROM shares WHERE post_slug = ${slug}
    `
    const shares = parseInt(result[0].count as string) || 0

    return NextResponse.json({ shares })
  } catch (error) {
    console.error('Get shares error:', error)
    return NextResponse.json({ shares: 0 })
  }
}

// POST - Track a share
export async function POST(request: NextRequest) {
  try {
    await ensureTable()

    const body = await request.json()
    const { slug, method } = body

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               '127.0.0.1'
    const userAgent = headersList.get('user-agent') || ''
    const visitorId = ip

    // Record the share
    await sql`
      INSERT INTO shares (post_slug, share_method, visitor_id, ip_address, user_agent)
      VALUES (${slug}, ${method || 'unknown'}, ${visitorId}, ${ip}, ${userAgent})
    `

    // Get updated count
    const result = await sql`
      SELECT COUNT(*) as count FROM shares WHERE post_slug = ${slug}
    `
    const shares = parseInt(result[0].count as string) || 0

    return NextResponse.json({ success: true, shares })
  } catch (error) {
    console.error('Track share error:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }
}
