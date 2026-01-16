export type Locale = 'pt-BR' | 'en'

export const translations = {
  'pt-BR': {
    age: '30 anos',
    bio: 'Documentando meu dia a dia, pensamentos e reflexões.',
    writtenBy: 'Escrito por',
    relatedPosts: 'Outros posts',
    loading: 'Carregando...',
    noMorePosts: 'Não há mais posts',
    readMore: 'Ler mais',
    backToHome: 'Voltar ao início',
    publishedAt: 'às',
    contact: 'Contato',
    reachedEnd: 'Você chegou ao fim',
    madeBy: 'Feito com dedicação por Emerson Garrido',
    noPosts: 'Nenhum post ainda.',
  },
  'en': {
    age: '30 years old',
    bio: 'Documenting my daily life, thoughts and reflections.',
    writtenBy: 'Written by',
    relatedPosts: 'Other posts',
    loading: 'Loading...',
    noMorePosts: 'No more posts',
    readMore: 'Read more',
    backToHome: 'Back to home',
    publishedAt: 'at',
    contact: 'Contact',
    reachedEnd: 'You reached the end',
    madeBy: 'Made with dedication by Emerson Garrido',
    noPosts: 'No posts yet.',
  },
}

export function formatDateByLocale(dateString: string, locale: Locale): string {
  const date = new Date(dateString)

  if (locale === 'en') {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr} at ${timeStr}`
  }

  const dateStr = date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateStr} às ${timeStr}`
}

export function getLocaleFromHeaders(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'pt-BR'

  const languages = acceptLanguage.split(',').map(lang => {
    const [code, priority] = lang.trim().split(';q=')
    return {
      code: code.toLowerCase(),
      priority: priority ? parseFloat(priority) : 1,
    }
  }).sort((a, b) => b.priority - a.priority)

  for (const lang of languages) {
    if (lang.code.startsWith('en')) return 'en'
    if (lang.code.startsWith('pt')) return 'pt-BR'
  }

  return 'pt-BR'
}
