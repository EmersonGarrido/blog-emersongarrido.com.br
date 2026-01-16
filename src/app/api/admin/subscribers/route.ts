import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

// GET - List all subscribers
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const format = searchParams.get('format')

  try {
    let subscribers
    if (status === 'active') {
      subscribers = await sql`
        SELECT * FROM subscribers WHERE status = 'active' ORDER BY created_at DESC
      `
    } else if (status === 'inactive') {
      subscribers = await sql`
        SELECT * FROM subscribers WHERE status != 'active' ORDER BY created_at DESC
      `
    } else {
      subscribers = await sql`
        SELECT * FROM subscribers ORDER BY created_at DESC
      `
    }

    // Export as CSV
    if (format === 'csv') {
      const csv = [
        'email,name,status,created_at',
        ...subscribers.map((s) =>
          `${s.email},${s.name || ''},${s.status},${s.created_at}`
        )
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=subscribers.csv'
        }
      })
    }

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM subscribers WHERE status = 'active'`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ subscribers, total })
  } catch (error) {
    console.error('Get subscribers error:', error)
    return NextResponse.json({ error: 'Failed to get subscribers' }, { status: 500 })
  }
}

// DELETE - Remove subscriber
export async function DELETE(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    await sql`DELETE FROM subscribers WHERE id = ${parseInt(id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete subscriber error:', error)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
