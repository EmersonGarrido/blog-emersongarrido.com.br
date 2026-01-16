import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Emerson Garrido'
  const excerpt = searchParams.get('excerpt') || '30 anos. Documentando meu dia a dia, pensamentos e reflexões.'

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
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#222',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
            }}
          >
            <span style={{ fontSize: '40px', color: '#fff', fontWeight: 'bold' }}>E</span>
          </div>
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
              fontSize: '56px',
              color: '#fff',
              fontWeight: 'bold',
              lineHeight: 1.2,
              marginBottom: '20px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#999',
              lineHeight: 1.5,
            }}
          >
            {excerpt.length > 150 ? excerpt.slice(0, 150) + '...' : excerpt}
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
          <span style={{ fontSize: '24px', color: '#666' }}>emersongarrido.com.br</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
