'use client'

import { useState, useEffect } from 'react'

interface PostData {
  id: number
  slug: string
  title: string
  excerpt: string
  published: boolean
  published_at: string
  categories: { id: number; name: string }[]
  views_count?: number
  likes_count?: number
  comments_count?: number
}

interface PostLinkPreviewProps {
  slug: string
}

export default function PostLinkPreview({ slug }: PostLinkPreviewProps) {
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/posts/by-slug?slug=${encodeURIComponent(slug)}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data.post)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="my-4 p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-32 mb-2" />
            <div className="h-3 bg-white/10 rounded w-24" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="my-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-400 text-sm">Post não encontrado: {slug}</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' de').replace(' de ', ' de ')
  }

  return (
    <div className="my-4 bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
      {/* Header com avatar */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
          <img
            src="/avatar.jpg"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z"/></svg>'
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px]">emersongarrido</span>
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span className="text-white/40">·</span>
          <span className="text-white/40 text-sm">{formatDate(post.published_at || new Date().toISOString())}</span>
        </div>
      </div>

      {/* Content Card */}
      <div className="mx-3 mb-3 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-white/90 leading-relaxed line-clamp-3 mb-3">
              {post.excerpt || post.title}
            </p>
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((cat) => (
                  <span key={cat.id} className="text-blue-400 text-sm">
                    #{cat.name.toLowerCase().replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            )}
          </div>
          <svg className="w-5 h-5 text-white/30 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      {/* Footer metrics */}
      <div className="px-4 pb-3 flex items-center gap-4 text-white/40 text-sm">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          {post.views_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          {post.likes_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          {post.comments_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          0
        </span>
      </div>
    </div>
  )
}
