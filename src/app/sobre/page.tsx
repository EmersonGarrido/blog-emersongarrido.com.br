'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import ThemeToggle from '@/components/ThemeToggle'
import HeartReaction from '@/components/HeartReaction'

export default function SobrePage() {
  const { locale } = useLocale()
  const [copied, setCopied] = useState(false)

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/sobre`
    : 'https://emersongarrido.com.br/sobre'

  const shareText = locale === 'en'
    ? 'Check out the story of @emersongarrido'
    : 'Conheça a história do @emersongarrido'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + pageUrl)}`, '_blank')
  }

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Toast de link copiado */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {locale === 'en' ? 'Link copied!' : 'Link copiado!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]"
      >
        <div className="max-w-xl mx-auto px-2 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-12 h-12 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold">{locale === 'en' ? 'About me' : 'Sobre mim'}</span>
          <ThemeToggle />
        </div>
      </motion.header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[var(--border-color)]">
            <Image
              src="/avatar.jpg"
              alt="Emerson Garrido"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-2xl font-bold text-center mb-2"
        >
          Emerson Garrido
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-[var(--text-secondary)] text-center mb-8"
        >
          @emersongarrido
        </motion.p>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-5 text-[var(--text-secondary)] text-[18px] leading-relaxed font-serif"
        >
          <p>
            Tenho 30 anos, faço 31 em 2026. Nasci em Campo Grande, MS, e hoje trabalho como programador e desenvolvedor de sistemas.
          </p>

          <p>
            Já morei em muitos lugares: Campo Grande, São José do Rio Claro no Mato Grosso, Manaus, Rio de Janeiro, São Paulo — passei por Campinas, pela capital, por Igaratá — e Brasília, no Sudoeste. Muita mudança, muita estrada, muita fuga.
          </p>

          <p>
            Porque era isso que eu tava fazendo esse tempo todo, fugindo. Sem saber que na verdade tava fugindo de mim mesmo. E isso é foda, porque não tem como fugir da própria cabeça. Ela vai junto pra onde você for.
          </p>

          <p>
            Já tive 3 burnouts graves. Fui internado na Santa Casa de Campo Grande em coma. Aos 18 anos sofri um acidente e fiquei 2 anos numa cadeira de rodas, só voltei a andar depois de 2 cirurgias na perna.
          </p>

          <p>
            Muita coisa aconteceu, muita coisa ainda tá acontecendo. Esse espaço aqui é pra documentar, pra colocar pra fora, pra não guardar tudo sozinho.
          </p>

          <p className="text-[var(--text-muted)] italic mt-8 mb-8">
            ...
          </p>

          <p>
            Comecei a trabalhar com 10 anos. Vendia gelinho, picolé, limpava caminhão pra pegar soja e vender os sacos. Era criança, mas já queria meu dinheiro. Não lembro nem no que gastava, mas lembro que era meu e eu podia fazer o que quisesse.
          </p>

          <p>
            Nessa época ganhei meu primeiro computador. Daqueles brancos de tubo, com internet discada que só funcionava direito de madrugada. Passava horas navegando, buscando entender como as coisas funcionavam.
          </p>

          <p>
            Aos 13 pra 14 anos, entrei num fórum chamado ZoneGames e aprendi a criar servidores de jogos. Servidores piratas de MU Online. Meus olhos brilhavam vendo o que eu conseguia fazer. Eram coisas bobas seguindo tutorial, mas pra mim era mágico ver como algumas palavrinhas, alguns blocos de texto editados, faziam tanta diferença.
          </p>

          <p>
            Ali fiz amigos que tenho até hoje. Mais de 15 anos depois e ainda não conheço vários deles pessoalmente. Mas o tempo validou tanto nossa amizade que não precisa estar perto pra ter respeito. O que manteve a gente foi simples: só dividimos vitórias, nunca problemas.
          </p>

          <p>
            Aprendi Photoshop, CorelDraw, edição de vídeo, sincronia de áudio. Criava capas, menus interativos, fazia coisas que nem sabia que iam me servir no futuro. Tudo isso virando madrugada, vivendo de energético.
          </p>

          <p>
            Meu primeiro emprego "de verdade" foi num jornal. Vi um anúncio, mandei e-mail, e em 20 minutos me chamaram pra entrevista. Fui de chinelo, short velho, camiseta e boné. Meu pai falou que eu não podia ir daquele jeito. Fui assim mesmo.
          </p>

          <p>
            O dono me olhou de cima a baixo e perguntou por que eu tinha ido daquele jeito. Respondi que tinha plena confiança que sabia fazer o trabalho, então aparência não era importante naquele momento. Ele sorriu e me contratou. Acho que foi pela coragem.
          </p>

          <p>
            Reconstruí o site do jornal em 1 semana. O cara anterior, um professor de faculdade, tava enrolando há 6 meses. Depois disso trabalhei em gráfica, aprendi todo o processo de impressão, offset, acabamento. Passei por designer, web designer, programador, redator.
          </p>

          <p>
            Cada lugar que passei, cada perrengue que vivi, me ensinou alguma coisa. Até as coisas erradas que fiz me trouxeram aprendizado. Hoje uso tudo isso pra construir sistemas, resolver problemas, criar coisas que funcionam.
          </p>

          <p>
            Tenho 1,97m de altura. Três filhos que amo. Já casei duas vezes. Já quebrei as duas pernas, o queixo, o ombro. Tenho mais de 24 parafusos na perna esquerda. O joelho ainda falha às vezes, parece que piso e não tem chão.
          </p>

          <p>
            Mas tô aqui. Escrevendo. Codando. Vivendo. Tentando transformar tudo isso em algo que faça sentido pra alguém.
          </p>

          <p className="text-[var(--text-muted)] italic">
            continua...
          </p>

          <p className="text-[var(--text-muted)] text-sm">
            Última atualização: 16 de janeiro de 2026</p>
        </motion.div>

        {/* Reaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center gap-3"
        >
          <HeartReaction postSlug="sobre" />
          <span className="text-[var(--text-muted)] text-sm">
            {locale === 'en' ? 'Did this resonate with you?' : 'Isso fez sentido pra você?'}
          </span>
        </motion.div>

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-4 pt-4 border-t border-[var(--border-color)]"
        >
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)] text-sm mr-2">
              {locale === 'en' ? 'Share:' : 'Compartilhar:'}
            </span>

            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)] hover:bg-green-600 transition-colors group"
              title="WhatsApp"
            >
              <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            {/* Twitter/X */}
            <button
              onClick={handleShareTwitter}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors group"
              title="Twitter/X"
            >
              <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition-colors group"
              title={locale === 'en' ? 'Copy link' : 'Copiar link'}
            >
              <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:text-[var(--text-primary)] transition-colors min-h-[48px] px-6 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-hover)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-[15px]">{locale === 'en' ? 'Back to home' : 'Voltar ao início'}</span>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
