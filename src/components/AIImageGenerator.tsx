'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    puter: {
      ai: {
        txt2img: (prompt: string, options?: {
          model?: string
          width?: number
          height?: number
          steps?: number
          negative_prompt?: string
        }) => Promise<HTMLImageElement>
      }
    }
  }
}

interface AIImageGeneratorProps {
  content: string
  title: string
  onInsertImage: (imageUrl: string) => void
}

type ModelType = 'flux' | 'sd3' | 'sdxl'
type StyleType = 'illustration' | 'realistic' | 'abstract' | 'minimal'

const MODELS = {
  flux: {
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'FLUX',
    description: 'Rápido e criativo'
  },
  sd3: {
    id: 'stabilityai/stable-diffusion-3-medium',
    name: 'SD3',
    description: 'Mais detalhado'
  },
  sdxl: {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'SDXL',
    description: 'Estilo clássico'
  }
}

export default function AIImageGenerator({ content, title, onInsertImage }: AIImageGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [style, setStyle] = useState<StyleType>('illustration')
  const [model, setModel] = useState<ModelType>('flux')
  const [puterLoaded, setPuterLoaded] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Load Puter.js script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script')
      script.src = 'https://js.puter.com/v2/'
      script.async = true
      script.onload = () => {
        setPuterLoaded(true)
      }
      script.onerror = () => {
        setError('Erro ao carregar serviço de imagens')
      }
      document.head.appendChild(script)
    } else if (window.puter) {
      setPuterLoaded(true)
    }
  }, [])

  const generatePrompt = () => {
    const plainText = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[\]\([^)]+\)/g, '')
      .replace(/^>\s/gm, '')
      .replace(/^-\s/gm, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 250)

    const stylePrompts = {
      illustration: 'digital illustration, vibrant colors, modern art style, clean design, artistic',
      realistic: 'photorealistic, high quality, professional photography, cinematic lighting, detailed',
      abstract: 'abstract art, geometric shapes, bold colors, modern artistic, conceptual',
      minimal: 'minimalist, simple shapes, clean lines, subtle colors, elegant, white space'
    }

    const basePrompt = `${title}. ${plainText}`
    return `${basePrompt}. Style: ${stylePrompts[style]}. Landscape format, wide shot, no text, no watermark, high quality.`
  }

  const handleGenerate = async () => {
    if (!puterLoaded || !window.puter) {
      setError('Serviço ainda carregando. Aguarde...')
      return
    }

    if (!title && !content) {
      setError('Adicione título ou conteúdo antes de gerar a imagem')
      return
    }

    setGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const prompt = generatePrompt()
      const selectedModel = MODELS[model]

      const imageElement = await window.puter.ai.txt2img(prompt, {
        model: selectedModel.id,
        width: 1024,
        height: 576, // 16:9 landscape
        negative_prompt: 'text, watermark, logo, signature, blurry, low quality, distorted, deformed'
      })

      if (imageElement && imageElement.src) {
        setGeneratedImage(imageElement.src)
      }
    } catch (err) {
      console.error('Image generation error:', err)
      setError('Erro ao gerar imagem. Tente outro modelo.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `${title || 'post'}-ai-image.png`
      link.click()
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Gerar Imagem com IA</span>
          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Beta</span>
        </div>
        <svg className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4"
        >
          <p className="text-xs text-white/40">
            Gera uma imagem baseada no título e conteúdo do post usando IA.
          </p>

          {/* Model selector */}
          <div>
            <label className="text-xs text-white/60 block mb-2">Modelo</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODELS).map(([key, m]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModel(key as ModelType)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    model === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  title={m.description}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Style selector */}
          <div>
            <label className="text-xs text-white/60 block mb-2">Estilo</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'illustration', label: 'Ilustração' },
                { id: 'realistic', label: 'Realista' },
                { id: 'abstract', label: 'Abstrato' },
                { id: 'minimal', label: 'Minimalista' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id as StyleType)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    style === s.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !puterLoaded}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Gerando...
              </>
            ) : !puterLoaded ? (
              'Carregando...'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Gerar Imagem
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</p>
          )}

          {/* Generated image */}
          {generatedImage && (
            <div className="space-y-3">
              <div ref={imageContainerRef} className="relative rounded-lg overflow-hidden bg-black/50 aspect-video">
                <img
                  src={generatedImage}
                  alt="Imagem gerada por IA"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Main action - Insert */}
              <button
                type="button"
                onClick={() => {
                  onInsertImage(generatedImage)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Inserir no Post
              </button>

              {/* Secondary actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/80 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Gerar outra
                </button>
                <button
                  type="button"
                  onClick={downloadImage}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/80 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
