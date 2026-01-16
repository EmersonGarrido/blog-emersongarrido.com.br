'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [focused, setFocused] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/admin/dashboard')
        }
      })
      .finally(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Senha incorreta')
        setPassword('')
      }
    } catch {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          animate={{
            x: [-100, 100, -100],
            y: [-50, 100, -50],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}
          animate={{
            x: [100, -100, 100],
            y: [50, -100, 50],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] opacity-10"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)' }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glass card */}
        <div className="relative">
          {/* Card content */}
          <div className="relative bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 ring-offset-4 ring-offset-black/50">
                  <Image
                    src="/avatar.jpg"
                    alt="Emerson Garrido"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-neutral-700 border border-white/10 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
              <p className="text-white/40 text-sm">Area restrita do painel</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative group">
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    focused
                      ? 'bg-white/5 blur-sm'
                      : 'bg-transparent'
                  }`} />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-white/30">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="Digite sua senha"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-medium rounded-xl transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                        />
                        <span>Entrando...</span>
                      </>
                    ) : (
                      <>
                        <span>Acessar painel</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 pt-6 border-t border-white/5 text-center"
            >
              <a
                href="/"
                className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao blog
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/20 text-xs mt-6"
        >
          emersongarrido.com.br
        </motion.p>
      </motion.div>
    </div>
  )
}
