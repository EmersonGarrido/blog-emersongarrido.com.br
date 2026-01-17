'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ProfileSettings {
  name: string
  username: string
  bio_pt: string
  bio_en: string
  whatsapp: string
  twitter: string
  instagram: string
  github: string
  linkedin: string
}

const defaultProfile: ProfileSettings = {
  name: 'Emerson Garrido',
  username: 'emersongarrido',
  bio_pt: 'Desenvolvedor, pai, e uma pessoa tentando entender a vida um dia de cada vez.',
  bio_en: 'Developer, father, and someone trying to figure out life one day at a time.',
  whatsapp: '5567993109148',
  twitter: '',
  instagram: '',
  github: '',
  linkedin: ''
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [writingStyle, setWritingStyle] = useState('')
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfile)
  const [activeTab, setActiveTab] = useState<'profile' | 'writing'>('profile')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const loadSettings = useCallback(async () => {
    try {
      // Load writing style
      const styleRes = await fetch('/api/admin/settings?key=writing_style')
      const styleData = await styleRes.json()
      if (styleData.setting?.value) {
        setWritingStyle(styleData.setting.value)
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

      // Load profile settings
      const profileRes = await fetch('/api/admin/settings?key=profile')
      const profileData = await profileRes.json()
      if (profileData.setting?.value) {
        try {
          const parsed = JSON.parse(profileData.setting.value)
          setProfile({ ...defaultProfile, ...parsed })
        } catch {
          // Keep default profile
        }
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
      // Save both profile and writing style
      const [profileRes, styleRes] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'profile',
            value: JSON.stringify(profile)
          })
        }),
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'writing_style',
            value: writingStyle
          })
        })
      ])

      if (profileRes.ok && styleRes.ok) {
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

  const updateProfile = (field: keyof ProfileSettings, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
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
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('writing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'writing'
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Estilo de Escrita
          </button>
        </div>

        {/* Profile Section */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold">Informações Básicas</h2>
                    <p className="text-sm text-white/40">Nome e identificação do perfil</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Nome</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => updateProfile('username', e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold">Biografia</h2>
                    <p className="text-sm text-white/40">Descrição do perfil em português e inglês</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Bio (Português)</label>
                  <textarea
                    value={profile.bio_pt}
                    onChange={(e) => updateProfile('bio_pt', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                    placeholder="Sua biografia em português..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Bio (English)</label>
                  <textarea
                    value={profile.bio_en}
                    onChange={(e) => updateProfile('bio_en', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                    placeholder="Your bio in English..."
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold">Links e Contato</h2>
                    <p className="text-sm text-white/40">Redes sociais e formas de contato</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={profile.whatsapp}
                      onChange={(e) => updateProfile('whatsapp', e.target.value)}
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                      placeholder="5511999999999"
                    />
                    <p className="text-xs text-white/30 mt-1">Formato: código país + DDD + número</p>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Twitter/X</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                      <input
                        type="text"
                        value={profile.twitter}
                        onChange={(e) => updateProfile('twitter', e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Instagram</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) => updateProfile('instagram', e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">GitHub</label>
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => updateProfile('github', e.target.value)}
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={profile.linkedin}
                      onChange={(e) => updateProfile('linkedin', e.target.value)}
                      className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                      placeholder="URL ou username"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Writing Style Section */}
        {activeTab === 'writing' && (
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
        )}

        {/* Info Card - contextual */}
        {activeTab === 'profile' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Sobre as Configurações de Perfil</p>
                <ul className="text-blue-300/80 space-y-1">
                  <li>• As informações são usadas no site público</li>
                  <li>• Bio em dois idiomas para suporte multilíngue</li>
                  <li>• Links sociais aparecem no cabeçalho do perfil</li>
                  <li>• Alterações são aplicadas após salvar</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'writing' && (
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
        )}
      </main>
    </div>
  )
}
