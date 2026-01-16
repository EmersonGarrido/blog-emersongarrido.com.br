'use client'

import { useState, useRef } from 'react'

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showHelp, setShowHelp] = useState(false)

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
            <div><code className="bg-white/10 px-1 rounded"># Título</code> = Título H1</div>
            <div><code className="bg-white/10 px-1 rounded">- item</code> = Lista</div>
            <div><code className="bg-white/10 px-1 rounded">{'>'}citação</code> = Citação</div>
            <div><code className="bg-white/10 px-1 rounded">[texto](url)</code> = Link</div>
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
