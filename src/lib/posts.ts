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
  isPinned?: boolean
  aiReviewed?: boolean
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
        p.is_pinned,
        COALESCE(
          (SELECT json_agg(c.name)
           FROM categories c
           JOIN post_categories pc ON pc.category_id = c.id
           WHERE pc.post_id = p.id), '[]'
        ) as categories
      FROM posts p
      WHERE p.published = true
      ORDER BY p.is_pinned DESC NULLS LAST, p.published_at DESC
    `

    return posts.map(post => ({
      slug: post.slug as string,
      title: post.title as string,
      date: post.published_at ? new Date(post.published_at as string).toISOString() : new Date().toISOString(),
      excerpt: (post.excerpt as string) || (post.content as string).slice(0, 160) + '...',
      image: post.image as string | undefined,
      categories: Array.isArray(post.categories) ? post.categories : [],
      content: post.content as string,
      readingTime: calculateReadingTime(post.content as string),
      isPinned: post.is_pinned as boolean
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
        p.ai_reviewed,
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
      readingTime: calculateReadingTime(post.content as string),
      aiReviewed: post.ai_reviewed as boolean
    }
  } catch (error) {
    console.error('Error fetching post from database:', error)
    return null
  }
}

async function getPostMetrics(slug: string) {
  try {
    const [viewsResult, likesResult, commentsResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM page_views WHERE post_slug = ${slug}`,
      sql`SELECT COUNT(*) as count FROM likes WHERE post_slug = ${slug}`,
      sql`SELECT COUNT(*) as count FROM comments WHERE post_slug = ${slug} AND is_approved = true`
    ])
    return {
      views: Number(viewsResult[0]?.count || 0),
      likes: Number(likesResult[0]?.count || 0),
      comments: Number(commentsResult[0]?.count || 0)
    }
  } catch {
    return { views: 0, likes: 0, comments: 0 }
  }
}

export async function getPostContent(content: string): Promise<string> {
  // Process ::post-link[slug] to fetch linked post data
  let processedMarkdown = content

  // Find all post-link references
  const postLinkRegex = /::post-link\[([^\]]+)\]/g
  let match: RegExpExecArray | null

  while ((match = postLinkRegex.exec(content)) !== null) {
    const slug = match[1]
    const linkedPost = await getPostBySlug(slug)

    if (linkedPost) {
      const metrics = await getPostMetrics(slug)
      const categories = linkedPost.categories || []
      const hashtags = categories.map(c => `<span style="color: #60a5fa;">#${c.toLowerCase().replace(/\s+/g, '')}</span>`).join(' ')

      // Replace with a nice card HTML
      const cardHtml = `
<div class="post-link-card" style="margin: 1.5rem 0; background: var(--bg-tertiary, #0d0d0d); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 16px; overflow: hidden;">
  <a href="/post/${slug}" style="text-decoration: none; color: inherit; display: block;">
    <div style="padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
      <img src="/avatar.jpg" alt="" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'" />
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-weight: 600; font-size: 15px; color: var(--text-primary, #fff);">emersongarrido</span>
          <svg style="width: 16px; height: 16px; color: #60a5fa;" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          <span style="color: var(--text-muted, #666);">·</span>
          <span style="color: var(--text-muted, #666); font-size: 14px;">${new Date(linkedPost.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
    <div style="margin: 0 12px 12px; padding: 16px; background: var(--bg-secondary, rgba(255,255,255,0.05)); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 12px;">
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex: 1; min-width: 0;">
          <p style="margin: 0 0 12px; font-size: 15px; color: var(--text-secondary, #ccc); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${linkedPost.excerpt || linkedPost.title}</p>
          ${hashtags ? `<div style="font-size: 14px;">${hashtags}</div>` : ''}
        </div>
        <svg style="width: 20px; height: 20px; color: var(--text-muted, #666); flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>
    <div style="padding: 0 16px 12px; display: flex; gap: 16px; font-size: 13px; color: var(--text-muted, #666);">
      <span style="display: flex; align-items: center; gap: 4px;"><svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>${metrics.views}</span>
      <span style="display: flex; align-items: center; gap: 4px;"><svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>${metrics.likes}</span>
      <span style="display: flex; align-items: center; gap: 4px;"><svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>${metrics.comments}</span>
    </div>
  </a>
</div>`
      processedMarkdown = processedMarkdown.replace(match[0], cardHtml)
    } else {
      // Post not found - show simple message
      processedMarkdown = processedMarkdown.replace(match[0], `<div style="padding: 1rem; background: rgba(255,0,0,0.1); border-radius: 8px; color: #f87171; font-size: 13px;">Post não encontrado: ${slug}</div>`)
    }
  }

  const processedContent = await remark().use(html, { sanitize: false }).process(processedMarkdown)
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
