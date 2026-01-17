'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'content-warning-accepted'

export default function ContentWarningModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem(STORAGE_KEY)
    if (!hasAccepted) {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  const handleDecline = () => {
    // Redirect to a neutral page or close
    window.location.href = 'https://google.com'
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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-center mb-4 text-[var(--text-primary)]">
                Antes de continuar
              </h2>

              {/* Content */}
              <div className="text-[var(--text-secondary)] text-sm space-y-3 mb-6">
                <p>
                  Este site contém relatos pessoais sobre saúde mental, incluindo temas como depressão, burnout e ansiedade.
                </p>
                <p>
                  Não é um pedido de ajuda nem um desabafo buscando pena. É um diário, uma forma de documentar o que estou vivendo.
                </p>
                <p>
                  Se você está passando por dificuldades semelhantes, saiba que não está sozinho. O CVV (Centro de Valorização da Vida) atende 24h pelo <span className="text-yellow-400 font-medium">188</span>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDecline}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Prefiro não ler
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
                >
                  Entendo e quero continuar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
