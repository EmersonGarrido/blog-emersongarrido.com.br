'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PostCard from '@/components/PostCard'
import { useLocale } from '@/contexts/LocaleContext'
import type { Post } from '@/lib/posts'

interface HomeContentProps {
  posts: Post[]
}

const POSTS_PER_PAGE = 5

export default function HomeContent({ posts }: HomeContentProps) {
  const { t, locale } = useLocale()
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Carregar posts iniciais
  useEffect(() => {
    setVisiblePosts(posts.slice(0, POSTS_PER_PAGE))
    setHasMore(posts.length > POSTS_PER_PAGE)
  }, [posts])

  // Função para carregar mais posts
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    // Simular delay de carregamento
    setTimeout(() => {
      const currentLength = visiblePosts.length
      const nextPosts = posts.slice(currentLength, currentLength + POSTS_PER_PAGE)

      setVisiblePosts(prev => [...prev, ...nextPosts])
      setHasMore(currentLength + POSTS_PER_PAGE < posts.length)
      setLoading(false)
    }, 500)
  }, [loading, hasMore, visiblePosts.length, posts])

  // Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])

  return (
    <div className="min-h-screen bg-black">
      {/* Header simples */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800"
      >
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-center">
          <span className="font-semibold">@emersongarrido</span>
        </div>
      </motion.header>

      <main className="max-w-xl mx-auto">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-4 pt-6 pb-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-2xl font-bold"
              >
                Emerson Garrido
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-neutral-500 mt-0.5"
              >
                @emersongarrido
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-neutral-800"
            >
              <Image
                src="/avatar.jpg"
                alt="Emerson Garrido"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-4 text-[15px] leading-relaxed text-neutral-200"
          >
            {t.age}. {t.bio}
          </motion.p>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-4 p-3 border border-neutral-800 rounded-xl"
          >
            <span className="flex items-center gap-2 text-neutral-500 text-sm mb-2">
              From <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/22px-Flag_of_Brazil.svg.png" alt="Brasil" title="Brasil" className="h-4 rounded-sm" />
            </span>
            <div className="flex items-center gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bandeira_de_Mato_Grosso_do_Sul.svg/23px-Bandeira_de_Mato_Grosso_do_Sul.svg.png" alt="MS" title="Mato Grosso do Sul" className="h-4 rounded-sm" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bandeira_do_Distrito_Federal_%28Brasil%29.svg/23px-Bandeira_do_Distrito_Federal_%28Brasil%29.svg.png" alt="DF" title="Distrito Federal" className="h-4 rounded-sm" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Bandeira_do_estado_do_Rio_de_Janeiro.svg/23px-Bandeira_do_estado_do_Rio_de_Janeiro.svg.png" alt="RJ" title="Rio de Janeiro" className="h-4 rounded-sm" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bandeira_do_Amazonas.svg/23px-Bandeira_do_Amazonas.svg.png" alt="AM" title="Amazonas" className="h-4 rounded-sm" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bandeira_de_Mato_Grosso.svg/23px-Bandeira_de_Mato_Grosso.svg.png" alt="MT" title="Mato Grosso" className="h-4 rounded-sm" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bandeira_do_estado_de_S%C3%A3o_Paulo.svg/23px-Bandeira_do_estado_de_S%C3%A3o_Paulo.svg.png" alt="SP" title="São Paulo" className="h-4 rounded-sm" />
            </div>
          </motion.div>

          {/* Stats + WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center gap-4 mt-4"
          >
            <span className="text-neutral-500 text-[15px]">
              <strong className="text-white">{posts.length}</strong> posts
            </span>

            <a
              href="https://wa.me/5567993109148"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-sm font-medium rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t.contact}
            </a>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-neutral-800 origin-left"
        />

        {/* Feed */}
        <div className="py-2">
          {visiblePosts.length === 0 && !loading ? (
            <div className="px-4 py-16 text-center text-neutral-500">
              <p>{t.noPosts}</p>
            </div>
          ) : (
            <div>
              {visiblePosts.map((post, index) => (
                <PostCard key={post.slug} post={post} index={index} />
              ))}
            </div>
          )}

          {/* Loader / Infinite Scroll Trigger */}
          <div ref={loaderRef} className="py-8">
            {loading && (
              <div className="flex justify-center">
                <motion.div
                  className="flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-neutral-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            )}

            {!hasMore && visiblePosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <p className="text-neutral-600 text-sm">{t.reachedEnd}</p>
                <p className="text-neutral-700 text-xs mt-1">{t.madeBy}</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
