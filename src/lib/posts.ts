import { sql } from '@/lib/db'
import { remark } from 'remark'
import html from 'remark-html'

export interface Post {
  slug: string
  title: string
  date: string
  excerpt?: string
  image?: string
  categories?: string[]
  content: string
  contentHtml?: string
  readingTime?: number
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes < 1 ? 1 : minutes
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const posts = await sql`
      SELECT
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        p.image,
        p.published_at,
        COALESCE(
          (SELECT json_agg(c.name)
           FROM categories c
           JOIN post_categories pc ON pc.category_id = c.id
           WHERE pc.post_id = p.id), '[]'
        ) as categories
      FROM posts p
      WHERE p.published = true
      ORDER BY p.published_at DESC
    `

    return posts.map(post => ({
      slug: post.slug as string,
      title: post.title as string,
      date: post.published_at ? new Date(post.published_at as string).toISOString() : new Date().toISOString(),
      excerpt: (post.excerpt as string) || (post.content as string).slice(0, 160) + '...',
      image: post.image as string | undefined,
      categories: Array.isArray(post.categories) ? post.categories : [],
      content: post.content as string,
      readingTime: calculateReadingTime(post.content as string)
    }))
  } catch (error) {
    console.error('Error fetching posts from database:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const posts = await sql`
      SELECT
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        p.image,
        p.published_at,
        COALESCE(
          (SELECT json_agg(c.name)
           FROM categories c
           JOIN post_categories pc ON pc.category_id = c.id
           WHERE pc.post_id = p.id), '[]'
        ) as categories
      FROM posts p
      WHERE p.slug = ${slug} AND p.published = true
    `

    if (posts.length === 0) {
      return null
    }

    const post = posts[0]

    return {
      slug: post.slug as string,
      title: post.title as string,
      date: post.published_at ? new Date(post.published_at as string).toISOString() : new Date().toISOString(),
      excerpt: post.excerpt as string | undefined,
      image: post.image as string | undefined,
      categories: Array.isArray(post.categories) ? post.categories : [],
      content: post.content as string,
      readingTime: calculateReadingTime(post.content as string)
    }
  } catch (error) {
    console.error('Error fetching post from database:', error)
    return null
  }
}

export async function getPostContent(content: string): Promise<string> {
  const processedContent = await remark().use(html).process(content)
  return processedContent.toString()
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await sql`
      SELECT slug FROM posts WHERE published = true
    `
    return posts.map(p => p.slug as string)
  } catch (error) {
    console.error('Error fetching post slugs from database:', error)
    return []
  }
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const categories = await sql`
      SELECT DISTINCT c.name
      FROM categories c
      JOIN post_categories pc ON pc.category_id = c.id
      JOIN posts p ON p.id = pc.post_id
      WHERE p.published = true
      ORDER BY c.name
    `
    return categories.map(c => c.name as string)
  } catch (error) {
    console.error('Error fetching categories from database:', error)
    return []
  }
}
// Trigger redeploy sex 16 jan 2026 09:48:05 -04
