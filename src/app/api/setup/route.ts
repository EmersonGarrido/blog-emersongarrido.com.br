import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_slug VARCHAR(255) NOT NULL,
        author_name VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_approved BOOLEAN DEFAULT false,
        is_spam BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug)`
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(is_approved)`

    // Create likes table
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_slug VARCHAR(255) NOT NULL,
        page_type VARCHAR(50) NOT NULL,
        visitor_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_slug, visitor_id)
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_likes_post_slug ON likes(post_slug)`

    // Create page_views table
    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        post_slug VARCHAR(255),
        page_type VARCHAR(50) NOT NULL,
        visitor_id VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer TEXT,
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        country VARCHAR(100),
        city VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_post_slug ON page_views(post_slug)`
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON page_views(utm_source)`

    return NextResponse.json({ success: true, message: 'Database setup complete!' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
