import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
      <div className="text-center max-w-md">
        {/* SVG plant illustration */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-8" fill="none">
          <circle cx="60" cy="60" r="60" fill="#F0FDF4" />
          <path d="M60 20C60 20 35 38 35 62C35 78 46 88 60 88C74 88 85 78 85 62C85 38 60 20 60 20Z" fill="#40916C" opacity="0.8" />
          <path d="M60 30L60 88" stroke="#D8F3DC" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 52C54 46 44 44 44 44C44 44 52 56 60 58" stroke="#D8F3DC" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 64C66 58 76 56 76 56C76 56 68 68 60 70" stroke="#D8F3DC" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 88C60 88 50 100 60 110C70 100 60 88 60 88Z" fill="#2D6A4F" opacity="0.5" />
        </svg>

        <h1
          className="text-4xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude, il reste plein de bonnes adresses à découvrir !
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            style={{ background: '#40916C' }}
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/restaurants"
            className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
          >
            <Search size={16} />
            Chercher un restaurant
          </Link>
        </div>

        {/* Popular links */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: 'Paris', href: '/ville/paris' },
            { label: 'Lyon', href: '/ville/lyon' },
            { label: 'Marseille', href: '/ville/marseille' },
            { label: 'Blog', href: '/blog' },
            { label: 'Emploi', href: '/emploi' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
              style={{ background: '#F0FDF4', color: '#40916C', border: '1px solid #D8F3DC' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
