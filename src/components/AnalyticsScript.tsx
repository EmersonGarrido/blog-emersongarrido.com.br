'use client'

import { useEffect } from 'react'

export function AnalyticsScript() {
  useEffect(() => {
    const isBio = window.location.hostname.startsWith('bio.')
    if (isBio) return

    const script = document.createElement('script')
    script.src = 'https://api.promise.codes/pa.js'
    script.dataset.site = 'emersongarrido.com.br'
    script.defer = true
    document.head.appendChild(script)
  }, [])

  return null
}
