import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// Default profile settings
const defaultProfile = {
  name: 'Emerson Garrido',
  username: 'emersongarrido',
  bio_pt: 'Desenvolvedor, pai, e uma pessoa tentando entender a vida um dia de cada vez.',
  bio_en: 'Developer, father, and someone trying to figure out life one day at a time.',
  about_pt: '',
  about_en: '',
  whatsapp: '5567993109148',
  twitter: '',
  instagram: '',
  github: '',
  linkedin: ''
}

// Get public profile settings (no auth required)
export async function GET() {
  try {
    const result = await sql`SELECT value FROM settings WHERE key = 'profile'`

    if (result.length === 0 || !result[0].value) {
      return NextResponse.json({ profile: defaultProfile })
    }

    try {
      const profile = JSON.parse(result[0].value as string)
      return NextResponse.json({ profile: { ...defaultProfile, ...profile } })
    } catch {
      return NextResponse.json({ profile: defaultProfile })
    }
  } catch (error) {
    console.error('Get profile error:', error)
    // Return default profile on error
    return NextResponse.json({ profile: defaultProfile })
  }
}
