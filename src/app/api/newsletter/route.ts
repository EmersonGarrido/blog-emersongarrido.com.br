import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Ensure table exists
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(100),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// POST - Subscribe to newsletter (public)
export async function POST(request: NextRequest) {
  try {
    await ensureTable()

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await sql`SELECT id, status FROM subscribers WHERE email = ${email.toLowerCase()}`

    if (existing.length > 0) {
      if (existing[0].status === 'active') {
        return NextResponse.json({ error: 'Este email já está inscrito' }, { status: 400 })
      }
      // Reactivate if was unsubscribed
      await sql`UPDATE subscribers SET status = 'active' WHERE id = ${existing[0].id}`
      return NextResponse.json({ success: true, message: 'Inscrição reativada com sucesso!' })
    }

    await sql`
      INSERT INTO subscribers (email, name)
      VALUES (${email.toLowerCase()}, ${name || null})
    `

    return NextResponse.json({ success: true, message: 'Inscrito com sucesso!' })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Erro ao processar inscrição' }, { status: 500 })
  }
}
