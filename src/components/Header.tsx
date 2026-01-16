'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg hover:opacity-80 transition-opacity">
          ←
        </Link>
        <span className="font-semibold">Post</span>
        <div className="w-6" />
      </div>
    </header>
  )
}
