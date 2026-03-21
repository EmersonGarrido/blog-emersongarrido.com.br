import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Emerson Garrido | Bio',
  description: 'Escute minhas musicas e me encontre nas redes sociais.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://bio.emersongarrido.com.br',
    siteName: 'Emerson Garrido',
    title: 'Emerson Garrido | Bio',
    description: 'Escute minhas musicas e me encontre nas redes sociais.',
    images: [
      {
        url: 'https://emersongarrido.com.br/bio-avatar.jpg',
        width: 400,
        height: 400,
        alt: 'Emerson Garrido',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Emerson Garrido | Bio',
    description: 'Escute minhas musicas e me encontre nas redes sociais.',
    images: ['https://emersongarrido.com.br/bio-avatar.jpg'],
  },
}

interface BioLayoutProps {
  children: ReactNode
}

export default function BioLayout({ children }: BioLayoutProps) {
  return <>{children}</>
}
