'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import type { Post } from '@/lib/posts'

interface PostCardProps {
  post: Post
  index: number
}

export default function PostCard({ post, index }: PostCardProps) {
  const { t, locale } = useLocale()
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    // Fetch likes
    fetch(`/api/likes?slug=${encodeURIComponent(post.slug)}`)
      .then(res => res.json())
      .then(data => {
        setLikesCount(data.total || 0)
        setIsLiked(data.isLiked || false)
      })
      .catch(() => {})

    // Fetch comments count
    fetch(`/api/comments?slug=${encodeURIComponent(post.slug)}`)
      .then(res => res.json())
      .then(data => {
        setCommentsCount(data.comments?.length || 0)
      })
      .catch(() => {})
  }, [post.slug])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (isLiked) {
        const res = await fetch(`/api/likes?slug=${encodeURIComponent(post.slug)}`, { method: 'DELETE' })
        const data = await res.json()
        setLikesCount(data.total || 0)
        setIsLiked(false)
      } else {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: post.slug })
        })
        const data = await res.json()
        setLikesCount(data.total || 0)
        setIsLiked(true)
      }
    } catch {}
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
      className="px-4 py-3"
    >
      <div className="flex gap-3">
        {/* Avatar - link to home */}
        <Link href="/" className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-[var(--border-color)] transition-all">
            <Image
              src="/avatar.jpg"
              alt="Emerson Garrido"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="font-semibold text-[15px] hover:underline">emersongarrido</Link>
            <span className="text-[var(--text-secondary)] text-[15px]">
              {formatDate(post.date)}
              {post.readingTime && (
                <span> · {post.readingTime} min</span>
              )}
            </span>
          </div>

          {/* Card com conteúdo - link to post */}
          <Link href={`/post/${post.slug}`}>
            <motion.div
              className="mt-2 bg-[var(--bg-secondary)] rounded-2xl overflow-hidden hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)] transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              {post.image && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                  {post.excerpt}
                </p>
                {post.categories && post.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <span
                        key={category}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        #{category.replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions: Like & Comments */}
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      isLiked ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-500'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {likesCount > 0 && <span>{likesCount}</span>}
                  </button>

                  <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {commentsCount > 0 && <span>{commentsCount}</span>}
                  </span>

                  <span className="flex-1" />

                  <span className="flex items-center gap-1 text-[var(--text-secondary)] text-sm">
                    {t.readMore}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
