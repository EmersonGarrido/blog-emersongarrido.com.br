import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://emersongarrido.com.br'),
  title: {
    default: 'Emerson Garrido',
    template: '%s | Emerson Garrido',
  },
  description: '30 anos. Documentando meu dia a dia, pensamentos e reflexões.',
  keywords: ['Emerson Garrido', 'blog', 'pessoal', 'reflexões', 'dia a dia'],
  authors: [{ name: 'Emerson Garrido' }],
  creator: 'Emerson Garrido',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/avatar.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://emersongarrido.com.br',
    siteName: 'Emerson Garrido',
    title: 'Emerson Garrido',
    description: '30 anos. Documentando meu dia a dia, pensamentos e reflexões.',
    images: [
      {
        url: '/api/og?title=Emerson%20Garrido&excerpt=30%20anos.%20Documentando%20meu%20dia%20a%20dia%2C%20pensamentos%20e%20reflex%C3%B5es.',
        width: 1200,
        height: 630,
        alt: 'Emerson Garrido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emerson Garrido',
    description: '30 anos. Documentando meu dia a dia, pensamentos e reflexões.',
    images: ['/api/og?title=Emerson%20Garrido&excerpt=30%20anos.%20Documentando%20meu%20dia%20a%20dia%2C%20pensamentos%20e%20reflex%C3%B5es.'],
    creator: '@emersongarrido',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://emersongarrido.com.br',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/avatar.jpg" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-black min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
