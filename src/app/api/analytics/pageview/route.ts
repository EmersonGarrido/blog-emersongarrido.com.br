import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Generate fallback visitor ID from IP + User Agent (for clients without localStorage)
function generateFallbackVisitorId(ip: string, userAgent: string): string {
  const data = `${ip}-${userAgent}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'fallback-' + Math.abs(hash).toString(36)
}

// Detect source from UTM params or referrer
function detectSource(utmSource: string | null, referrer: string | null): string | null {
  if (utmSource) return utmSource

  if (!referrer) return 'direct'

  const url = referrer.toLowerCase()
  if (url.includes('google.com')) return 'google'
  if (url.includes('bing.com')) return 'bing'
  if (url.includes('twitter.com') || url.includes('x.com') || url.includes('t.co')) return 'twitter'
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'facebook'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('threads.net')) return 'threads'
  if (url.includes('whatsapp.com') || url.includes('wa.me')) return 'whatsapp'
  if (url.includes('t.me') || url.includes('telegram')) return 'telegram'

  return 'referral'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, pageType, visitorId: clientVisitorId, isNewVisitor, utmSource, utmMedium, utmCampaign, referrer } = body

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               '127.0.0.1'
    const userAgent = headersList.get('user-agent') || ''

    // Use client-provided visitor ID (localStorage) or fallback to IP+UA hash
    const visitorId = clientVisitorId || generateFallbackVisitorId(ip, userAgent)

    // Detect source
    const source = detectSource(utmSource, referrer)

    // Get geolocation from IP (using free API)
    let country = null
    let city = null

    try {
      // ip-api.com is free for non-commercial use
      if (ip !== '127.0.0.1' && ip !== '::1') {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
          signal: AbortSignal.timeout(2000) // 2 second timeout
        })
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          country = geoData.country || null
          city = geoData.city || null
        }
      }
    } catch {
      // Ignore geolocation errors
    }

    // Ensure visitors table exists
    await sql`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100) UNIQUE NOT NULL,
        first_seen TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW(),
        visit_count INTEGER DEFAULT 1,
        country VARCHAR(100),
        city VARCHAR(100)
      )
    `

    // Track visitor (upsert)
    if (isNewVisitor) {
      // New visitor - insert
      await sql`
        INSERT INTO visitors (visitor_id, country, city)
        VALUES (${visitorId}, ${country}, ${city})
        ON CONFLICT (visitor_id) DO UPDATE SET
          last_seen = NOW(),
          visit_count = visitors.visit_count + 1,
          country = COALESCE(${country}, visitors.country),
          city = COALESCE(${city}, visitors.city)
      `
    } else {
      // Returning visitor - update
      await sql`
        INSERT INTO visitors (visitor_id, country, city)
        VALUES (${visitorId}, ${country}, ${city})
        ON CONFLICT (visitor_id) DO UPDATE SET
          last_seen = NOW(),
          visit_count = visitors.visit_count + 1,
          country = COALESCE(${country}, visitors.country),
          city = COALESCE(${city}, visitors.city)
      `
    }

    // Insert page view
    await sql`
      INSERT INTO page_views (
        post_slug, page_type, visitor_id, ip_address, user_agent,
        referrer, utm_source, utm_medium, utm_campaign, country, city
      )
      VALUES (
        ${slug || null}, ${pageType}, ${visitorId}, ${ip}, ${userAgent},
        ${referrer || null}, ${source}, ${utmMedium || null}, ${utmCampaign || null},
        ${country}, ${city}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Pageview tracking error:', error)
    return NextResponse.json({ error: 'Failed to track pageview' }, { status: 500 })
  }
}

// GET - Get pageview counts (for admin)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  try {
    if (slug) {
      // Get views for specific page
      const result = await sql`
        SELECT COUNT(*) as count FROM page_views WHERE post_slug = ${slug}
      `
      return NextResponse.json({ views: parseInt(result[0].count as string) || 0 })
    } else {
      // Get total views
      const result = await sql`
        SELECT COUNT(*) as count FROM page_views
      `
      return NextResponse.json({ views: parseInt(result[0].count as string) || 0 })
    }
  } catch (error) {
    console.error('Get pageviews error:', error)
    return NextResponse.json({ error: 'Failed to get pageviews' }, { status: 500 })
  }
}
