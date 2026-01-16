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
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="px-4 py-3"
    >
      <Link href={`/post/${post.slug}`} className="block">
        <motion.div
          className="flex gap-3"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/avatar.jpg"
                alt="Emerson Garrido"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px]">emersongarrido</span>
              <span className="text-neutral-500 text-[15px]">{formatDate(post.date)}</span>
            </div>

            {/* Card com conteúdo */}
            <div className="mt-2 bg-neutral-900 rounded-2xl p-4 hover:bg-neutral-800 transition-colors">
              <p className="text-[15px] text-neutral-300 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-3 flex items-center gap-1 text-neutral-500 text-sm">
                <span>{t.readMore}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.article>
  )
}
