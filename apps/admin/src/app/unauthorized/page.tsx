import Link from 'next/link'
import { ShieldOff } from 'lucide-react'

export const metadata = { robots: { index: false, follow: false } }

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
      <div className="text-center max-w-sm">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          <ShieldOff size={36} style={{ color: '#EF4444' }} />
        </div>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Accès refusé
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Vous n&apos;avez pas les droits pour accéder à ce panneau d&apos;administration.
        </p>
        <Link
          href="/"
          className="inline-block text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          style={{ background: '#1B4332' }}
        >
          Retour au site
        </Link>
      </div>
    </main>
  )
}
