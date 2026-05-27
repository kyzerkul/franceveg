import { getStats } from '@/lib/api'
import { UtensilsCrossed, ShieldCheck, Star, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const stats = await getStats().catch(() => null)

  const cards = [
    {
      label: 'Restaurants actifs',
      value: stats?.restaurants.total ?? '—',
      sub: stats?.restaurants.pending ? `${stats.restaurants.pending} en attente` : 'Aucun en attente',
      icon: UtensilsCrossed,
      color: '#40916C',
      bg: '#F0FDF4',
      border: '#D8F3DC',
      href: '/restaurants',
      urgent: false,
    },
    {
      label: 'Claims en attente',
      value: stats?.claims.pending ?? '—',
      sub: 'demandes de propriété',
      icon: ShieldCheck,
      color: stats?.claims.pending ? '#F4845F' : '#9CA3AF',
      bg: stats?.claims.pending ? '#FFF7F5' : '#F9FAFB',
      border: stats?.claims.pending ? '#FECACA' : '#F3F4F6',
      href: '/claims',
      urgent: !!(stats?.claims.pending),
    },
    {
      label: 'Avis en attente',
      value: stats?.reviews.pending ?? '—',
      sub: 'à modérer',
      icon: Star,
      color: stats?.reviews.pending ? '#D4A853' : '#9CA3AF',
      bg: stats?.reviews.pending ? '#FFFBEB' : '#F9FAFB',
      border: stats?.reviews.pending ? '#FDE68A' : '#F3F4F6',
      href: '/avis',
      urgent: !!(stats?.reviews.pending),
    },
    {
      label: 'Utilisateurs inscrits',
      value: stats?.users.total ?? '—',
      sub: 'comptes créés',
      icon: Users,
      color: '#6366F1',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      href: '/users',
      urgent: false,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Tableau de bord
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue d&apos;ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: '#F0FDF4', color: '#40916C', border: '1px solid #D8F3DC' }}>
          <TrendingUp size={12} />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, sub, icon: Icon, color, bg, border, href, urgent }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: 'white',
              border: `1px solid ${border}`,
              boxShadow: urgent
                ? `0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px ${border}`
                : '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              {urgent && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: bg, color }}
                >
                  Action requise
                </span>
              )}
            </div>
            <div
              className="text-3xl font-bold mb-0.5"
              style={{ color, fontFamily: 'var(--font-heading)' }}
            >
              {value}
            </div>
            <div className="text-sm font-medium text-gray-800">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <h2 className="text-sm font-semibold text-gray-700 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Accès rapide
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Restaurants actifs', href: '/restaurants?status=active', color: '#40916C', bg: '#F0FDF4' },
            { label: 'En attente validation', href: '/restaurants?status=pending', color: '#F4845F', bg: '#FFF7F5' },
            { label: 'Claims à traiter', href: '/claims?status=pending', color: '#D4A853', bg: '#FFFBEB' },
            { label: 'Avis à modérer', href: '/avis?status=pending', color: '#6366F1', bg: '#EEF2FF' },
          ].map(({ label, href, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: bg, color }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
