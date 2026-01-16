import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
})

const siteDescription = 'Cansei de pedir ajuda pra pessoas próximas, resolvi relatar publicamente o que ando passando. Não tá fácil, mas sigo tentando.'

export const metadata: Metadata = {
  metadataBase: new URL('https://emersongarrido.com.br'),
  title: {
    default: 'Emerson Garrido',
    template: '%s | Emerson Garrido',
  },
  description: siteDescription,
  keywords: ['Emerson Garrido', 'blog', 'pessoal', 'saúde mental', 'burnout', 'depressão'],
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
    description: siteDescription,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('Emerson Garrido')}&excerpt=${encodeURIComponent(siteDescription)}`,
        width: 1200,
        height: 630,
        alt: 'Emerson Garrido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emerson Garrido',
    description: siteDescription,
    images: [`/api/og?title=${encodeURIComponent('Emerson Garrido')}&excerpt=${encodeURIComponent(siteDescription)}`],
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
      <body className={`${inter.variable} ${lora.variable} font-sans bg-black min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
