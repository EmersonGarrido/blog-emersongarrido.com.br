'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import { formatDateByLocale } from '@/lib/i18n'
import ThemeToggle from '@/components/ThemeToggle'
import HeartReaction from '@/components/HeartReaction'
import ShareButton from '@/components/ShareButton'
import Analytics from '@/components/Analytics'
import Comments from '@/components/Comments'
import type { Post } from '@/lib/posts'

interface PostContentProps {
  post: Post
  contentHtml: string
  formattedDate: string
  newerPost: Post | null
  olderPost: Post | null
}

export default function PostContent({ post, contentHtml, formattedDate, newerPost, olderPost }: PostContentProps) {
  const { t, locale } = useLocale()
  const [readingProgress, setReadingProgress] = useState(0)

  // Barra de progresso de leitura
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setReadingProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/post/${post.slug}`
    : `https://emersongarrido.com.br/post/${post.slug}`

  const shareText = `${post.excerpt} - por @emersongarrido`


  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Analytics pageType="post" slug={post.slug} />
      {/* Barra de progresso de leitura */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[60]"
        style={{ width: `${readingProgress}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: readingProgress > 0 ? 1 : 0 }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]"
      >
        <div className="max-w-xl mx-auto px-2 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-12 h-12 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold">Post</span>
          <ThemeToggle />
        </div>
      </motion.header>

      <main className="max-w-xl mx-auto px-4 py-4">
        {/* Post Card */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[var(--bg-secondary)] rounded-2xl overflow-hidden"
        >
          {/* Author Header */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <Link href="/">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-[var(--border-color)] transition-all"
              >
                <Image
                  src="/avatar.jpg"
                  alt="Emerson Garrido"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </Link>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Link href="/" className="font-semibold text-[15px] hover:underline">emersongarrido</Link>
              <p className="text-[var(--text-secondary)] text-sm">
                {formattedDate}
                {post.readingTime && (
                  <span> · {post.readingTime} min {locale === 'en' ? 'read' : 'de leitura'}</span>
                )}
              </p>
            </motion.div>
          </div>

          {/* Image */}
          {post.image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="relative w-full aspect-video"
            >
              <Image
                src={post.image}
                alt=""
                fill
                className="object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="px-5 pb-6 pt-4"
          >
            <div
              className="prose text-[15px] text-[var(--text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Categories */}
            {(post.categories && post.categories.length > 0) || post.aiReviewed ? (
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center gap-2">
                {post.categories?.map((category) => (
                  <span
                    key={category}
                    className="text-xs px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {post.aiReviewed && (
                  <span className="text-xs px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {locale === 'en' ? 'AI Reviewed' : 'Revisado por IA'}
                  </span>
                )}
              </div>
            ) : null}

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartReaction postSlug={post.slug} />
                <span className="text-[var(--text-muted)] text-sm">
                  {locale === 'en' ? 'Did this resonate with you?' : 'Isso fez sentido pra você?'}
                </span>
              </div>
              <ShareButton
                url={postUrl}
                text={shareText}
                slug={post.slug}
              />
            </div>

            {/* Comments */}
            <Comments postSlug={post.slug} />
          </motion.div>
        </motion.article>

        {/* Post Navigation */}
        {(newerPost || olderPost) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            {/* Post mais recente (esquerda) */}
            {newerPost ? (
              <Link
                href={`/post/${newerPost.slug}`}
                className="block bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)] rounded-xl p-4 transition-colors min-h-[120px]"
              >
                <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wide flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {locale === 'en' ? 'Newer' : 'Recente'}
                </span>
                <p className="text-[14px] text-[var(--text-secondary)] mt-2 line-clamp-2">{newerPost.excerpt}</p>
                <span className="text-[var(--text-muted)] text-xs mt-2 block">
                  {new Date(newerPost.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {/* Post mais antigo (direita) */}
            {olderPost ? (
              <Link
                href={`/post/${olderPost.slug}`}
                className="block bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)] rounded-xl p-4 transition-colors text-right min-h-[120px]"
              >
                <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wide flex items-center gap-1 justify-end">
                  {locale === 'en' ? 'Older' : 'Antigo'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <p className="text-[14px] text-[var(--text-secondary)] mt-2 line-clamp-2">{olderPost.excerpt}</p>
                <span className="text-[var(--text-muted)] text-xs mt-2 block">
                  {new Date(olderPost.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:text-[var(--text-primary)] transition-colors min-h-[48px] px-6 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-[15px]">{t.backToHome}</span>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
