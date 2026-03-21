'use client'

import Script from 'next/script'
import { useState, useEffect } from 'react'

export function AnalyticsScript() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const isBio = window.location.hostname.startsWith('bio.')
    if (!isBio) {
      setShouldLoad(true)
    }
  }, [])

  if (!shouldLoad) return null

  return (
    <Script
      src="https://api.promise.codes/pa.js"
      data-site="emersongarrido.com.br"
      strategy="afterInteractive"
    />
  )
}
