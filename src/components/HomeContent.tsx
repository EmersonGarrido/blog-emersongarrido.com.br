'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import PostCard from '@/components/PostCard'
import { PostSkeletonList } from '@/components/PostSkeleton'
import ThemeToggle from '@/components/ThemeToggle'
import Analytics from '@/components/Analytics'
import NewsletterModal from '@/components/NewsletterModal'
import { useLocale } from '@/contexts/LocaleContext'
import type { Post } from '@/lib/posts'

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

interface HomeContentProps {
  posts: Post[]
}

const POSTS_PER_PAGE = 3

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

export default function HomeContent({ posts }: HomeContentProps) {
  const { t, locale } = useLocale()
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfile)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Load profile settings
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile)
        }
      })
      .catch(console.error)
  }, [])

  // Extrair categorias únicas
  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    posts.forEach(post => {
      post.categories?.forEach(cat => cats.add(cat))
    })
    return Array.from(cats).sort()
  }, [posts])

  // Filtrar posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = !selectedCategory ||
        post.categories?.includes(selectedCategory)

      return matchesSearch && matchesCategory
    })
  }, [posts, searchTerm, selectedCategory])

  // Carregar posts iniciais
  useEffect(() => {
    setVisiblePosts(filteredPosts.slice(0, POSTS_PER_PAGE))
    setHasMore(filteredPosts.length > POSTS_PER_PAGE)
  }, [filteredPosts])

  // Função para carregar mais posts
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    // Simular delay de carregamento
    setTimeout(() => {
      const currentLength = visiblePosts.length
      const nextPosts = filteredPosts.slice(currentLength, currentLength + POSTS_PER_PAGE)

      setVisiblePosts(prev => [...prev, ...nextPosts])
      setHasMore(currentLength + POSTS_PER_PAGE < filteredPosts.length)
      setLoading(false)
    }, 500)
  }, [loading, hasMore, visiblePosts.length, filteredPosts])

  // Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Analytics pageType="home" />
      {/* Header simples */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]"
      >
        <div className="max-w-xl mx-auto px-2 h-14 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            title={locale === 'en' ? 'Search & Filter' : 'Buscar e Filtrar'}
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <span className="font-semibold">@{profile.username}</span>
          <ThemeToggle />
        </div>

        {/* Search & Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[var(--border-color)]"
            >
              <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={locale === 'en' ? 'Search posts...' : 'Buscar posts...'}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Categories */}
                {allCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        !selectedCategory
                          ? 'bg-blue-500 text-white'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {locale === 'en' ? 'All' : 'Todos'}
                    </button>
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          selectedCategory === cat
                            ? 'bg-blue-500 text-white'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results count */}
                {(searchTerm || selectedCategory) && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {filteredPosts.length} {filteredPosts.length === 1 ? (locale === 'en' ? 'result' : 'resultado') : (locale === 'en' ? 'results' : 'resultados')}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="max-w-xl mx-auto">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-4 pt-6 pb-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-2xl font-bold"
              >
                {profile.name}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-2 mt-0.5"
              >
                <span className="text-[var(--text-secondary)]">@{profile.username}</span>
                {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-green-500 transition-colors"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                )}
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[var(--border-color)]"
            >
              <Image
                src="/avatar.jpg"
                alt={profile.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-4 text-[15px] leading-relaxed text-[var(--text-primary)]"
          >
            {t.age}. {locale === 'en' ? profile.bio_en : profile.bio_pt}
          </motion.p>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-3 flex items-center gap-1.5 text-[var(--text-muted)] text-sm"
          >
            <span>From</span>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/18px-Flag_of_Brazil.svg.png" alt="Brasil" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">Brasil</span>
            </div>
            <span className="text-[var(--text-muted)]">·</span>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bandeira_de_Mato_Grosso_do_Sul.svg/18px-Bandeira_de_Mato_Grosso_do_Sul.svg.png" alt="MS" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">Campo Grande, MS</span>
            </div>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bandeira_de_Mato_Grosso.svg/18px-Bandeira_de_Mato_Grosso.svg.png" alt="MT" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">São José do Rio Claro, MT</span>
            </div>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bandeira_do_Amazonas.svg/18px-Bandeira_do_Amazonas.svg.png" alt="AM" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">Manaus, AM</span>
            </div>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Bandeira_do_estado_do_Rio_de_Janeiro.svg/18px-Bandeira_do_estado_do_Rio_de_Janeiro.svg.png" alt="RJ" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">Rio de Janeiro, RJ</span>
            </div>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bandeira_do_Distrito_Federal_%28Brasil%29.svg/18px-Bandeira_do_Distrito_Federal_%28Brasil%29.svg.png" alt="DF" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">Brasília, DF</span>
            </div>
            <div className="group relative">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bandeira_do_estado_de_S%C3%A3o_Paulo.svg/18px-Bandeira_do_estado_de_S%C3%A3o_Paulo.svg.png" alt="SP" className="h-3 rounded-sm" />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">Campinas, Igaratá e Capital, SP</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center gap-4 mt-4"
          >
            <span className="text-[var(--text-secondary)] text-[15px]">
              <strong className="text-[var(--text-primary)]">{posts.length}</strong> posts
            </span>

            <Link
              href="/sobre"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[15px] transition-colors"
            >
              {locale === 'en' ? 'About me' : 'Sobre mim'}
            </Link>

            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-orange-500 text-[15px] transition-colors flex items-center gap-1"
              title="RSS Feed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
              RSS
            </a>

            <button
              onClick={() => setShowNewsletter(true)}
              className="text-[var(--text-secondary)] hover:text-blue-500 text-[15px] transition-colors flex items-center gap-1"
              title="Newsletter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Newsletter
            </button>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-[var(--border-color)] origin-left"
        />

        {/* Feed */}
        <div className="py-2">
          {visiblePosts.length === 0 && !loading ? (
            <div className="px-4 py-16 text-center text-[var(--text-secondary)]">
              <p>{t.noPosts}</p>
            </div>
          ) : (
            <div>
              {visiblePosts.map((post, index) => (
                <PostCard key={post.slug} post={post} index={index} />
              ))}
            </div>
          )}

          {/* Loader / Infinite Scroll Trigger */}
          <div ref={loaderRef} className="py-8">
            {loading && <PostSkeletonList count={2} />}

            {!hasMore && visiblePosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <p className="text-[var(--text-muted)] text-sm">{t.reachedEnd}</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">{t.madeBy}</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Newsletter Modal */}
      <NewsletterModal isOpen={showNewsletter} onClose={() => setShowNewsletter(false)} />
    </div>
  )
}
