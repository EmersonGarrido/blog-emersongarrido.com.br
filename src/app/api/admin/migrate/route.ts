import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const postsDirectory = path.join(process.cwd(), 'src/posts')

    if (!fs.existsSync(postsDirectory)) {
      return NextResponse.json({ error: 'Posts directory not found' }, { status: 404 })
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const mdFiles = fileNames.filter((name) => name.endsWith('.md'))

    let imported = 0
    let skipped = 0
    const categories = new Set<string>()

    for (const fileName of mdFiles) {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      // Check if post already exists
      const existing = await sql`SELECT id FROM posts WHERE slug = ${slug}`
      if (existing.length > 0) {
        skipped++
        continue
      }

      // Collect categories
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((cat: string) => categories.add(cat))
      }

      // Parse date
      let publishedAt = new Date()
      if (data.date) {
        publishedAt = new Date(data.date)
      }

      // Insert post
      await sql`
        INSERT INTO posts (slug, title, excerpt, content, image, published, published_at)
        VALUES (
          ${slug},
          ${data.title || slug},
          ${data.excerpt || content.slice(0, 160) + '...'},
          ${content},
          ${data.image || null},
          true,
          ${publishedAt}
        )
      `

      imported++
    }

    // Insert categories
    let categoriesCreated = 0
    for (const catName of Array.from(categories)) {
      const catSlug = slugify(catName)
      const existing = await sql`SELECT id FROM categories WHERE slug = ${catSlug}`
      if (existing.length === 0) {
        await sql`
          INSERT INTO categories (name, slug)
          VALUES (${catName}, ${catSlug})
        `
        categoriesCreated++
      }
    }

    // Link posts to categories
    for (const fileName of mdFiles) {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)

      if (data.categories && Array.isArray(data.categories)) {
        const post = await sql`SELECT id FROM posts WHERE slug = ${slug}`
        if (post.length > 0) {
          for (const catName of data.categories) {
            const catSlug = slugify(catName)
            const cat = await sql`SELECT id FROM categories WHERE slug = ${catSlug}`
            if (cat.length > 0) {
              await sql`
                INSERT INTO post_categories (post_id, category_id)
                VALUES (${post[0].id}, ${cat[0].id})
                ON CONFLICT DO NOTHING
              `
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      categoriesCreated,
      message: `Imported ${imported} posts, skipped ${skipped} existing, created ${categoriesCreated} categories`
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
