'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  slug: string
}

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string | null
  content: string
  published: boolean
  published_at: string | null
  created_at: string
  categories: Category[]
  views_count: number
  likes_count: number
  comments_count: number
  is_pinned: boolean
  ai_reviewed: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Counts {
  all: number
  published: number
  draft: number
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [counts, setCounts] = useState<Counts>({ all: 0, published: 0, draft: 0 })
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: number; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: limit.toString()
      })
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category', categoryFilter)

      const res = await fetch(`/api/admin/posts?${params}`)
      const data = await res.json()
      // Sort posts: pinned first, then by date
      const sortedPosts = (data.posts || []).sort((a: Post, b: Post) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return 0
      })
      setPosts(sortedPosts)
      setPagination(data.pagination || null)
      if (data.counts) {
        setCounts(data.counts)
      }
    } catch (error) {
      console.error('Load posts error:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, search, categoryFilter, page, limit])

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Load categories error:', error)
    }
  }

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin')
        } else {
          loadPosts()
          loadCategories()
        }
      })
  }, [router, loadPosts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setCategoryFilter('')
    setPage(1)
  }

  const handleMigrate = async () => {
    if (!confirm('Importar posts dos arquivos markdown? Posts existentes serão ignorados.')) return

    setMigrating(true)
    setMigrateResult(null)

    try {
      const res = await fetch('/api/admin/migrate', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMigrateResult(data.message)
        loadPosts()
      } else {
        setMigrateResult(`Erro: ${data.error}`)
      }
    } catch (error) {
      setMigrateResult(`Erro: ${error}`)
    } finally {
      setMigrating(false)
    }
  }

  const handleDelete = (id: number, title: string) => {
    setDeleteModal({ id, title })
  }

  const confirmDelete = async () => {
    if (!deleteModal) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/posts/${deleteModal.id}`, { method: 'DELETE' })
      if (res.ok) {
        loadPosts()
        setDeleteModal(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleTogglePublish = async (post: Post) => {
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          published: !post.published,
          categories: Array.isArray(post.categories) ? post.categories.map(c => c.id) : []
        })
      })
      if (res.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
    }
  }

  const handleTogglePin = async (post: Post) => {
    const action = post.is_pinned ? 'Desafixar' : 'Fixar'
    if (!confirm(`${action} o post "${post.title}"?${!post.is_pinned ? ' O post fixado atual será desafixado.' : ''}`)) return

    try {
      const res = await fetch(`/api/admin/posts/${post.id}/pin`, { method: 'POST' })
      if (res.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error('Toggle pin error:', error)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Skeleton row component
  const SkeletonRow = ({ index }: { index: number }) => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5"
    >
      <td className="px-4 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded-lg w-3/4 animate-pulse" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2 animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <div className="flex gap-1">
          <div className="h-5 bg-white/10 rounded-full w-16 animate-pulse" />
          <div className="h-5 bg-white/10 rounded-full w-20 animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="h-4 bg-white/10 rounded w-8 mx-auto animate-pulse" />
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="h-4 bg-white/10 rounded w-8 mx-auto animate-pulse" />
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="h-4 bg-white/10 rounded w-8 mx-auto animate-pulse" />
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 bg-white/10 rounded-full w-20 animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2 justify-end">
          <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </td>
    </motion.tr>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-16 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 bg-white/10 rounded-lg w-28 animate-pulse" />
              <div className="h-9 bg-white/10 rounded-lg w-28 animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Skeleton filters */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 bg-white/10 rounded-lg w-24 animate-pulse" />
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 max-w-md h-10 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-10 bg-white/10 rounded-lg w-40 animate-pulse" />
              <div className="h-10 bg-white/10 rounded-lg w-32 animate-pulse" />
            </div>
          </div>
          {/* Skeleton table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Título', 'Categorias', 'Views', 'Likes', 'Coment.', 'Data', 'Status', 'Ações'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 ${i > 1 && i < 5 ? 'hidden lg:table-cell' : ''} ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 5 ? 'hidden sm:table-cell' : ''}`}>
                      <div className="h-4 bg-white/10 rounded w-16 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <SkeletonRow key={i} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/dashboard" className="text-white/40 hover:text-white transition-colors block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold"
            >
              Posts
            </motion.h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMigrate}
              disabled={migrating}
              className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {migrating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              Importar MD
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/admin/posts/new"
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Post
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {migrateResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl text-sm"
          >
            {migrateResult}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 mb-6"
        >
          {/* Status tabs */}
          <div className="flex gap-2 relative">
            {['all', 'published', 'draft'].map((f, index) => {
              const count = f === 'all' ? counts.all : f === 'published' ? counts.published : counts.draft
              const label = f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Rascunhos'
              const isActive = filter === f
              return (
                <motion.button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1) }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'text-black'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-black/20 text-black'
                          : f === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {count}
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Search and filters row */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.01 }}
              >
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Pesquisar por título..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                />
                <AnimatePresence>
                  {searchInput && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </form>

            {/* Category filter */}
            <motion.select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              whileHover={{ scale: 1.02 }}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 min-w-[150px] transition-all cursor-pointer"
            >
              <option value="">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </motion.select>

            {/* Items per page */}
            <motion.select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
              whileHover={{ scale: 1.02 }}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </motion.select>

            {/* Clear filters */}
            <AnimatePresence>
              {(search || categoryFilter) && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={clearFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpar filtros
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Active filters info */}
          <AnimatePresence mode="wait">
            {pagination && (
              <motion.div
                key={`${pagination.total}-${search}-${categoryFilter}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-white/40"
              >
                Mostrando {posts.length} de {pagination.total} posts
                {search && <span> • Pesquisa: &quot;{search}&quot;</span>}
                {categoryFilter && <span> • Categoria: {categories.find(c => c.id === Number(categoryFilter))?.name}</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Posts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center text-white/40"
            >
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </motion.svg>
              <p>Nenhum post encontrado</p>
              <p className="text-sm mt-2">Crie um novo post ou importe dos arquivos markdown</p>
            </motion.div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40 text-sm">
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Categorias</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell text-center">Views</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell text-center">Likes</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell text-center">Coment.</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      layout
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${post.is_pinned ? 'bg-yellow-500/5' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/admin/posts/${post.id}`} className="hover:text-white/80">
                          <div className="font-medium flex items-center gap-2">
                            {post.is_pinned && (
                              <span className="text-yellow-400" title="Post fixado">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                                </svg>
                              </span>
                            )}
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm text-white/40 truncate max-w-xs">{post.excerpt}</div>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(post.categories) && post.categories.map((cat) => (
                            <span key={cat.id} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        {post.views_count > 0 ? (
                          <span className="text-blue-400 text-sm flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.views_count}
                          </span>
                        ) : (
                          <span className="text-white/20 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        {post.likes_count > 0 ? (
                          <span className="text-red-400 text-sm flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {post.likes_count}
                          </span>
                        ) : (
                          <span className="text-white/20 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-center">
                        {post.comments_count > 0 ? (
                          <span className="text-cyan-400 text-sm flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comments_count}
                          </span>
                        ) : (
                          <span className="text-white/20 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-sm hidden sm:table-cell">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePublish(post)}
                            className={`text-xs px-2 py-1 rounded-full ${
                              post.published
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {post.published ? 'Publicado' : 'Rascunho'}
                          </button>
                          {post.ai_reviewed && (
                            <span className="text-purple-400" title="Revisado por IA">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePin(post)}
                            className={`p-2 rounded-lg transition-colors ${
                              post.is_pinned
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                : 'hover:bg-white/10 text-white/40 hover:text-yellow-400'
                            }`}
                            title={post.is_pinned ? 'Desafixar post' : 'Fixar post'}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                            </svg>
                          </button>
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          {post.published && (
                            <a
                              href={`/post/${post.slug}`}
                              target="_blank"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Ver post"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Pagination */}
        <AnimatePresence>
          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center justify-between"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/40"
              >
                Página {pagination.page} de {pagination.totalPages}
              </motion.div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                >
                  Anterior
                </motion.button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    const isActive = page === pageNum
                    return (
                      <motion.button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`relative w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-black'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activePage"
                            className="absolute inset-0 bg-white rounded-lg"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className="relative z-10">{pageNum}</span>
                      </motion.button>
                    )
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                >
                  Próxima
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header with icon */}
              <div className="p-6 pb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Excluir post?</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Tem certeza que deseja excluir <span className="text-white font-medium">&quot;{deleteModal.title}&quot;</span>?
                  Esta ação não pode ser desfeita e todos os dados associados serão removidos permanentemente.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
