'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import RichEditor from '@/components/RichEditor'

interface Category {
  id: number
  name: string
  slug: string
}

export default function EditPostPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!id) return

    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin')
        } else {
          loadData()
        }
      })
  }, [router, id])

  const loadData = async () => {
    try {
      const [postRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/posts/${id}`),
        fetch('/api/admin/categories')
      ])

      const postData = await postRes.json()
      const categoriesData = await categoriesRes.json()

      if (postData.post) {
        setTitle(postData.post.title || '')
        setExcerpt(postData.post.excerpt || '')
        setContent(typeof postData.post.content === 'string' ? postData.post.content : '')
        setPublished(postData.post.published || false)
        setSelectedCategories(Array.isArray(postData.post.categories) ? postData.post.categories.map((c: Category) => c.id) : [])
      }

      setCategories(categoriesData.categories || [])
    } catch (err) {
      console.error('Load error:', err)
      setError('Erro ao carregar post')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title || !content) {
      setError('Título e conteúdo são obrigatórios')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          published,
          categories: selectedCategories
        })
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin/posts')
      } else {
        setError(data.error || 'Erro ao salvar post')
      }
    } catch {
      setError('Erro ao salvar post')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (catId: number) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    )
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/posts" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Editar Post</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showPreview
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {showPreview ? 'Editar' : 'Preview'}
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={saving}
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                />
              )}
              Salvar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {showPreview ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-4">{title || 'Sem título'}</h1>
            {excerpt && <p className="text-white/60 mb-6">{excerpt}</p>}
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do post"
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold placeholder-white/30 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Excerpt */}
            <div>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Resumo do post (aparece na listagem)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Content - Rich Editor */}
            <div>
              <RichEditor
                content={content}
                onChange={setContent}
                placeholder="Comece a escrever seu post..."
              />
            </div>

            {/* Categories */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3 text-white/60">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 ? (
                  <p className="text-white/30 text-sm">Nenhuma categoria. <Link href="/admin/categories" className="text-white/60 hover:text-white underline">Criar categoria</Link></p>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        selectedCategories.includes(cat.id)
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Publish */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-white focus:ring-0 focus:ring-offset-0"
                />
                <div>
                  <span className="text-sm font-medium">Publicado</span>
                  <p className="text-xs text-white/40 mt-0.5">Desmarque para salvar como rascunho</p>
                </div>
              </label>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

// Simple markdown to HTML for preview
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Escape HTML
  html = html.replace(/&/g, '&amp;')
  html = html.replace(/</g, '&lt;')
  html = html.replace(/>/g, '&gt;')

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headings
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 underline">$1</a>')

  // Images
  html = html.replace(/!\[\]\(([^)]+)\)/g, '<img src="$1" class="max-w-full rounded-lg" />')

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-white/20 pl-4 italic text-white/60">$1</blockquote>')

  // Lists
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside">$&</ul>')

  // Paragraphs
  const lines = html.split(/\n\n+/)
  html = lines.map(line => {
    line = line.trim()
    if (!line) return ''
    if (line.startsWith('<')) return line
    return `<p class="mb-4">${line.replace(/\n/g, '<br>')}</p>`
  }).join('')

  return html
}
