'use client'

import { useState, useEffect } from 'react'

const VISITOR_ID_KEY = 'emerson-visitor-id'
const VISITOR_FIRST_VISIT_KEY = 'emerson-first-visit'

function generateVisitorId(): string {
  // Generate a UUID-like ID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export interface VisitorInfo {
  id: string
  isNewVisitor: boolean
  firstVisit: string
}

export function useVisitor(): VisitorInfo | null {
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null)

  useEffect(() => {
    // Check if visitor ID exists
    let visitorId = localStorage.getItem(VISITOR_ID_KEY)
    let firstVisit = localStorage.getItem(VISITOR_FIRST_VISIT_KEY)
    let isNewVisitor = false

    if (!visitorId) {
      // New visitor - generate ID
      visitorId = generateVisitorId()
      firstVisit = new Date().toISOString()
      isNewVisitor = true

      localStorage.setItem(VISITOR_ID_KEY, visitorId)
      localStorage.setItem(VISITOR_FIRST_VISIT_KEY, firstVisit)
    }

    setVisitor({
      id: visitorId,
      isNewVisitor,
      firstVisit: firstVisit || new Date().toISOString()
    })
  }, [])

  return visitor
}

// Function to get visitor ID (for use outside React components)
export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VISITOR_ID_KEY)
}

// Function to check if new visitor
export function isNewVisitor(): boolean {
  if (typeof window === 'undefined') return true
  return !localStorage.getItem(VISITOR_ID_KEY)
}
