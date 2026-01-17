'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const VISITOR_ID_KEY = 'emerson-visitor-id'
const VISITOR_FIRST_VISIT_KEY = 'emerson-first-visit'

function generateVisitorId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function getOrCreateVisitorId(): { visitorId: string; isNewVisitor: boolean } {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY)
  let isNewVisitor = false

  if (!visitorId) {
    visitorId = generateVisitorId()
    isNewVisitor = true
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
    localStorage.setItem(VISITOR_FIRST_VISIT_KEY, new Date().toISOString())
  }

  return { visitorId, isNewVisitor }
}

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

    const { visitorId, isNewVisitor } = getOrCreateVisitorId()
    const utmSource = searchParams.get('utm_source') || searchParams.get('ref')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')

    // Send pageview with visitor ID
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: slug || null,
        pageType,
        visitorId,
        isNewVisitor,
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
