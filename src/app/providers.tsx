'use client'

import { ReactNode } from 'react'
import SplashScreen from '@/components/SplashScreen'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <SplashScreen>{children}</SplashScreen>
      </LocaleProvider>
    </ThemeProvider>
  )
}
