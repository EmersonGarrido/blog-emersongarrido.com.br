'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [writingStyle, setWritingStyle] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings?key=writing_style')
      const data = await res.json()
      if (data.setting?.value) {
        setWritingStyle(data.setting.value)
      } else {
        // Default writing style template
        setWritingStyle(`# Guia de Estilo - Emerson Garrido

Regras para manter a consistência e autenticidade dos textos do blog.

## Tom de Voz

### O que SOU
- Conversacional, como se estivesse falando com um amigo
- Honesto e vulnerável, sem filtros
- Direto, sem enrolação
- Reflexivo, pensando em voz alta

### O que NÃO SOU
- Formal ou corporativo
- Motivacional forçado (tipo coach)
- Dramático exagerado
- Vitimista pedindo pena

## Estrutura do Texto

### Evitar
- Frases muito curtas em sequência - "Parar. De verdade. E mudar." fica robótico
- Excesso de pontos finais - quebra o fluxo da leitura
- Parágrafos de uma linha só em excesso
- Começar muitas frases com "E" ou "Mas" isolados

### Preferir
- Frases mais longas com vírgulas - flui melhor, como uma conversa
- Conectar ideias - usar "e", "mas", "porque" dentro da frase
- Parágrafos com 2-4 frases - dá ritmo sem ser cansativo
- Reticências (...) para pausas dramáticas ao invés de pontos

## Linguagem

### Usar
- "tô" ao invés de "estou" (quando fizer sentido)
- "pra" ao invés de "para"
- "tá" ao invés de "está"
- Contrações naturais da fala

### Manter
- Português correto (sem erros gramaticais graves)
- Pontuação adequada (mas não excessiva)
- Acentos corretos

## Sobre os Assuntos

### Pode falar sobre
- Saúde mental (depressão, burnout, ansiedade)
- Família (filho, relacionamentos)
- Trabalho e finanças
- Reflexões pessoais
- Dificuldades sem filtro

### Como falar
- Sem vergonha, mas com dignidade
- Sem pedir pena ou validação
- Documentando, não desabafando pra chorar
- Buscando entender, não só reclamar`)
      }
    } catch (error) {
      console.error('Load settings error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin')
        } else {
          loadSettings()
        }
      })
  }, [router, loadSettings])

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'writing_style',
          value: writingStyle
        })
      })

      if (res.ok) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Configurações</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
              />
            ) : saveStatus === 'saved' ? (
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : null}
            {saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Writing Style Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Estilo de Escrita</h2>
                <p className="text-sm text-white/40">
                  Guia para manter consistência nos textos. Usado pela IA para revisar posts.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value)}
              className="w-full h-[60vh] min-h-[400px] px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm font-mono placeholder-white/30 focus:outline-none focus:border-white/20 resize-y"
              placeholder="Cole aqui seu guia de estilo de escrita..."
            />
            <p className="mt-2 text-xs text-white/40">
              Suporta Markdown. Este guia será usado pela IA para revisar e sugerir melhorias nos seus posts.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Como usar o Estilo de Escrita</p>
              <ul className="text-blue-300/80 space-y-1">
                <li>• Defina seu tom de voz e regras de escrita</li>
                <li>• A IA usará esse guia para revisar seus posts</li>
                <li>• Posts revisados terão uma tag "Revisado por IA"</li>
                <li>• Edite a qualquer momento pelo celular ou PC</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
