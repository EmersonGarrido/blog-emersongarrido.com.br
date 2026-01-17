'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Revision {
  id: number
  title: string
  excerpt: string
  content: string
  edited_by: 'user' | 'ai'
  revision_note: string | null
  created_at: string
}

interface RevisionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  currentTitle: string
  currentContent: string
  onRestore: () => void
}

export default function RevisionHistoryModal({
  isOpen,
  onClose,
  postId,
  currentTitle,
  currentContent,
  onRestore
}: RevisionHistoryModalProps) {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [showDiff, setShowDiff] = useState(true)

  useEffect(() => {
    if (isOpen && postId) {
      loadRevisions()
    }
  }, [isOpen, postId])

  const loadRevisions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/posts/${postId}/revisions`)
      const data = await res.json()
      setRevisions(data.revisions || [])
      if (data.revisions?.length > 0) {
        setSelectedRevision(data.revisions[0])
      }
    } catch (error) {
      console.error('Load revisions error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedRevision) return

    setRestoring(true)
    try {
      const res = await fetch(`/api/admin/posts/${postId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId: selectedRevision.id })
      })

      if (res.ok) {
        onRestore()
        onClose()
      }
    } catch (error) {
      console.error('Restore error:', error)
    } finally {
      setRestoring(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Simple diff - highlight added/removed lines
  const getDiff = (oldText: string, newText: string) => {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    const result: { type: 'same' | 'added' | 'removed'; text: string }[] = []

    // Very simple diff - just compare line by line
    const maxLen = Math.max(oldLines.length, newLines.length)

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i]
      const newLine = newLines[i]

      if (oldLine === newLine) {
        if (oldLine !== undefined) {
          result.push({ type: 'same', text: oldLine })
        }
      } else {
        if (oldLine !== undefined) {
          result.push({ type: 'removed', text: oldLine })
        }
        if (newLine !== undefined) {
          result.push({ type: 'added', text: newLine })
        }
      }
    }

    return result
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1a1a1b] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Historico de Edicoes</h2>
                <p className="text-sm text-white/40">{revisions.length} versoes anteriores</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Revisions List */}
            <div className="w-64 border-r border-white/10 overflow-y-auto">
              {loading ? (
                <div className="p-4 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                  />
                </div>
              ) : revisions.length === 0 ? (
                <div className="p-4 text-center text-white/40 text-sm">
                  Nenhuma revisao encontrada
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {revisions.map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => setSelectedRevision(rev)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedRevision?.id === rev.id
                          ? 'bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          rev.edited_by === 'ai'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rev.edited_by === 'ai' ? 'IA' : 'Manual'}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 truncate">{rev.title}</p>
                      <p className="text-xs text-white/40 mt-1">{formatDate(rev.created_at)}</p>
                      {rev.revision_note && (
                        <p className="text-xs text-white/30 mt-1 truncate">{rev.revision_note}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Diff View */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedRevision ? (
                <>
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          showDiff ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                        }`}
                      >
                        Diff
                      </button>
                      <button
                        onClick={() => setShowDiff(false)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          !showDiff ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                        }`}
                      >
                        Conteudo Original
                      </button>
                    </div>
                    <button
                      onClick={handleRestore}
                      disabled={restoring}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {restoring ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Restaurar esta versao
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {showDiff ? (
                      <div className="space-y-4">
                        {/* Title diff */}
                        {selectedRevision.title !== currentTitle && (
                          <div className="mb-4">
                            <h4 className="text-sm text-white/40 mb-2">Titulo:</h4>
                            <div className="text-sm font-mono">
                              <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-t border-l-2 border-red-500">
                                - {selectedRevision.title}
                              </div>
                              <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-b border-l-2 border-green-500">
                                + {currentTitle}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Content diff */}
                        <div>
                          <h4 className="text-sm text-white/40 mb-2">Conteudo:</h4>
                          <div className="font-mono text-sm bg-black/30 rounded-lg p-4 max-h-[50vh] overflow-y-auto">
                            {getDiff(selectedRevision.content, currentContent).map((line, i) => (
                              <div
                                key={i}
                                className={`px-2 ${
                                  line.type === 'removed'
                                    ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500'
                                    : line.type === 'added'
                                    ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500'
                                    : 'text-white/60'
                                }`}
                              >
                                <span className="text-white/30 mr-2 select-none">
                                  {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
                                </span>
                                {line.text || ' '}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm text-white/40 mb-2">Titulo:</h4>
                          <p className="text-white text-lg font-semibold">{selectedRevision.title}</p>
                        </div>
                        <div>
                          <h4 className="text-sm text-white/40 mb-2">Conteudo:</h4>
                          <div className="font-mono text-sm bg-black/30 rounded-lg p-4 max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-white/80">
                            {selectedRevision.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/40">
                  Selecione uma revisao para visualizar
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
