import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

function formatDate(dateString: string | null): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const day = date.getDate()
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day} de ${month} de ${year} às ${hours}:${minutes}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Emerson Garrido'
  const excerpt = searchParams.get('excerpt') || '30 anos. Documentando meu dia a dia, pensamentos e reflexões.'
  const date = searchParams.get('date')

  const avatarUrl = 'https://emersongarrido.com.br/avatar.jpg'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <img
            src={avatarUrl}
            width={80}
            height={80}
            style={{
              borderRadius: '50%',
              marginRight: '20px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', color: '#fff', fontWeight: 'bold' }}>
              Emerson Garrido
            </span>
            <span style={{ fontSize: '24px', color: '#666' }}>@emersongarrido</span>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '58px',
              color: '#fff',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#a3a3a3',
              lineHeight: 1.5,
            }}
          >
            {excerpt.length > 120 ? excerpt.slice(0, 120) + '...' : excerpt}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #333',
            paddingTop: '30px',
          }}
        >
          <span style={{ fontSize: '22px', color: '#666' }}>emersongarrido.com.br</span>
          {date && (
            <span style={{ fontSize: '22px', color: '#666' }}>{formatDate(date)}</span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
