'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'

export default function SobrePage() {
  const { locale } = useLocale()

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800"
      >
        <div className="max-w-xl mx-auto px-2 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-12 h-12 -ml-2 rounded-full hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold">{locale === 'en' ? 'About' : 'Sobre'}</span>
          <div className="w-12" />
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
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-neutral-800">
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
          className="text-neutral-500 text-center mb-8"
        >
          @emersongarrido
        </motion.p>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6 text-neutral-300 text-[16px] leading-relaxed"
        >
          <p>
            {/* Escreva sua história aqui */}
            Em breve vou contar um pouco da minha história por aqui...
          </p>
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
            className="flex items-center justify-center gap-2 text-neutral-400 hover:text-white active:text-white transition-colors min-h-[48px] px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700"
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
