'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import ThemeToggle from '@/components/ThemeToggle'
import HeartReaction from '@/components/HeartReaction'
import ShareButton from '@/components/ShareButton'

export default function SobrePage() {
  const { locale } = useLocale()
  const [copied, setCopied] = useState(false)

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/sobre`
    : 'https://emersongarrido.com.br/sobre'

  const shareText = locale === 'en'
    ? 'Check out the story of @emersongarrido'
    : 'Conheça a história do @emersongarrido'

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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <HeartReaction postSlug="sobre" />
            <span className="text-[var(--text-muted)] text-sm">
              {locale === 'en' ? 'Did this resonate with you?' : 'Isso fez sentido pra você?'}
            </span>
          </div>
          <ShareButton
            url={pageUrl}
            text={shareText}
            onCopied={() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          />
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
