import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Generate visitor ID from IP + User Agent
function getVisitorId(ip: string, userAgent: string): string {
  const data = `${ip}-${userAgent}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// GET - Check if liked and get total likes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const pageType = searchParams.get('type') || 'post'

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             '127.0.0.1'
  const userAgent = headersList.get('user-agent') || ''
  const visitorId = getVisitorId(ip, userAgent)

  try {
    // Get total likes
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM likes WHERE post_slug = ${slug}
    `
    const total = parseInt(totalResult[0].count as string) || 0

    // Check if current visitor liked
    const likedResult = await sql`
      SELECT id FROM likes WHERE post_slug = ${slug} AND visitor_id = ${visitorId}
    `
    const isLiked = likedResult.length > 0

    return NextResponse.json({ total, isLiked, visitorId })
  } catch (error) {
    console.error('Get likes error:', error)
    return NextResponse.json({ error: 'Failed to get likes' }, { status: 500 })
  }
}

// POST - Add like
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { slug, pageType = 'post' } = body

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             '127.0.0.1'
  const userAgent = headersList.get('user-agent') || ''
  const visitorId = getVisitorId(ip, userAgent)

  try {
    // Insert like (will fail if already exists due to UNIQUE constraint)
    await sql`
      INSERT INTO likes (post_slug, page_type, visitor_id, ip_address)
      VALUES (${slug}, ${pageType}, ${visitorId}, ${ip})
      ON CONFLICT (post_slug, visitor_id) DO NOTHING
    `

    // Get updated total
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM likes WHERE post_slug = ${slug}
    `
    const total = parseInt(totalResult[0].count as string) || 0

    return NextResponse.json({ success: true, total, isLiked: true })
  } catch (error) {
    console.error('Add like error:', error)
    return NextResponse.json({ error: 'Failed to add like' }, { status: 500 })
  }
}

// DELETE - Remove like
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             '127.0.0.1'
  const userAgent = headersList.get('user-agent') || ''
  const visitorId = getVisitorId(ip, userAgent)

  try {
    await sql`
      DELETE FROM likes WHERE post_slug = ${slug} AND visitor_id = ${visitorId}
    `

    // Get updated total
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM likes WHERE post_slug = ${slug}
    `
    const total = parseInt(totalResult[0].count as string) || 0

    return NextResponse.json({ success: true, total, isLiked: false })
  } catch (error) {
    console.error('Remove like error:', error)
    return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 })
  }
}
