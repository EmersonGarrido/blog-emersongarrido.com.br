import { NextRequest, NextResponse } from 'next/server'

function isValidPayload(body: unknown): body is {
  platform: string
  url: string
  screenWidth: number
  screenHeight: number
  timezone: string
  language: string
  referrer: string
} {
  if (typeof body !== 'object' || body === null) return false
  const obj = body as Record<string, unknown>
  return (
    typeof obj.platform === 'string' && obj.platform.length <= 50 &&
    typeof obj.url === 'string' && obj.url.length <= 500 &&
    typeof obj.screenWidth === 'number' && obj.screenWidth >= 0 && obj.screenWidth <= 10000 &&
    typeof obj.screenHeight === 'number' && obj.screenHeight >= 0 && obj.screenHeight <= 10000 &&
    typeof obj.timezone === 'string' && obj.timezone.length <= 100 &&
    typeof obj.language === 'string' && obj.language.length <= 20 &&
    typeof obj.referrer === 'string' && obj.referrer.length <= 500
  )
}

function parseUserAgent(ua: string): string {
  if (!ua) return 'Desconhecido'

  let device = 'Desktop'
  if (/iPhone/i.test(ua)) device = 'iPhone'
  else if (/iPad/i.test(ua)) device = 'iPad'
  else if (/Android/i.test(ua)) {
    device = /Mobile/i.test(ua) ? 'Android Phone' : 'Android Tablet'
  } else if (/Macintosh/i.test(ua)) device = 'Mac'
  else if (/Windows/i.test(ua)) device = 'Windows'
  else if (/Linux/i.test(ua)) device = 'Linux'

  let browser = 'Outro'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome'
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera'

  return `${device} / ${browser}`
}

function generateFingerprint(ip: string, ua: string, language: string): string {
  const raw = `${ip}|${ua}|${language}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

function stripQueryString(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return url.split('?')[0]
  }
}

const PLATFORM_EMOJIS: Record<string, string> = {
  spotify: '🟢',
  'youtube-music': '🔴',
  'apple-music': '🍎',
  'amazon-music': '📦',
  deezer: '🟣',
  soundcloud: '🟠',
  tidal: '⬛',
  audiomack: '🟡',
  whatsapp: '💬',
  instagram: '📸',
  facebook: '📘',
  'blog-pessoal': '📝',
  linkedin: '💼',
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (!isValidPayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { platform, url, screenWidth, screenHeight, timezone, language, referrer } = body

    // x-forwarded-for is trusted on Vercel (appended by edge, not client-controlled)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const country = request.headers.get('x-vercel-ip-country') || '??'
    const city = request.headers.get('x-vercel-ip-city') || '??'
    const region = request.headers.get('x-vercel-ip-country-region') || '??'

    const deviceInfo = parseUserAgent(userAgent)
    const fingerprint = generateFingerprint(ip, userAgent, language)
    const emoji = PLATFORM_EMOJIS[platform] || '🔗'
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const safeReferrer = referrer ? stripQueryString(referrer) : 'Direto'

    const webhookUrl = process.env.DISCORD_BIO_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('DISCORD_BIO_WEBHOOK_URL not configured')
      return NextResponse.json({ ok: true })
    }

    const embed = {
      title: `${emoji} Bio Link Click`,
      color: 0x2dd4bf,
      fields: [
        { name: 'Plataforma', value: platform, inline: true },
        { name: 'URL', value: url || '-', inline: true },
        { name: 'IP', value: `\`${ip}\``, inline: true },
        { name: 'Dispositivo', value: deviceInfo, inline: true },
        { name: 'Localização', value: `${city}, ${region} - ${country}`, inline: true },
        { name: 'Tela', value: `${screenWidth}x${screenHeight}`, inline: true },
        { name: 'Idioma', value: language || '-', inline: true },
        { name: 'Timezone', value: timezone || '-', inline: true },
        { name: 'Referrer', value: safeReferrer, inline: true },
        { name: 'User ID', value: `\`${fingerprint}\``, inline: true },
      ],
      footer: { text: `Bio Analytics | ${timestamp}` },
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!webhookResponse.ok) {
      console.error(`Discord webhook failed: ${webhookResponse.status}`)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
