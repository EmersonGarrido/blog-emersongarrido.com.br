import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-white/60 mb-8">Página não encontrada</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
