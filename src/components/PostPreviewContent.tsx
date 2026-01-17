'use client'

import { useMemo } from 'react'
import PostLinkPreview from './PostLinkPreview'

interface PostPreviewContentProps {
  content: string
  title: string
  categories: { id: number; name: string }[]
  selectedCategories: number[]
}

export default function PostPreviewContent({ content, title, categories, selectedCategories }: PostPreviewContentProps) {
  // Parse content and extract post-links
  const parts = useMemo(() => {
    const regex = /::post-link\[([^\]]+)\]/g
    const result: { type: 'text' | 'post-link'; content: string }[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        })
      }
      // Add the post-link
      result.push({
        type: 'post-link',
        content: match[1] // the slug
      })
      lastIndex = regex.lastIndex
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex)
      })
    }

    return result
  }, [content])

  const selectedCats = categories.filter(c => selectedCategories.includes(c.id))

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-[#1a1a1b] rounded-2xl overflow-hidden">
        {/* Author Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20">
            <img
              src="/avatar.jpg"
              alt="Emerson Garrido"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z"/></svg>'
              }}
            />
          </div>
          <div>
            <div className="font-semibold text-[15px]">emersongarrido</div>
            <p className="text-white/60 text-sm">
              {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              <span> · {Math.ceil(content.split(/\s+/).length / 200) || 1} min de leitura</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 pt-2">
          {parts.map((part, index) => (
            part.type === 'post-link' ? (
              <PostLinkPreview key={index} slug={part.content} />
            ) : (
              <div
                key={index}
                className="prose prose-invert prose-sm max-w-none text-[15px] text-white/80 leading-relaxed
                  [&_p]:mb-4
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-white
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-white
                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-white
                  [&_blockquote]:border-l-4 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/60
                  [&_a]:text-blue-400 [&_a]:underline
                  [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                  [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                  [&_li]:mb-1
                  [&_img]:rounded-lg [&_img]:my-4
                  [&_strong]:text-white [&_strong]:font-semibold
                "
                dangerouslySetInnerHTML={{ __html: markdownToHtml(part.content) }}
              />
            )
          ))}

          {/* Categories */}
          {selectedCats.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              {selectedCats.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs px-3 py-1 bg-white/10 text-white/60 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Actions Preview */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-sm text-white/60">0</span>
              </div>
              <span className="text-white/40 text-sm">Isso fez sentido pra você?</span>
            </div>
            <div className="p-2 rounded-full bg-white/5">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>

          {/* Comments Preview */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Comentários</h3>
              <button className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/60 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Comentar
              </button>
            </div>
            <p className="text-center text-white/40 text-sm py-4">Nenhum comentário ainda. Seja o primeiro!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple markdown to HTML converter
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
