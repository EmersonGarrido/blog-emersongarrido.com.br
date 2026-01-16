'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Analytics {
  summary: {
    totalViews: number
    uniqueVisitors: number
    totalLikes: number
    totalComments: number
    pendingComments: number
  }
  viewsByDay: Array<{ date: string; views: number }>
  topPages: Array<{ page: string; page_type: string; views: number }>
  trafficSources: Array<{ source: string; views: number }>
  countries: Array<{ country: string; views: number }>
  cities: Array<{ city: string; country: string; views: number }>
  recentViews: Array<{
    id: number
    post_slug: string | null
    page_type: string
    utm_source: string | null
    country: string | null
    city: string | null
    created_at: string
  }>
}

interface Comment {
  id: number
  post_slug: string
  author_name: string
  content: string
  ip_address: string
  is_approved: boolean
  is_spam: boolean
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [period, setPeriod] = useState('7d')
  const [commentFilter, setCommentFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'analytics' | 'comments'>('analytics')

  // Check auth and load data
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin')
        } else {
          loadData()
        }
      })
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, commentsRes] = await Promise.all([
        fetch(`/api/admin/analytics?period=${period}`),
        fetch(`/api/admin/comments?status=${commentFilter}`)
      ])

      const analyticsData = await analyticsRes.json()
      const commentsData = await commentsRes.json()

      setAnalytics(analyticsData)
      setComments(commentsData.comments || [])
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      loadData()
    }
  }, [period, commentFilter])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const handleCommentAction = async (id: number, action: 'approve' | 'reject' | 'spam' | 'delete') => {
    try {
      if (action === 'delete') {
        await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
      } else {
        await fetch('/api/admin/comments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action })
        })
      }
      // Reload comments
      const res = await fetch(`/api/admin/comments?status=${commentFilter}`)
      const data = await res.json()
      setComments(data.comments || [])

      // Reload analytics to update counts
      const analyticsRes = await fetch(`/api/admin/analytics?period=${period}`)
      const analyticsData = await analyticsRes.json()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Comment action error:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="font-semibold">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-[var(--text-muted)] hover:text-red-400 text-sm"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            Comentarios
            {analytics && analytics.summary.pendingComments > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {analytics.summary.pendingComments}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'analytics' && analytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Period Filter */}
            <div className="flex gap-2">
              {['7d', '30d', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    period === p
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Tudo'}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <p className="text-[var(--text-muted)] text-xs">Views</p>
                <p className="text-2xl font-bold mt-1">{analytics.summary.totalViews}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <p className="text-[var(--text-muted)] text-xs">Visitantes</p>
                <p className="text-2xl font-bold mt-1">{analytics.summary.uniqueVisitors}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <p className="text-[var(--text-muted)] text-xs">Likes</p>
                <p className="text-2xl font-bold mt-1">{analytics.summary.totalLikes}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <p className="text-[var(--text-muted)] text-xs">Comentarios</p>
                <p className="text-2xl font-bold mt-1">{analytics.summary.totalComments}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <p className="text-[var(--text-muted)] text-xs">Pendentes</p>
                <p className="text-2xl font-bold mt-1 text-yellow-500">{analytics.summary.pendingComments}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <h3 className="font-semibold mb-3">Top Paginas</h3>
                <div className="space-y-2">
                  {analytics.topPages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)] truncate flex-1">
                        {page.page_type === 'home' ? 'Home' : page.page}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2">{page.views}</span>
                    </div>
                  ))}
                  {analytics.topPages.length === 0 && (
                    <p className="text-[var(--text-muted)] text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <h3 className="font-semibold mb-3">Fontes de Trafego</h3>
                <div className="space-y-2">
                  {analytics.trafficSources.map((source, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)] capitalize">{source.source}</span>
                      <span className="text-[var(--text-muted)]">{source.views}</span>
                    </div>
                  ))}
                  {analytics.trafficSources.length === 0 && (
                    <p className="text-[var(--text-muted)] text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>

              {/* Countries */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <h3 className="font-semibold mb-3">Paises</h3>
                <div className="space-y-2">
                  {analytics.countries.map((country, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{country.country}</span>
                      <span className="text-[var(--text-muted)]">{country.views}</span>
                    </div>
                  ))}
                  {analytics.countries.length === 0 && (
                    <p className="text-[var(--text-muted)] text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>

              {/* Cities */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <h3 className="font-semibold mb-3">Cidades</h3>
                <div className="space-y-2">
                  {analytics.cities.map((city, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{city.city}</span>
                      <span className="text-[var(--text-muted)]">{city.views}</span>
                    </div>
                  ))}
                  {analytics.cities.length === 0 && (
                    <p className="text-[var(--text-muted)] text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Views */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <h3 className="font-semibold mb-3">Visitas Recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--text-muted)] text-left">
                      <th className="pb-2">Pagina</th>
                      <th className="pb-2">Fonte</th>
                      <th className="pb-2">Local</th>
                      <th className="pb-2">Data</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text-secondary)]">
                    {analytics.recentViews.map((view) => (
                      <tr key={view.id} className="border-t border-[var(--border-color)]">
                        <td className="py-2">{view.post_slug || view.page_type}</td>
                        <td className="py-2">{view.utm_source || 'direct'}</td>
                        <td className="py-2">{view.city ? `${view.city}, ${view.country}` : view.country || '-'}</td>
                        <td className="py-2 text-[var(--text-muted)]">{formatDate(view.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analytics.recentViews.length === 0 && (
                  <p className="text-[var(--text-muted)] text-center py-4">Nenhuma visita ainda</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'comments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Comment Filter */}
            <div className="flex gap-2">
              {[
                { value: 'pending', label: 'Pendentes' },
                { value: 'approved', label: 'Aprovados' },
                { value: 'spam', label: 'Spam' },
                { value: 'all', label: 'Todos' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setCommentFilter(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    commentFilter === f.value
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-[var(--bg-secondary)] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-[var(--text-muted)] text-xs">
                          em {comment.post_slug}
                        </span>
                        <span className="text-[var(--text-muted)] text-xs">
                          {formatDate(comment.created_at)}
                        </span>
                        {comment.is_approved && (
                          <span className="text-green-400 text-xs">Aprovado</span>
                        )}
                        {comment.is_spam && (
                          <span className="text-red-400 text-xs">Spam</span>
                        )}
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <p className="text-[var(--text-muted)] text-xs mt-1">
                        IP: {comment.ip_address}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!comment.is_approved && !comment.is_spam && (
                        <button
                          onClick={() => handleCommentAction(comment.id, 'approve')}
                          className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {!comment.is_spam && (
                        <button
                          onClick={() => handleCommentAction(comment.id, 'spam')}
                          className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                          title="Marcar como spam"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleCommentAction(comment.id, 'delete')}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="bg-[var(--bg-secondary)] rounded-xl p-8 text-center">
                  <p className="text-[var(--text-muted)]">Nenhum comentario encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
