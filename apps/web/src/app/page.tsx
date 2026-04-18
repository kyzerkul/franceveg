import Link from 'next/link'
import { Search, MapPin, Leaf } from 'lucide-react'
import { getFeaturedRestaurants, getRegions } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'

const TOP_CITIES = [
  { name: 'Paris', slug: 'paris', emoji: '🗼' },
  { name: 'Lyon', slug: 'lyon', emoji: '🦁' },
  { name: 'Marseille', slug: 'marseille', emoji: '⛵' },
  { name: 'Bordeaux', slug: 'bordeaux', emoji: '🍷' },
  { name: 'Nantes', slug: 'nantes', emoji: '🐘' },
  { name: 'Toulouse', slug: 'toulouse', emoji: '🌸' },
  { name: 'Montpellier', slug: 'montpellier', emoji: '☀️' },
  { name: 'Strasbourg', slug: 'strasbourg', emoji: '🥨' },
]

export default async function HomePage() {
  const [featured, regions] = await Promise.all([
    getFeaturedRestaurants().catch(() => []),
    getRegions().catch(() => []),
  ])

  const topRegions = regions.filter((r) => r.type === 'region').slice(0, 6)

  return (
    <main>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Leaf size={14} /> Le guide vegan &amp; végétarien de France
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Les meilleurs restaurants<br />
            <span className="text-green-600">vegan et végétariens</span> en France
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Découvrez des centaines d&apos;adresses vegan, végétariennes et végétalines partout en France. Fiches complètes, avis certifiés, horaires et localisation.
          </p>

          {/* Search bar */}
          <form action="/restaurants" method="GET" className="flex gap-2 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="Restaurant, ville, cuisine..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Chercher
            </button>
          </form>
        </div>
      </section>

      {/* ── Featured restaurants ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Restaurants mis en avant</h2>
            <Link href="/restaurants" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Voir tous →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}

      {/* ── Top cities ── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            <MapPin size={22} className="inline mr-2 text-green-600" />
            Trouvez par ville
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOP_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/ville/${city.slug}`}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl">{city.emoji}</span>
                <span className="font-medium text-gray-800 group-hover:text-green-700 transition-colors">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Regions ── */}
      {topRegions.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Par région</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topRegions.map((r) => (
              <Link
                key={r.slug}
                href={`/region/${r.slug}`}
                className="bg-green-50 hover:bg-green-100 rounded-xl px-4 py-3 text-green-800 font-medium transition-colors"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA soumettre ── */}
      <section className="bg-green-600 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Vous êtes propriétaire ?</h2>
          <p className="text-green-100 mb-6">
            Ajoutez votre restaurant gratuitement et atteignez des milliers de clients vegans et végétariens.
          </p>
          <Link
            href="/soumettre-un-restaurant"
            className="inline-block bg-white text-green-700 font-semibold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            Soumettre mon restaurant
          </Link>
        </div>
      </section>
    </main>
  )
}
