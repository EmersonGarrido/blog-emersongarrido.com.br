import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostContent from '@/components/PostContent'
import { getPostBySlug, getPostContent, getAllPostSlugs, getAllPosts } from '@/lib/posts'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return { title: 'Post não encontrado' }
  }

  const ogImageUrl = `/api/og?title=${encodeURIComponent(post.title)}&excerpt=${encodeURIComponent(post.excerpt || '')}`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Emerson Garrido'],
      url: `https://emersongarrido.com.br/post/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateStr} às ${timeStr}`
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const contentHtml = await getPostContent(post.content)
  const formattedDate = formatDate(post.date)

  // Pegar outros posts para "relacionados"
  const allPosts = getAllPosts()
  const relatedPosts = allPosts.filter(p => p.slug !== params.slug).slice(0, 3)

  return (
    <PostContent
      post={post}
      contentHtml={contentHtml}
      formattedDate={formattedDate}
      relatedPosts={relatedPosts}
    />
  )
}
