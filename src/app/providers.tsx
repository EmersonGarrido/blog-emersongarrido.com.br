'use client'

import { ReactNode } from 'react'
import SplashScreen from '@/components/SplashScreen'

export function Providers({ children }: { children: ReactNode }) {
  return <SplashScreen>{children}</SplashScreen>
}
