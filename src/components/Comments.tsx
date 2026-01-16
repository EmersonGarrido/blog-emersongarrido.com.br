'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'

interface Comment {
  id: number
  author_name: string
  content: string
  created_at: string
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
    if (!name.trim() || !content.trim() || submitting) return

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

  return (
    <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
      <h3 className="text-lg font-semibold mb-4">
        {locale === 'en' ? 'Comments' : 'Comentários'}
        {comments.length > 0 && ` (${comments.length})`}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={locale === 'en' ? 'Your name' : 'Seu nome'}
          maxLength={100}
          className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={locale === 'en' ? 'Write a comment...' : 'Escreva um comentário...'}
          maxLength={2000}
          rows={3}
          className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            {locale === 'en' ? 'Comments are moderated' : 'Comentários são moderados'}
          </span>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting
              ? (locale === 'en' ? 'Sending...' : 'Enviando...')
              : (locale === 'en' ? 'Send' : 'Enviar')
            }
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
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24 mb-2" />
              <div className="h-12 bg-[var(--bg-tertiary)] rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm text-center py-4">
          {locale === 'en' ? 'No comments yet. Be the first!' : 'Nenhum comentário ainda. Seja o primeiro!'}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[var(--bg-tertiary)] rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-sm font-medium">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-sm">{comment.author_name}</span>
                  <span className="text-[var(--text-muted)] text-xs ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">
                {comment.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
