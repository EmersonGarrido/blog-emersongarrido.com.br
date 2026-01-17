'use client'

import { ReactNode } from 'react'
import SplashScreen from '@/components/SplashScreen'
import ContentWarningModal from '@/components/ContentWarningModal'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>
          <SplashScreen>{children}</SplashScreen>
          <ContentWarningModal />
        </ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
