import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

// Get all settings or a specific setting by key
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  try {
    if (key) {
      const result = await sql`SELECT * FROM settings WHERE key = ${key}`
      if (result.length === 0) {
        return NextResponse.json({ setting: null })
      }
      return NextResponse.json({ setting: result[0] })
    }

    const settings = await sql`SELECT * FROM settings ORDER BY key`
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

// Create or update a setting
export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Upsert the setting
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value || ''}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${value || ''}, updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save setting error:', error)
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}
