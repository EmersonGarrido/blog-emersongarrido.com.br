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

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey)
    if (stored === 'true') {
      setLiked(true)
    }
  }, [storageKey])
  const [showBurst, setShowBurst] = useState(false)

  const handleClick = () => {
    const newLiked = !liked
    setLiked(newLiked)
    localStorage.setItem(storageKey, String(newLiked))

    if (newLiked) {
      setShowBurst(true)
      setTimeout(() => setShowBurst(false), 600)
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

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors group"
        whileTap={{ scale: 0.9 }}
        title={locale === 'en' ? 'Like' : 'Curtir'}
      >
        <motion.svg
          className={`w-5 h-5 transition-colors ${liked ? 'text-red-500' : 'text-[var(--text-muted)] group-hover:text-red-400'}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={liked ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>
      </motion.button>

      {/* Burst effect */}
      <AnimatePresence>
        {showBurst && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-red-500"
                initial={{ scale: 0, x: '-50%', y: '-50%' }}
                animate={{
                  scale: [0, 1, 0],
                  x: `${Math.cos((i * 60 * Math.PI) / 180) * 30 - 50}%`,
                  y: `${Math.sin((i * 60 * Math.PI) / 180) * 30 - 50}%`,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
