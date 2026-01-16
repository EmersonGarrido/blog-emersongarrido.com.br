import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Types
export interface Comment {
  id: number
  post_slug: string
  author_name: string
  content: string
  ip_address: string | null
  user_agent: string | null
  is_approved: boolean
  is_spam: boolean
  created_at: Date
}

export interface Like {
  id: number
  post_slug: string
  page_type: string
  visitor_id: string
  ip_address: string | null
  created_at: Date
}

export interface PageView {
  id: number
  post_slug: string | null
  page_type: string
  visitor_id: string | null
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  country: string | null
  city: string | null
  created_at: Date
}
