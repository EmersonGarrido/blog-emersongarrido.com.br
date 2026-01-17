'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (category: Category) => void
  editCategory?: Category | null
}

export default function CategoryModal({ isOpen, onClose, onSaved, editCategory }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name)
    } else {
      setName('')
    }
    setError('')
  }, [editCategory, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = editCategory
        ? `/api/admin/categories/${editCategory.id}`
        : '/api/admin/categories'

      const res = await fetch(url, {
        method: editCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await res.json()

      if (res.ok) {
        onSaved(data.category || { id: data.id, name: name.trim(), slug: data.slug })
        onClose()
      } else {
        setError(data.error || 'Erro ao salvar categoria')
      }
    } catch {
      setError('Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editCategory) return
    if (!confirm(`Excluir categoria "${editCategory.name}"? Posts não serão excluídos.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories/${editCategory.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onSaved({ id: -1, name: '', slug: '' }) // Signal deletion
        onClose()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir')
      }
    } catch {
      setError('Erro ao excluir categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Nome da categoria
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Tecnologia"
                    autoFocus
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {editCategory && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
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
                    {editCategory ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
