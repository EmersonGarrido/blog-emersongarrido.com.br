'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  published: boolean
}

interface PostLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (post: Post, type: 'card' | 'link') => void
}

export default function PostLinkModal({ isOpen, onClose, onSelect }: PostLinkModalProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [linkType, setLinkType] = useState<'card' | 'link'>('card')

  useEffect(() => {
    if (isOpen) {
      loadPosts()
    }
  }, [isOpen])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/posts?limit=100')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Load posts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1a1a1b] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Linkar Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar posts..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Link Type Toggle */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setLinkType('card')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  linkType === 'card'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                Card Visual
              </button>
              <button
                onClick={() => setLinkType('link')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  linkType === 'link'
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                Link Simples
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">
                {search ? 'Nenhum post encontrado' : 'Nenhum post disponivel'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => onSelect(post, linkType)}
                    className="w-full p-3 rounded-lg text-left hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </span>
                      {!post.published && (
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                          Rascunho
                        </span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-xs text-white/40 line-clamp-2">{post.excerpt}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="p-3 border-t border-white/10 text-xs text-white/40">
            {linkType === 'card' ? (
              <span>Insere um card visual com titulo e descricao do post</span>
            ) : (
              <span>Insere um link simples no formato [titulo](/post/slug)</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
