import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

function generateExcerpt(content: string): string {
  // Strip markdown formatting
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]+`/g, '') // remove inline code
    .replace(/#{1,6}\s/g, '') // remove headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
    .replace(/\*([^*]+)\*/g, '$1') // remove italic
    .replace(/~~([^~]+)~~/g, '$1') // remove strikethrough
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links, keep text
    .replace(/!\[\]\([^)]+\)/g, '') // remove images
    .replace(/^>\s/gm, '') // remove blockquotes
    .replace(/^-\s/gm, '') // remove list items
    .replace(/\n+/g, ' ') // normalize newlines
    .trim()

  // Get first ~500 chars for 4 lines
  return plainText.slice(0, 500).trim()
}

export async function POST() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all posts
    const posts = await sql`
      SELECT id, content FROM posts WHERE content IS NOT NULL
    `

    let updated = 0

    for (const post of posts) {
      if (post.content) {
        const newExcerpt = generateExcerpt(post.content as string)

        await sql`
          UPDATE posts SET excerpt = ${newExcerpt} WHERE id = ${post.id}
        `
        updated++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} excerpts regenerados com sucesso!`,
      updated
    })
  } catch (error) {
    console.error('Regenerate excerpts error:', error)
    return NextResponse.json({ error: 'Failed to regenerate excerpts' }, { status: 500 })
  }
}
