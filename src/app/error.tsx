'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Algo deu errado</h1>
        <p className="text-white/60 mb-8">Ocorreu um erro inesperado. Por favor, tente novamente.</p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
