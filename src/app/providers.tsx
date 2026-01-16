'use client'

import { ReactNode } from 'react'
import SplashScreen from '@/components/SplashScreen'
import { LocaleProvider } from '@/contexts/LocaleContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SplashScreen>{children}</SplashScreen>
    </LocaleProvider>
  )
}
