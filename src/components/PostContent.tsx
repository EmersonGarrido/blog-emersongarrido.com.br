'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
  return (
    <div className="min-h-screen bg-black">
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
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-10 h-10 rounded-full overflow-hidden"
            >
              <Image
                src="/avatar.jpg"
                alt="Emerson Garrido"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <p className="font-semibold text-[15px]">emersongarrido</p>
              <p className="text-neutral-500 text-sm">{formattedDate}</p>
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="px-5 pb-6"
          >
            <div
              className="prose text-[17px] text-neutral-300"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
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
