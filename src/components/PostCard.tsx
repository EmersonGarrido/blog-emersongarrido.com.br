'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import ShareModal from '@/components/ShareModal'
import type { Post } from '@/lib/posts'

interface PostCardProps {
  post: Post
  index: number
}

export default function PostCard({ post, index }: PostCardProps) {
  const { locale } = useLocale()
  const [viewsCount, setViewsCount] = useState(0)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [sharesCount, setSharesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    // Fetch views
    fetch(`/api/views?slug=${encodeURIComponent(post.slug)}`)
      .then(res => res.json())
      .then(data => setViewsCount(data.views || 0))
      .catch(() => {})

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
      .then(data => setCommentsCount(data.comments?.length || 0))
      .catch(() => {})

    // Fetch shares count
    fetch(`/api/shares?slug=${encodeURIComponent(post.slug)}`)
      .then(res => res.json())
      .then(data => setSharesCount(data.shares || 0))
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

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowShareModal(true)
  }

  const handleShareComplete = async (method: string) => {
    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: post.slug, method })
      })
      const data = await res.json()
      setSharesCount(data.shares || sharesCount + 1)
      setShowShareModal(false)
    } catch (error) {
      console.error('Share tracking error:', error)
    }
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/post/${post.slug}?utm_source=share&utm_medium=post`
    : `https://emersongarrido.com.br/post/${post.slug}?utm_source=share&utm_medium=post`

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
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="font-semibold text-[15px] hover:underline">emersongarrido</Link>
            {/* Verified badge - Twitter/X style */}
            <svg className="w-[18px] h-[18px] text-blue-500" viewBox="0 0 22 22" fill="currentColor">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
            <span className="text-[var(--text-muted)] text-[15px]">·</span>
            <span className="text-[var(--text-secondary)] text-[15px]">
              {formatDate(post.date)}
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
              <div className="p-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                    {post.excerpt}
                  </p>
                  {post.categories && post.categories.length > 0 && (
                    <p className="mt-2">
                      {post.categories.map((category, i) => (
                        <span key={category}>
                          <span className="text-sm transition-colors" style={{ color: 'var(--accent-color)' }}>
                            #{category.replace(/\s+/g, '')}
                          </span>
                          {i < post.categories!.length - 1 && ' '}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                {/* Arrow indicator */}
                <div className="flex-shrink-0 flex items-center">
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Stats bar - outside the card */}
          <div className="mt-2 flex items-center gap-4 px-1">
            {/* Views */}
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewsCount}</span>
            </span>

            {/* Likes */}
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
              <span>{likesCount}</span>
            </button>

            {/* Comments */}
            <Link
              href={`/post/${post.slug}#comments`}
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{commentsCount}</span>
            </Link>

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span>{sharesCount}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={shareUrl}
        title={post.title || post.excerpt?.slice(0, 50) || 'Post'}
        onShare={handleShareComplete}
      />
    </motion.article>
  )
}
