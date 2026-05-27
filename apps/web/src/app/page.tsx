import Link from 'next/link'
import { Search, MapPin, Leaf, CheckCircle } from 'lucide-react'
import { getFeaturedRestaurants, getRegions, getBlogPosts } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import Image from 'next/image'

const TOP_CITIES = [
  { name: 'Paris', slug: 'paris', emoji: '🗼', count: '80+' },
  { name: 'Lyon', slug: 'lyon', emoji: '🦁', count: '25+' },
  { name: 'Marseille', slug: 'marseille', emoji: '⛵', count: '20+' },
  { name: 'Bordeaux', slug: 'bordeaux', emoji: '🍷', count: '18+' },
  { name: 'Nantes', slug: 'nantes', emoji: '🐘', count: '15+' },
  { name: 'Toulouse', slug: 'toulouse', emoji: '🌸', count: '14+' },
  { name: 'Montpellier', slug: 'montpellier', emoji: '☀️', count: '12+' },
  { name: 'Strasbourg', slug: 'strasbourg', emoji: '🥨', count: '10+' },
]

const STATS = [
  { value: '500+', label: 'restaurants référencés' },
  { value: '1 000+', label: 'avis vérifiés' },
  { value: '20', label: 'régions couvertes' },
  { value: '100%', label: 'gratuit' },
]

export default async function HomePage() {
  const [featured, regions, blogResult] = await Promise.all([
    getFeaturedRestaurants().catch(() => []),
    getRegions().catch(() => []),
    getBlogPosts({ page: 1, limit: 3 }).catch(() => ({ data: [], total: 0 })),
  ])

  const topRegions = regions.filter((r) => r.type === 'region').slice(0, 12)
  const latestPosts = blogResult.data.slice(0, 3)

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #081C15 0%, #1B4332 40%, #2D6A4F 100%)' }}>
        {/* Leaf pattern overlay */}
        <div className="absolute inset-0 bg-leaf-pattern opacity-60" />

        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-sm font-medium border"
            style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: '#D8F3DC' }}>
            <Leaf size={14} />
            500+ restaurants vegan en France
          </div>

          {/* H1 */}
          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-playfair, var(--font-display))' }}
          >
            Les meilleurs restaurants<br />
            <span style={{ color: '#F4845F' }}>vegan & végétariens</span>
            <br />en France
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-xl mx-auto" style={{ color: '#B7E4C7' }}>
            Fiches complètes, avis certifiés, horaires en temps réel.
          </p>

          {/* Search bar */}
          <form
            action="/restaurants"
            method="GET"
            className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto bg-white rounded-2xl p-2"
            style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}
          >
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="Restaurant, cuisine..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="w-px bg-gray-200 hidden sm:block self-stretch my-1" />
            <div className="relative sm:w-44">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="city"
                type="text"
                placeholder="Ville..."
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-semibold text-white transition-colors shrink-0"
              style={{ background: '#40916C' }}
            >
              Chercher
            </button>
          </form>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm flex-wrap" style={{ color: '#95D5B2' }}>
            <span>500+ restaurants</span>
            <span style={{ color: '#52B788' }}>·</span>
            <span>Avis vérifiés</span>
            <span style={{ color: '#52B788' }}>·</span>
            <span>100% gratuit</span>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60H1440V20C1200 60 960 0 720 20C480 40 240 0 0 20V60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Featured restaurants ── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
          <SectionHeader title="Sélection de la semaine" href="/restaurants" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 3).map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── Top cities ── */}
      <section className="py-16 px-4 bg-leaf-pattern" style={{ background: '#FDF6EC' }}>
        <div className="max-w-7xl mx-auto sm:px-2">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl mb-3">
              <MapPin size={20} className="text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Trouvez par ville
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOP_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/ville/${city.slug}`}
                className="group flex items-center gap-3 bg-white rounded-2xl px-4 py-4 border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <span className="text-2xl">{city.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors text-sm">
                    {city.name}
                  </div>
                  <div className="text-xs text-gray-400">{city.count} adresses</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Regions ── */}
      {topRegions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader title="Explorer par région" href="/restaurants" />
          <div className="flex flex-wrap gap-2">
            {topRegions.map((r) => (
              <Link
                key={r.slug}
                href={`/region/${r.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                style={{ background: '#F0FDF4', color: '#2D6A4F', borderColor: '#B7E4C7' }}
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA propriétaire (split) ── */}
      <section className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl rounded-3xl overflow-hidden mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left — dark green */}
          <div className="px-8 py-12 sm:px-12 sm:py-16" style={{ background: '#1B4332' }}>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Vous êtes propriétaire ?
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: '#95D5B2' }}>
              Ajoutez votre restaurant gratuitement et atteignez des milliers de clients vegans et végétariens chaque mois.
            </p>
            <ul className="space-y-3 mb-8">
              {['Inscription gratuite', 'Publié sous 48h', 'Visible sur toute la France'].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: '#D8F3DC' }}>
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/soumettre-un-restaurant"
              className="inline-block font-semibold px-7 py-3.5 rounded-full transition-colors text-white"
              style={{ background: '#F4845F' }}
            >
              Soumettre mon restaurant
            </Link>
          </div>
          {/* Right — image */}
          <div className="relative h-64 lg:h-auto">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #52B788 100%)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white opacity-30">
                <Leaf size={80} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog preview ── */}
      {latestPosts.length > 0 && (
        <section className="py-16 px-4" style={{ background: '#FDF6EC' }}>
          <div className="max-w-7xl mx-auto sm:px-2">
            <SectionHeader title="Du blog" href="/blog" linkLabel="Tous les articles →" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf size={40} className="text-green-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {post.tags?.[0] && (
                      <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {post.tags[0]}
                      </span>
                    )}
                    <h3
                      className="font-semibold text-gray-900 mt-2 mb-1 group-hover:text-green-700 transition-colors line-clamp-2"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                        : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="py-16 px-4" style={{ background: '#081C15' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  className="font-display text-5xl font-bold mb-1 text-white"
                  style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
                >
                  {value}
                </div>
                <div className="text-sm" style={{ color: '#52B788' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
