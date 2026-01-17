import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#6b7280',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        image VARCHAR(500),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published)`
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at)`

    // Create post_categories junction table
    await sql`
      CREATE TABLE IF NOT EXISTS post_categories (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, category_id)
      )
    `

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

    // Add is_edited column to comments if it doesn't exist
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false
    `

    // Create comment_likes table
    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        visitor_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(comment_id, visitor_id)
      )
    `

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

    // Add is_pinned column to posts if it doesn't exist
    await sql`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false
    `

    // Add ai_reviewed column to posts if it doesn't exist
    await sql`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_reviewed BOOLEAN DEFAULT false
    `

    // Create settings table for storing configurations like writing style
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Mark all published posts as reviewed by AI
    await sql`
      UPDATE posts SET ai_reviewed = true WHERE published = true AND ai_reviewed = false
    `

    return NextResponse.json({ success: true, message: 'Database setup complete!' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
