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
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/posts?status=${filter}`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Load posts error:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin')
        } else {
          loadPosts()
        }
      })
  }, [router, loadPosts])

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

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return

    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error('Delete error:', error)
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
          categories: post.categories.map(c => c.id)
        })
      })
      if (res.ok) {
        loadPosts()
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
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

  if (loading) {
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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Posts</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
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
            </button>
            <Link
              href="/admin/posts/new"
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Post
            </Link>
          </div>
        </div>
      </header>

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
        <div className="flex gap-2 mb-6">
          {['all', 'published', 'draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-white text-black'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Rascunhos'}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-white/40">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p>Nenhum post encontrado</p>
              <p className="text-sm mt-2">Crie um novo post ou importe dos arquivos markdown</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40 text-sm">
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Categorias</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/admin/posts/${post.id}`} className="hover:text-white/80">
                          <div className="font-medium">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-white/40 truncate max-w-xs">{post.excerpt}</div>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {post.categories.map((cat) => (
                            <span key={cat.id} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-sm hidden sm:table-cell">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
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
        </div>
      </main>
    </div>
  )
}
