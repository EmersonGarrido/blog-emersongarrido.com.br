'use client'

import { useState, useRef } from 'react'
import PostLinkModal from './PostLinkModal'

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  published: boolean
}

export default function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showPostLinkModal, setShowPostLinkModal] = useState(false)
  const [showAlignMenu, setShowAlignMenu] = useState(false)

  const insertFormat = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    onChange(newText)

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newText = content.substring(0, lineStart) + prefix + content.substring(lineStart)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = content.substring(0, start) + text + content.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newPos = start + text.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handlePostSelect = (post: Post, type: 'card' | 'link') => {
    if (type === 'card') {
      insertText(`\n::post-link[${post.slug}]\n`)
    } else {
      insertText(`[${post.title}](/post/${post.slug})`)
    }
    setShowPostLinkModal(false)
  }

  const insertTable = () => {
    const tableTemplate = `
| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dado 1   | Dado 2   | Dado 3   |
| Dado 4   | Dado 5   | Dado 6   |
`
    insertText(tableTemplate)
  }

  const insertAlignment = (align: 'left' | 'center' | 'right') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || 'Texto aqui'

    insertText(`::${align}[${selectedText}]`)
    setShowAlignMenu(false)
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/5">
        <ToolButton onClick={() => insertFormat('**', '**')} title="Negrito">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </ToolButton>

        <ToolButton onClick={() => insertFormat('*', '*')} title="Itálico">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0v16m0-16l4 16m-8 0h4" />
          </svg>
        </ToolButton>

        <ToolButton onClick={() => insertFormat('~~', '~~')} title="Riscado">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h8M4 12h4m0-4a4 4 0 014-4h0a4 4 0 014 4m-8 8a4 4 0 004 4h0a4 4 0 004-4" />
          </svg>
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <ToolButton onClick={() => insertAtLineStart('# ')} title="Título 1">
          <span className="font-bold text-sm">H1</span>
        </ToolButton>

        <ToolButton onClick={() => insertAtLineStart('## ')} title="Título 2">
          <span className="font-bold text-sm">H2</span>
        </ToolButton>

        <ToolButton onClick={() => insertAtLineStart('### ')} title="Título 3">
          <span className="font-bold text-sm">H3</span>
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <ToolButton onClick={() => insertAtLineStart('- ')} title="Lista">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </ToolButton>

        <ToolButton onClick={() => insertAtLineStart('> ')} title="Citação">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </ToolButton>

        <ToolButton onClick={() => insertFormat('`', '`')} title="Código inline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </ToolButton>

        <ToolButton onClick={() => insertFormat('[', '](url)')} title="Link">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolButton>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Alignment dropdown */}
        <div className="relative">
          <ToolButton onClick={() => setShowAlignMenu(!showAlignMenu)} title="Alinhamento">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToolButton>
          {showAlignMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1b] border border-white/10 rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
              <button
                onClick={() => insertAlignment('left')}
                className="w-full px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
                </svg>
                Esquerda
              </button>
              <button
                onClick={() => insertAlignment('center')}
                className="w-full px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
                </svg>
                Centro
              </button>
              <button
                onClick={() => insertAlignment('right')}
                className="w-full px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
                </svg>
                Direita
              </button>
            </div>
          )}
        </div>

        <ToolButton onClick={insertTable} title="Tabela">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
          </svg>
        </ToolButton>

        <ToolButton onClick={() => setShowPostLinkModal(true)} title="Linkar Post">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </ToolButton>

        <div className="flex-1" />

        <ToolButton onClick={() => setShowHelp(!showHelp)} title="Ajuda Markdown">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </ToolButton>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="p-3 border-b border-white/10 bg-white/5 text-xs text-white/60">
          <div className="grid grid-cols-2 gap-2">
            <div><code className="bg-white/10 px-1 rounded">**texto**</code> = <strong>negrito</strong></div>
            <div><code className="bg-white/10 px-1 rounded">*texto*</code> = <em>itálico</em></div>
            <div><code className="bg-white/10 px-1 rounded"># Titulo</code> = Titulo H1</div>
            <div><code className="bg-white/10 px-1 rounded">- item</code> = Lista</div>
            <div><code className="bg-white/10 px-1 rounded">{'>'}citacao</code> = Citacao</div>
            <div><code className="bg-white/10 px-1 rounded">[texto](url)</code> = Link</div>
            <div><code className="bg-white/10 px-1 rounded">::center[texto]</code> = Centralizado</div>
            <div><code className="bg-white/10 px-1 rounded">::post-link[slug]</code> = Card de post</div>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Escreva seu post em Markdown...'}
        className="w-full min-h-[400px] px-4 py-3 bg-transparent text-white placeholder-white/30 focus:outline-none resize-y font-mono text-sm leading-relaxed"
      />

      {/* Character count */}
      <div className="px-4 py-2 border-t border-white/10 text-xs text-white/30">
        {content.length} caracteres
      </div>

      {/* Post Link Modal */}
      <PostLinkModal
        isOpen={showPostLinkModal}
        onClose={() => setShowPostLinkModal(false)}
        onSelect={handlePostSelect}
      />
    </div>
  )
}

function ToolButton({
  onClick,
  children,
  title
}: {
  onClick: () => void
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg transition-all text-white/60 hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}
