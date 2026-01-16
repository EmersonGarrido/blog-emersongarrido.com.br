'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface AnalyticsProps {
  pageType: 'home' | 'post' | 'about'
  slug?: string
}

function AnalyticsTracker({ pageType, slug }: AnalyticsProps) {
  const searchParams = useSearchParams()
  const tracked = useRef(false)

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return
    tracked.current = true

    const utmSource = searchParams.get('utm_source') || searchParams.get('ref')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')

    // Send pageview
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: slug || null,
        pageType,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer: document.referrer || null
      })
    }).catch(console.error)
  }, [pageType, slug, searchParams])

  return null
}

export default function Analytics(props: AnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker {...props} />
    </Suspense>
  )
}
