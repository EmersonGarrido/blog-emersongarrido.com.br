import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const isBio = hostname.startsWith('bio.')

  if (isBio) {
    const url = request.nextUrl.clone()

    if (url.pathname === '/') {
      url.pathname = '/bio'
      return NextResponse.rewrite(url)
    }

    if (!url.pathname.startsWith('/api/')) {
      url.pathname = `/bio${url.pathname}`
      return NextResponse.rewrite(url)
    }

    return NextResponse.next()
  }

  const response = NextResponse.next()

  const localeCookie = request.cookies.get('locale')

  if (!localeCookie) {
    const acceptLanguage = request.headers.get('accept-language')
    let locale = 'pt-BR'

    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => {
        const [code] = lang.trim().split(';')
        return code.toLowerCase()
      })

      for (const lang of languages) {
        if (lang.startsWith('en')) {
          locale = 'en'
          break
        }
        if (lang.startsWith('pt')) {
          locale = 'pt-BR'
          break
        }
      }
    }

    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
