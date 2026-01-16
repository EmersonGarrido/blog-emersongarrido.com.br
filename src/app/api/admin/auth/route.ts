import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createToken, isAuthenticated } from '@/lib/auth'
import { cookies } from 'next/headers'

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const valid = await verifyPassword(password)

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = await createToken()
    const cookieStore = await cookies()

    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// GET - Check auth status
export async function GET() {
  const authenticated = await isAuthenticated()
  return NextResponse.json({ authenticated })
}

// DELETE - Logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return NextResponse.json({ success: true })
}
