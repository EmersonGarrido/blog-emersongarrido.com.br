import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if locale cookie already exists
  const localeCookie = request.cookies.get('locale')

  if (!localeCookie) {
    // Detect from Accept-Language header
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

    // Set cookie for future requests
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
