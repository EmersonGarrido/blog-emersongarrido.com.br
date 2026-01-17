'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import RichEditor from '@/components/RichEditor'
import CategoryModal from '@/components/CategoryModal'
import RevisionHistoryModal from '@/components/RevisionHistoryModal'

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
  const [content, setContent] = useState('')
  const [showSharePreview, setShowSharePreview] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

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
      // Auto-generate excerpt from first ~4 lines of content (strip markdown)
      const plainText = content
        .replace(/```[\s\S]*?```/g, '') // remove code blocks
        .replace(/`[^`]+`/g, '') // remove inline code
        .replace(/#{1,6}\s/g, '') // remove headings
        .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
        .replace(/\*([^*]+)\*/g, '$1') // remove italic
        .replace(/~~([^~]+)~~/g, '$1') // remove strikethrough
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links, keep text
        .replace(/!\[\]\([^)]+\)/g, '') // remove images
        .replace(/^>\s/gm, '') // remove blockquotes
        .replace(/^-\s/gm, '') // remove list items
        .replace(/\n+/g, ' ') // normalize newlines
        .trim()

      // Get first ~500 chars for 4 lines
      const excerpt = plainText.slice(0, 500).trim()

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

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Load categories error:', error)
    }
  }

  const handleCategorySaved = (category: Category) => {
    if (category.id === -1) {
      // Deleted
      loadCategories()
      return
    }
    if (editingCategory) {
      // Updated
      setCategories(prev => prev.map(c => c.id === category.id ? category : c))
    } else {
      // Created - add to list and select it
      setCategories(prev => [...prev, category])
      setSelectedCategories(prev => [...prev, category.id])
    }
    setEditingCategory(null)
  }

  const openCreateCategory = () => {
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const openEditCategory = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCategory(cat)
    setShowCategoryModal(true)
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
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
              title="Historico de edicoes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historico
            </button>
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/60">Categorias</h3>
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nova
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 ? (
                  <p className="text-white/30 text-sm">Nenhuma categoria criada ainda.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedCategories.includes(cat.id)
                            ? 'bg-white text-black pr-8'
                            : 'bg-white/10 text-white/60 hover:bg-white/20 pr-8'
                        }`}
                      >
                        {cat.name}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => openEditCategory(cat, e)}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          selectedCategories.includes(cat.id)
                            ? 'hover:bg-black/10 text-black/60'
                            : 'hover:bg-white/20 text-white/40'
                        }`}
                        title="Editar categoria"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Share Preview */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <button
                type="button"
                onClick={() => setShowSharePreview(!showSharePreview)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Preview de Compartilhamento</span>
                </div>
                <svg className={`w-4 h-4 text-white/40 transition-transform ${showSharePreview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSharePreview && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-white/40">Como vai aparecer ao compartilhar nas redes sociais:</p>
                  {/* OG Card Preview - Actual Generated Image */}
                  <div className="bg-[#1a1a1b] border border-white/10 rounded-xl overflow-hidden max-w-md">
                    <img
                      src={`/api/og?title=${encodeURIComponent(title || 'Título do post')}&excerpt=${encodeURIComponent(content ? content.replace(/[#*`\[\]()>-]/g, '').slice(0, 150).trim() : 'Descrição do post...')}`}
                      alt="OG Preview"
                      className="w-full aspect-[1.91/1] object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Publish Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Status</span>
                  <p className="text-xs text-white/40 mt-0.5">
                    {published ? 'Visível para todos' : 'Apenas você pode ver'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    published ? 'bg-green-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      published ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                  <span className={`absolute text-[10px] font-medium ${
                    published ? 'left-2 text-white' : 'right-2 text-white/60'
                  }`}>
                    {published ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false)
          setEditingCategory(null)
        }}
        onSaved={handleCategorySaved}
        editCategory={editingCategory}
      />

      {/* Revision History Modal */}
      <RevisionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        postId={id}
        currentTitle={title}
        currentContent={content}
        onRestore={loadData}
      />
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

  // Alignments
  html = html.replace(/::left\[([^\]]+)\]/g, '<div class="text-left">$1</div>')
  html = html.replace(/::center\[([^\]]+)\]/g, '<div class="text-center">$1</div>')
  html = html.replace(/::right\[([^\]]+)\]/g, '<div class="text-right">$1</div>')

  // Post link card (placeholder in preview)
  html = html.replace(/::post-link\[([^\]]+)\]/g, '<div class="p-4 border border-white/20 rounded-lg bg-white/5 my-4"><span class="text-white/40 text-sm">Post linkado: </span><span class="text-blue-400">$1</span></div>')

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map((c: string) => c.trim())
    const isHeader = cells.every((c: string) => /^-+$/.test(c))
    if (isHeader) return '' // Skip separator row
    const cellTag = 'td'
    const cellsHtml = cells.map((c: string) => `<${cellTag} class="border border-white/20 px-3 py-2">${c}</${cellTag}>`).join('')
    return `<tr>${cellsHtml}</tr>`
  })
  // Wrap table rows
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, '<table class="w-full border-collapse border border-white/20 my-4">$&</table>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 underline">$1</a>')

  // Images
  html = html.replace(/!\[\]\(([^)]+)\)/g, '<img src="$1" class="max-w-full rounded-lg" />')

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-white/20 pl-4 italic text-white/60">$1</blockquote>')

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
