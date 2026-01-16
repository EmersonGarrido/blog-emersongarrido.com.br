import { getAllPosts } from '@/lib/posts'

const SITE_URL = 'https://emersongarrido.com.br'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = getAllPosts()

  const rssItems = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/post/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.categories?.map((cat) => `<category>${escapeXml(cat)}</category>`).join('\n      ') || ''}
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Emerson Garrido</title>
    <link>${SITE_URL}</link>
    <description>Cansei de pedir ajuda pra pessoas próximas, resolvi relatar publicamente o que ando passando. Não tá fácil, mas sigo tentando.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/avatar.jpg</url>
      <title>Emerson Garrido</title>
      <link>${SITE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
