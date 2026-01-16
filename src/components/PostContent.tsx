'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import { formatDateByLocale } from '@/lib/i18n'
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
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setShowShareMenu(false)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + postUrl)}`, '_blank')
    setShowShareMenu(false)
  }

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, '_blank')
    setShowShareMenu(false)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Barra de progresso de leitura */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[60]"
        style={{ width: `${readingProgress}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: readingProgress > 0 ? 1 : 0 }}
      />

      {/* Toast de link copiado */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-neutral-800 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {locale === 'en' ? 'Link copied!' : 'Link copiado!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800"
      >
        <div className="max-w-xl mx-auto px-2 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-12 h-12 -ml-2 rounded-full hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold">Post</span>
          <div className="w-12" />
        </div>
      </motion.header>

      <main className="max-w-xl mx-auto px-4 py-4">
        {/* Post Card */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-neutral-900 rounded-2xl overflow-hidden"
        >
          {/* Author Header */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <Link href="/">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-neutral-700 transition-all"
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
              <p className="text-neutral-500 text-sm">
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
              className="prose font-serif text-[18px] text-neutral-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <span
                    key={category}
                    className="text-xs px-3 py-1 bg-neutral-800 text-neutral-400 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-sm mr-2">
                  {locale === 'en' ? 'Share:' : 'Compartilhar:'}
                </span>

                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 hover:bg-green-600 transition-colors group"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors group"
                  title="Twitter/X"
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors group"
                  title={locale === 'en' ? 'Copy link' : 'Copiar link'}
                >
                  <svg className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
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
                className="block bg-neutral-900/50 hover:bg-neutral-800 active:bg-neutral-700 rounded-xl p-4 transition-colors min-h-[120px]"
              >
                <span className="text-neutral-500 text-xs uppercase tracking-wide flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {locale === 'en' ? 'Newer' : 'Recente'}
                </span>
                <p className="text-[14px] text-neutral-300 mt-2 line-clamp-2">{newerPost.excerpt}</p>
                <span className="text-neutral-600 text-xs mt-2 block">
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
                className="block bg-neutral-900/50 hover:bg-neutral-800 active:bg-neutral-700 rounded-xl p-4 transition-colors text-right min-h-[120px]"
              >
                <span className="text-neutral-500 text-xs uppercase tracking-wide flex items-center gap-1 justify-end">
                  {locale === 'en' ? 'Older' : 'Antigo'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <p className="text-[14px] text-neutral-300 mt-2 line-clamp-2">{olderPost.excerpt}</p>
                <span className="text-neutral-600 text-xs mt-2 block">
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
            className="flex items-center justify-center gap-2 text-neutral-400 hover:text-white active:text-white transition-colors min-h-[48px] px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700"
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
