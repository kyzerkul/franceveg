import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Star, Eye, ChevronRight, PlusCircle } from 'lucide-react'

const API_URL = process.env.API_URL ?? 'http://localhost:4000'

type OwnedRestaurant = {
  id: string
  name: string
  slug: string
  city: string
  status: string
  is_featured: boolean
  cover_image: string | null
  created_at: string
}

async function getMyRestaurants(token: string): Promise<OwnedRestaurant[]> {
  try {
    const res = await fetch(`${API_URL}/api/users/me/restaurants`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/connexion')

  const [user, token] = await Promise.all([currentUser(), getToken()])
  const restaurants = token ? await getMyRestaurants(token) : []

  const displayName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? 'Propriétaire'
  const initials = displayName.slice(0, 2).toUpperCase()

  const stats = [
    { label: 'Restaurants', value: restaurants.length, icon: MapPin, color: '#40916C', bg: '#F0FDF4' },
    { label: 'Actifs', value: restaurants.filter((r) => r.status === 'active').length, icon: Star, color: '#D4A853', bg: '#FFFBEB' },
    { label: 'En attente', value: restaurants.filter((r) => r.status === 'pending').length, icon: Eye, color: '#F4845F', bg: '#FFF7F5' },
  ]

  return (
    <>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #40916C, #1B4332)' }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                Bonjour, {displayName}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Gérez vos restaurants et suivez vos statistiques.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl p-4 sm:p-5" style={{ background: bg }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                  <Icon size={14} style={{ color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color, fontFamily: 'var(--font-heading)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Wave */}
        <svg viewBox="0 0 1440 40" className="w-full block" style={{ marginTop: '-1px' }}>
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#fff" />
        </svg>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Mes restaurants
            </h2>
            <Link
              href="/soumettre-un-restaurant"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#40916C' }}
            >
              <PlusCircle size={16} />
              Ajouter
            </Link>
          </div>

          {restaurants.length === 0 ? (
            <div className="rounded-3xl p-12 text-center" style={{ background: '#FDF6EC', border: '2px dashed #D8F3DC' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto mb-4 opacity-30" fill="none">
                <path d="M32 4C32 4 12 16 12 36C12 48 21 56 32 56C43 56 52 48 52 36C52 16 32 4 32 4Z" fill="#40916C" />
                <path d="M32 12C32 12 32 40 32 56" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M32 28C28 24 22 22 22 22C22 22 28 30 32 32" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M32 36C36 32 42 30 42 30C42 30 36 38 32 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-gray-500 font-medium mb-1">Aucun restaurant pour l&apos;instant</p>
              <p className="text-gray-400 text-sm mb-6">Soumettez votre restaurant ou réclamez une fiche existante.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/soumettre-un-restaurant"
                  className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: '#40916C' }}
                >
                  Soumettre mon restaurant
                </Link>
                <Link
                  href="/restaurants"
                  className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Chercher ma fiche
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 transition-shadow hover:shadow-md"
                  style={{ border: '1px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  {r.cover_image ? (
                    <img src={r.cover_image} alt={r.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-green-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                        {r.name}
                      </h3>
                      {r.is_featured && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full shrink-0 border border-yellow-100">
                          ★ Mis en avant
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                        r.status === 'active' ? 'bg-green-50 text-green-700' :
                        r.status === 'pending' ? 'bg-orange-50 text-orange-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {r.status === 'active' ? 'Actif' : r.status === 'pending' ? 'En attente' : 'Rejeté'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />{r.city}
                    </p>
                  </div>
                  <Link
                    href={`/restaurants/${r.slug}`}
                    className="flex items-center gap-1 text-sm font-medium shrink-0 transition-colors hover:underline"
                    style={{ color: '#40916C' }}
                  >
                    Voir la fiche <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
