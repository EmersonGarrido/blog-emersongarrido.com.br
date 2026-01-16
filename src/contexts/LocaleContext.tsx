'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Locale, translations } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  t: typeof translations['pt-BR']
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'pt-BR',
  t: translations['pt-BR'],
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('pt-BR')

  useEffect(() => {
    // Read from cookie
    const cookies = document.cookie.split(';')
    const localeCookie = cookies.find(c => c.trim().startsWith('locale='))

    if (localeCookie) {
      const value = localeCookie.split('=')[1] as Locale
      if (value === 'en' || value === 'pt-BR') {
        setLocale(value)
      }
    } else {
      // Fallback to navigator language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('en')) {
        setLocale('en')
      }
    }
  }, [])

  const t = translations[locale]

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
