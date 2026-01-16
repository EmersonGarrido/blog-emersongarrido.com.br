'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'

interface HeartReactionProps {
  postSlug: string
  pageType?: 'post' | 'about'
}

export default function HeartReaction({ postSlug, pageType = 'post' }: HeartReactionProps) {
  const { locale } = useLocale()

  const [liked, setLiked] = useState(false)
  const [totalLikes, setTotalLikes] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch initial state from API
    fetch(`/api/likes?slug=${encodeURIComponent(postSlug)}&type=${pageType}`)
      .then(res => res.json())
      .then(data => {
        setLiked(data.isLiked || false)
        setTotalLikes(data.total || 0)
      })
      .catch(console.error)
  }, [postSlug, pageType])

  const handleClick = async () => {
    if (loading) return
    setLoading(true)

    const newLiked = !liked

    // Optimistic update
    setLiked(newLiked)
    setTotalLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))

    if (newLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 800)
    }

    try {
      if (newLiked) {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: postSlug, pageType })
        })
        const data = await res.json()
        setTotalLikes(data.total || 0)
      } else {
        const res = await fetch(`/api/likes?slug=${encodeURIComponent(postSlug)}`, {
          method: 'DELETE'
        })
        const data = await res.json()
        setTotalLikes(data.total || 0)
      }
    } catch (error) {
      // Rollback on error
      setLiked(!newLiked)
      setTotalLikes(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1))
      console.error('Like error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)]">
          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="text-sm text-[var(--text-muted)]">-</span>
      </div>
    )
  }

  // Posições das partículas em círculo
  const particles = [
    { x: 0, y: -25 },
    { x: 22, y: -12 },
    { x: 22, y: 12 },
    { x: 0, y: 25 },
    { x: -22, y: 12 },
    { x: -22, y: -12 },
  ]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.button
          onClick={handleClick}
          disabled={loading}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors group relative overflow-visible disabled:opacity-70"
          whileTap={{ scale: 0.85 }}
          title={locale === 'en' ? 'Like' : 'Curtir'}
        >
          {/* Círculo de pulso atrás */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* Coração */}
          <motion.svg
            className={`w-6 h-6 ${liked ? 'text-red-500' : 'text-[var(--text-muted)] group-hover:text-red-400'}`}
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={isAnimating ? {
              scale: [1, 1.4, 0.9, 1.2, 1],
            } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </motion.svg>
        </motion.button>

        {/* Partículas de explosão */}
        <AnimatePresence>
          {isAnimating && (
            <>
              {particles.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-red-500 pointer-events-none"
                  style={{ marginLeft: -4, marginTop: -4 }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: pos.x,
                    y: pos.y,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.02 }}
                />
              ))}
              {/* Mini corações */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`heart-${i}`}
                  className="absolute top-1/2 left-1/2 text-red-500 pointer-events-none text-xs"
                  style={{ marginLeft: -6, marginTop: -6 }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: [0, (i - 1) * 30],
                    y: [0, -35 - i * 5],
                    scale: [0, 1, 0.5],
                    opacity: [1, 1, 0],
                    rotate: [0, (i - 1) * 20],
                  }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                >
                  ❤️
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Contador de likes */}
      <motion.span
        className={`text-sm ${liked ? 'text-red-500' : 'text-[var(--text-muted)]'}`}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {totalLikes}
      </motion.span>
    </div>
  )
}
