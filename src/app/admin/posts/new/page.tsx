'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import RichEditor from '@/components/RichEditor'

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

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
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
            <h1 className="text-xl font-bold">Novo Post</h1>
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
                  {/* OG Card Preview */}
                  <div className="bg-[#1a1a1b] border border-white/10 rounded-xl overflow-hidden max-w-md">
                    <div className="aspect-[1.91/1] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/30">Avatar padrão será usado</p>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-white/40 mb-1">emersongarrido.com.br</p>
                      <p className="font-semibold text-white text-sm line-clamp-2">
                        {title || 'Título do post'}
                      </p>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">
                        {content ? content.replace(/[#*`\[\]()>-]/g, '').slice(0, 150).trim() || 'Descrição do post...' : 'Descrição do post...'}
                      </p>
                    </div>
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
