'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'

interface Comment {
  id: number
  author_name: string
  content: string
  created_at: string
  is_edited?: boolean
  likes_count?: number
  is_liked?: boolean
}

interface CommentsProps {
  postSlug: string
}

export default function Comments({ postSlug }: CommentsProps) {
  const { locale } = useLocale()
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load comments
  useEffect(() => {
    setLoading(true)
    fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`)
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [postSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: postSlug,
          authorName: name,
          content
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: locale === 'en' ? 'Comment submitted! Waiting for approval.' : 'Comentário enviado! Aguardando aprovação.'
        })
        setName('')
        setContent('')
      } else {
        setMessage({
          type: 'error',
          text: data.error || (locale === 'en' ? 'Failed to send comment' : 'Erro ao enviar comentário')
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: locale === 'en' ? 'Failed to send comment' : 'Erro ao enviar comentário'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCommentLike = async (commentId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        const res = await fetch(`/api/comments/like?commentId=${commentId}`, { method: 'DELETE' })
        const data = await res.json()
        setComments(comments.map(c =>
          c.id === commentId ? { ...c, likes_count: data.likes_count, is_liked: false } : c
        ))
      } else {
        const res = await fetch('/api/comments/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentId })
        })
        const data = await res.json()
        setComments(comments.map(c =>
          c.id === commentId ? { ...c, likes_count: data.likes_count, is_liked: true } : c
        ))
      }
    } catch (error) {
      console.error('Like comment error:', error)
    }
  }

  return (
    <div id="comments" className="mt-6 pt-4 border-t border-[var(--border-color)]">
      {/* Collapsed State - Just a button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex flex-col items-center justify-center gap-1 py-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {locale === 'en' ? 'Add a comment' : 'Comentar'}
            {comments.length > 0 && ` (${comments.length})`}
          </div>
          {comments.length === 0 && !loading && (
            <span className="text-xs text-[var(--text-muted)]/60">
              {locale === 'en' ? 'No comments yet. Be the first!' : 'Nenhum comentário ainda. Seja o primeiro!'}
            </span>
          )}
        </button>
      )}

      {/* Expanded State - Full form and comments */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">
                {locale === 'en' ? 'Comments' : 'Comentários'}
                {comments.length > 0 && ` (${comments.length})`}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-4 space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={locale === 'en' ? 'Write a comment...' : 'Escreva um comentário...'}
                maxLength={2000}
                rows={2}
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={locale === 'en' ? 'Name (optional)' : 'Nome (opcional)'}
                  maxLength={100}
                  className="flex-1 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {submitting ? '...' : (locale === 'en' ? 'Send' : 'Enviar')}
                </button>
              </div>
            </form>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comments List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24 mb-2" />
                    <div className="h-12 bg-[var(--bg-tertiary)] rounded" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm text-center py-3">
                {locale === 'en' ? 'No comments yet. Be the first!' : 'Nenhum comentário ainda. Seja o primeiro!'}
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[var(--bg-tertiary)] rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-hover)] flex items-center justify-center">
                        <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs">{comment.author_name || (locale === 'en' ? 'Anonymous' : 'Anônimo')}</span>
                        <span className="text-[var(--text-muted)] text-xs">
                          {formatDate(comment.created_at)}
                        </span>
                        {comment.is_edited && (
                          <span className="text-[var(--text-muted)] text-xs italic">
                            ({locale === 'en' ? 'edited' : 'editado'})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    {/* Like button */}
                    <div className="mt-2 flex items-center">
                      <button
                        onClick={() => handleCommentLike(comment.id, comment.is_liked || false)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.is_liked ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-500'
                        }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill={comment.is_liked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
