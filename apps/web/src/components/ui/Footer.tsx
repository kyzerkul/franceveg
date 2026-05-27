import Link from 'next/link'
import { Leaf } from 'lucide-react'

const CITIES = [
  { label: 'Paris', href: '/ville/paris' },
  { label: 'Lyon', href: '/ville/lyon' },
  { label: 'Marseille', href: '/ville/marseille' },
  { label: 'Bordeaux', href: '/ville/bordeaux' },
  { label: 'Nantes', href: '/ville/nantes' },
  { label: 'Tous les restaurants', href: '/restaurants' },
]

const CONTENT_LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Offres d\'emploi', href: '/emploi' },
  { label: 'Soumettre un restaurant', href: '/soumettre-un-restaurant' },
  { label: 'Réclamer une fiche', href: '/restaurants' },
]

const LEGAL_LINKS = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <footer style={{ background: '#1B4332' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                France Veg
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#D1FAE5', opacity: 0.8 }}>
              Le meilleur annuaire vegan & végétarien de France. Fiches complètes, avis vérifiés, horaires en temps réel.
            </p>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: '#D1FAE5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: '#D1FAE5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: '#D1FAE5' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.21 8.21 0 004.79 1.52V6.85a4.85 4.85 0 01-1.02-.16z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider opacity-60">
              Explorer
            </h3>
            <ul className="space-y-2.5">
              {CITIES.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: '#D1FAE5', opacity: 0.75 }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contenu */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider opacity-60">
              Contenu
            </h3>
            <ul className="space-y-2.5">
              {CONTENT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: '#D1FAE5', opacity: 0.75 }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider opacity-60">
              Légal
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: '#D1FAE5', opacity: 0.75 }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#D1FAE5', opacity: 0.45 }}>
            © {new Date().getFullYear()} France Veg. Tous droits réservés.
          </p>
          <p className="text-xs" style={{ color: '#D1FAE5', opacity: 0.35 }}>
            Fait avec 🌱 pour les gourmands verts
          </p>
        </div>
      </div>
    </footer>
  )
}
