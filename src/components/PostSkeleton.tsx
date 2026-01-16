'use client'

import { motion } from 'framer-motion'

export default function PostSkeleton() {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <motion.div
          className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header skeleton */}
          <div className="flex items-center gap-2">
            <motion.div
              className="h-4 w-24 rounded bg-[var(--bg-tertiary)]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
            />
            <motion.div
              className="h-3 w-32 rounded bg-[var(--bg-tertiary)]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
          </div>

          {/* Card skeleton */}
          <motion.div
            className="mt-2 bg-[var(--bg-secondary)] rounded-2xl overflow-hidden"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          >
            {/* Image placeholder */}
            <div className="w-full aspect-video bg-[var(--bg-tertiary)]" />

            <div className="p-4 space-y-3">
              {/* Text lines */}
              <div className="h-4 w-full rounded bg-[var(--bg-tertiary)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--bg-tertiary)]" />
              <div className="h-4 w-1/2 rounded bg-[var(--bg-tertiary)]" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  )
}
