'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import RichEditor from '@/components/RichEditor'
import CategoryModal from '@/components/CategoryModal'

interface Category {
  id: number
  name: string
  slug: string
}

export default function NewPostPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showSharePreview, setShowSharePreview] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Auto-save states
  const [draftId, setDraftId] = useState<number | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!title && !content) return
    if (!hasUnsavedChanges.current) return

    setAutoSaveStatus('saving')

    try {
      const plainText = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[\]\([^)]+\)/g, '')
        .replace(/^>\s/gm, '')
        .replace(/^-\s/gm, '')
        .replace(/\n+/g, ' ')
        .trim()
      const excerpt = plainText.slice(0, 500).trim()

      if (draftId) {
        // Update existing draft
        const res = await fetch(`/api/admin/posts/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || 'Rascunho sem título',
            excerpt,
            content,
            published: false,
            categories: selectedCategories
          })
        })
        if (res.ok) {
          setAutoSaveStatus('saved')
          setLastSavedAt(new Date())
          hasUnsavedChanges.current = false
        } else {
          setAutoSaveStatus('error')
        }
      } else {
        // Create new draft
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || 'Rascunho sem título',
            excerpt,
            content,
            published: false,
            categories: selectedCategories
          })
        })
        const data = await res.json()
        if (res.ok && data.id) {
          setDraftId(data.id)
          localStorage.setItem('currentDraftId', data.id.toString())
          setAutoSaveStatus('saved')
          setLastSavedAt(new Date())
          hasUnsavedChanges.current = false
        } else {
          setAutoSaveStatus('error')
        }
      }
    } catch {
      setAutoSaveStatus('error')
    }
  }, [title, content, selectedCategories, draftId])

  // Schedule auto-save when content changes
  useEffect(() => {
    if (title || content) {
      hasUnsavedChanges.current = true
      setAutoSaveStatus('idle')

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave()
      }, 3000) // Save 3 seconds after typing stops
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [title, content, selectedCategories, autoSave])

  // Load existing draft on mount
  useEffect(() => {
    const savedDraftId = localStorage.getItem('currentDraftId')
    if (savedDraftId) {
      fetch(`/api/admin/posts/${savedDraftId}`)
        .then(res => res.json())
        .then(data => {
          if (data.post && !data.post.published) {
            setDraftId(parseInt(savedDraftId))
            setTitle(data.post.title || '')
            setContent(data.post.content || '')
            setSelectedCategories(
              Array.isArray(data.post.categories)
                ? data.post.categories.map((c: Category) => c.id)
                : []
            )
            hasUnsavedChanges.current = false
          } else {
            localStorage.removeItem('currentDraftId')
          }
        })
        .catch(() => {
          localStorage.removeItem('currentDraftId')
        })
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin')
        } else {
          loadCategories()
        }
      })
  }, [router])

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Load categories error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      setError('Título e conteúdo são obrigatórios')
      return
    }

    setLoading(true)
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

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
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
        // Clear draft from localStorage on successful publish/save
        localStorage.removeItem('currentDraftId')
        router.push('/admin/posts')
      } else {
        setError(data.error || 'Erro ao criar post')
      }
    } catch {
      setError('Erro ao criar post')
    } finally {
      setLoading(false)
    }
  }

  const startNewPost = () => {
    localStorage.removeItem('currentDraftId')
    setDraftId(null)
    setTitle('')
    setContent('')
    setSelectedCategories([])
    setAutoSaveStatus('idle')
    setLastSavedAt(null)
    hasUnsavedChanges.current = false
  }

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
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
            <h1 className="text-xl font-bold">{draftId ? 'Editando Rascunho' : 'Novo Post'}</h1>
            {/* Auto-save indicator */}
            <div className="flex items-center gap-2 text-xs">
              {autoSaveStatus === 'saving' && (
                <span className="text-yellow-400 flex items-center gap-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 border border-yellow-400/30 border-t-yellow-400 rounded-full"
                  />
                  Salvando...
                </span>
              )}
              {autoSaveStatus === 'saved' && lastSavedAt && (
                <span className="text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Erro ao salvar
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {draftId && (
              <button
                type="button"
                onClick={startNewPost}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                + Novo
              </button>
            )}
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
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                />
              )}
              {published ? 'Publicar' : 'Salvar'}
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
                  <span className="text-sm font-medium">Publicar agora</span>
                  <p className="text-xs text-white/40 mt-0.5">
                    {published ? 'Será publicado imediatamente' : 'Será salvo como rascunho'}
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
