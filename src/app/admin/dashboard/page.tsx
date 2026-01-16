'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Analytics {
  summary: {
    totalViews: number
    uniqueVisitors: number
    totalLikes: number
    totalComments: number
    pendingComments: number
    onlineUsers: number
  }
  viewsByDay: Array<{ date: string; views: number }>
  topPages: Array<{ page: string; page_type: string; views: number }>
  topPostsByLikes: Array<{ post_slug: string; likes: number }>
  topPostsByComments: Array<{ post_slug: string; comments: number }>
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
  onlineUsersByLocation: Array<{ location: string; country: string; users: number }>
  currentlyViewing: Array<{
    visitor_id: string
    page: string
    page_type: string
    city: string | null
    country: string | null
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
  is_edited?: boolean
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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [totalSubscribers, setTotalSubscribers] = useState(0)
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, commentsRes, subscribersRes] = await Promise.all([
        fetch(`/api/admin/analytics?period=${period}`),
        fetch(`/api/admin/comments?status=${commentFilter}`),
        fetch('/api/admin/subscribers?status=active')
      ])

      const analyticsData = await analyticsRes.json()
      const commentsData = await commentsRes.json()
      const subscribersData = await subscribersRes.json()

      setAnalytics(analyticsData)
      setComments(commentsData.comments || [])
      setTotalSubscribers(subscribersData.total || 0)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }, [period, commentFilter])

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
  }, [router, loadData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadData])

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
      loadData()
    } catch (error) {
      console.error('Comment action error:', error)
    }
  }

  const handleApproveAll = async () => {
    const pending = comments.filter(c => !c.is_approved && !c.is_spam)
    for (const comment of pending) {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: comment.id, action: 'approve' })
      })
    }
    loadData()
  }

  const handleEditComment = async (id: number) => {
    try {
      await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'edit', content: editContent })
      })
      setEditingComment(null)
      setEditContent('')
      loadData()
    } catch (error) {
      console.error('Edit comment error:', error)
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMaxValue = (arr: Array<{ views?: number; likes?: number; comments?: number; users?: number }>) => {
    return Math.max(...arr.map(item => item.views || item.likes || item.comments || item.users || 0), 1)
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/40 hover:text-white/80 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="font-semibold text-white">Dashboard</h1>
            {analytics && analytics.summary.onlineUsers > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-xs font-medium">{analytics.summary.onlineUsers} online</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs">
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-red-400 text-sm transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Comentarios
            {analytics && analytics.summary.pendingComments > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {analytics.summary.pendingComments}
              </span>
            )}
          </button>
          <div className="flex-1" />
          <Link
            href="/admin/posts"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white/5 text-white/60 hover:bg-white/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Posts
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white/5 text-white/60 hover:bg-white/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categorias
          </Link>
          <Link
            href="/admin/subscribers"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white/5 text-white/60 hover:bg-white/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Inscritos
            {totalSubscribers > 0 && (
              <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded-full">
                {totalSubscribers}
              </span>
            )}
          </Link>
        </div>

        {activeTab === 'analytics' && analytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Period Filter */}
            <div className="flex gap-2">
              {['today', '7d', '30d', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === p
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Tudo'}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="text-white/40 text-xs">Views</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.summary.totalViews.toLocaleString()}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-white/40 text-xs">Visitantes</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.summary.uniqueVisitors.toLocaleString()}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">Online</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{analytics.summary.onlineUsers}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <span className="text-white/40 text-xs">Likes</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.summary.totalLikes}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-white/40 text-xs">Comentarios</span>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.summary.totalComments}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-white/40 text-xs">Pendentes</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{analytics.summary.pendingComments}</p>
              </motion.div>
            </div>

            {/* Online Users Section */}
            {analytics.currentlyViewing.length > 0 && (
              <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  Agora no site
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.currentlyViewing.map((user, i) => (
                    <motion.div
                      key={user.visitor_id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-xs"
                    >
                      <span className="text-white/60">
                        {user.page === 'home' ? 'Home' : user.page}
                      </span>
                      {user.city && (
                        <span className="text-white/30">
                          {user.city}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Rankings Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Top Pages by Views */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Mais Visualizados
                </h3>
                <div className="space-y-2">
                  {analytics.topPages.map((page, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <a
                          href={page.page_type === 'post' ? `/post/${page.page}` : '/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-white truncate flex-1 transition-colors"
                        >
                          {page.page_type === 'home' ? 'Home' : page.page}
                        </a>
                        <span className="text-white/40 ml-2">{page.views}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(page.views / getMaxValue(analytics.topPages)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.topPages.length === 0 && (
                    <p className="text-white/30 text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>

              {/* Top Posts by Likes */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  Mais Curtidos
                </h3>
                <div className="space-y-2">
                  {analytics.topPostsByLikes.map((post, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <a
                          href={`/post/${post.post_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-white truncate flex-1 transition-colors"
                        >
                          {post.post_slug}
                        </a>
                        <span className="text-red-400 ml-2">{post.likes}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(post.likes / getMaxValue(analytics.topPostsByLikes)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.topPostsByLikes.length === 0 && (
                    <p className="text-white/30 text-sm">Nenhum like ainda</p>
                  )}
                </div>
              </div>

              {/* Top Posts by Comments */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Mais Comentados
                </h3>
                <div className="space-y-2">
                  {analytics.topPostsByComments.map((post, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <a
                          href={`/post/${post.post_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-white truncate flex-1 transition-colors"
                        >
                          {post.post_slug}
                        </a>
                        <span className="text-cyan-400 ml-2">{post.comments}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(post.comments / getMaxValue(analytics.topPostsByComments)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.topPostsByComments.length === 0 && (
                    <p className="text-white/30 text-sm">Nenhum comentario ainda</p>
                  )}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Fontes de Trafego
                </h3>
                <div className="space-y-2">
                  {analytics.trafficSources.map((source, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white/60 capitalize">{source.source}</span>
                        <span className="text-white/40">{source.views}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(source.views / getMaxValue(analytics.trafficSources)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.trafficSources.length === 0 && (
                    <p className="text-white/30 text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>

              {/* Countries */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Paises
                </h3>
                <div className="space-y-2">
                  {analytics.countries.map((country, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white/60">{country.country}</span>
                        <span className="text-white/40">{country.views}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(country.views / getMaxValue(analytics.countries)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.countries.length === 0 && (
                    <p className="text-white/30 text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>

              {/* Cities */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cidades
                </h3>
                <div className="space-y-2">
                  {analytics.cities.map((city, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white/60">{city.city}</span>
                        <span className="text-white/40">{city.views}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(city.views / getMaxValue(analytics.cities)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.cities.length === 0 && (
                    <p className="text-white/30 text-sm">Nenhum dado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Views */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="font-semibold text-white mb-3">Visitas Recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-left text-xs">
                      <th className="pb-3 font-medium">Pagina</th>
                      <th className="pb-3 font-medium">Fonte</th>
                      <th className="pb-3 font-medium">Local</th>
                      <th className="pb-3 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/60">
                    {analytics.recentViews.map((view) => (
                      <tr key={view.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <a
                            href={view.page_type === 'post' ? `/post/${view.post_slug}` : '/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                          >
                            {view.post_slug || view.page_type}
                          </a>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            view.utm_source === 'whatsapp' ? 'bg-green-500/20 text-green-400' :
                            view.utm_source === 'twitter' ? 'bg-blue-500/20 text-blue-400' :
                            view.utm_source === 'instagram' ? 'bg-pink-500/20 text-pink-400' :
                            view.utm_source === 'facebook' ? 'bg-blue-600/20 text-blue-300' :
                            'bg-white/10 text-white/50'
                          }`}>
                            {view.utm_source || 'direct'}
                          </span>
                        </td>
                        <td className="py-3">{view.city ? `${view.city}, ${view.country}` : view.country || '-'}</td>
                        <td className="py-3 text-white/40">{formatDate(view.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analytics.recentViews.length === 0 && (
                  <p className="text-white/30 text-center py-4">Nenhuma visita ainda</p>
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
            <div className="flex items-center justify-between">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      commentFilter === f.value
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {commentFilter === 'pending' && comments.length > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition-colors"
                >
                  Aprovar todos ({comments.length})
                </button>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              <AnimatePresence>
                {comments.map((comment, i) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-medium text-white text-sm">{comment.author_name}</span>
                          <span className="text-white/30">em</span>
                          <a
                            href={`/post/${comment.post_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          >
                            {comment.post_slug}
                          </a>
                          <span className="text-white/30 text-xs">
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.is_approved && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Aprovado</span>
                          )}
                          {comment.is_spam && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Spam</span>
                          )}
                          {comment.is_edited && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Editado</span>
                          )}
                        </div>
                        {editingComment === comment.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/60 text-xs font-medium rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/70 text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        )}
                        <p className="text-white/20 text-xs mt-2">
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
                        {editingComment !== comment.id && (
                          <button
                            onClick={() => startEditing(comment)}
                            className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                  </motion.div>
                ))}
              </AnimatePresence>

              {comments.length === 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white/40">Nenhum comentario encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
