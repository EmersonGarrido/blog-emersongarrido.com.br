'use client'

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
          <div className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-neutral-700 transition-all">
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
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold text-[15px] hover:underline">emersongarrido</Link>
            <span className="text-neutral-500 text-[15px]">{formatDate(post.date)}</span>
          </div>

          {/* Card com conteúdo - link to post */}
          <Link href={`/post/${post.slug}`}>
            <motion.div
              className="mt-2 bg-neutral-900 rounded-2xl overflow-hidden hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
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
                <p className="text-[15px] text-neutral-300 leading-relaxed">
                  {post.excerpt}
                </p>
                {post.categories && post.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.categories.map((category) => (
                      <span
                        key={category}
                        className="text-xs px-2 py-0.5 bg-neutral-700/50 text-neutral-400 rounded-full border border-neutral-700"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-1 text-neutral-500 text-sm">
                  <span>{t.readMore}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
