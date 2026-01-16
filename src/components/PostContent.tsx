'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Post } from '@/lib/posts'

interface PostContentProps {
  post: Post
  contentHtml: string
  formattedDate: string
  relatedPosts: Post[]
}

export default function PostContent({ post, contentHtml, formattedDate, relatedPosts }: PostContentProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800"
      >
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg hover:opacity-80 transition-opacity">
            ←
          </Link>
          <span className="font-semibold">Post</span>
          <div className="w-6" />
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

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-6"
          >
            <h3 className="text-neutral-500 text-sm font-medium mb-3 px-1">Mais posts</h3>
            <div className="space-y-2">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    href={`/post/${relatedPost.slug}`}
                    className="block bg-neutral-900/50 hover:bg-neutral-800 rounded-xl p-4 transition-colors"
                  >
                    <p className="text-[15px] text-neutral-300 line-clamp-2">{relatedPost.excerpt}</p>
                    <span className="text-neutral-500 text-sm mt-2 block">
                      {new Date(relatedPost.date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mt-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors py-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-[15px]">Voltar ao início</span>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
