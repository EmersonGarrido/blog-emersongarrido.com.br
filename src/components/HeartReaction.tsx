'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'

interface HeartReactionProps {
  postSlug: string
}

export default function HeartReaction({ postSlug }: HeartReactionProps) {
  const { locale } = useLocale()
  const storageKey = `heart-${postSlug}`

  const [liked, setLiked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey)
    if (stored === 'true') {
      setLiked(true)
    }
  }, [storageKey])

  const handleClick = () => {
    const newLiked = !liked
    setLiked(newLiked)
    localStorage.setItem(storageKey, String(newLiked))

    if (newLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 800)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)]">
        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
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
    <div className="relative">
      <motion.button
        onClick={handleClick}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors group relative overflow-visible"
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
  )
}
