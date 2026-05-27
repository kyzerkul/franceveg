import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { buildTitle, canonicalUrl } from '@/lib/seo'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

type SearchParams = Promise<{ search?: string; city?: string; tags?: string; page?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const city = sp.city ? ` à ${sp.city}` : ' en France'
  return {
    title: buildTitle([`Restaurants vegan et végétariens${city}`]),
    description: `Trouvez les meilleurs restaurants vegan et végétariens${city}. Filtrez par ville, type de cuisine et budget.`,
    alternates: { canonical: canonicalUrl('/restaurants') },
  }
}

const QUICK_TAGS = ['vegan', 'végétarien', 'végétalien', 'sans gluten', 'bio', 'fait maison', 'brunch', 'livraison']

export default async function RestaurantsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const result = await getRestaurants({
    search: sp.search,
    city: sp.city,
    tags: sp.tags,
    page,
    limit: 18,
  }).catch(() => ({ data: [], total: 0, page: 1, limit: 18, hasNextPage: false }))

  const cityLabel = sp.city ? ` à ${sp.city}` : ' en France'

  return (
    <>
      {/* Mini hero */}
      <section className="py-12 px-4" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #fff 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Restaurants vegan &amp; végétariens{cityLabel}
          </h1>
          <p className="font-semibold" style={{ color: '#40916C' }}>
            {result.total > 0 ? `${result.total} adresses trouvées` : 'Aucun résultat'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Sticky filter bar */}
        <div
          className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mb-8"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F3F4F6' }}
        >
          <form method="GET" className="flex flex-col gap-3">
            {/* Row 1: search + city + button */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="search"
                  defaultValue={sp.search}
                  placeholder="Rechercher un restaurant..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </div>
              <div className="relative w-full sm:w-44">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="city"
                  defaultValue={sp.city}
                  placeholder="Ville..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ background: '#40916C' }}
                >
                  <SlidersHorizontal size={14} />
                  Filtrer
                </button>
                {(sp.search || sp.city || sp.tags) && (
                  <Link
                    href="/restaurants"
                    className="px-4 py-2.5 rounded-xl border text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    ✕
                  </Link>
                )}
              </div>
            </div>

            {/* Row 2: tag chips */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {QUICK_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={sp.tags === tag ? '/restaurants' : `/restaurants?tags=${encodeURIComponent(tag)}`}
                  className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                    sp.tags === tag
                      ? 'text-white border-transparent'
                      : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
                  }`}
                  style={sp.tags === tag ? { background: '#40916C', borderColor: '#40916C' } : {}}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </form>
        </div>

        {/* Results grid */}
        {result.data.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-lg font-medium text-gray-700 mb-2">Aucun restaurant trouvé</p>
            <p className="text-gray-400 mb-6 text-sm">Essayez d'autres critères de recherche</p>
            <Link href="/restaurants" className="text-sm font-medium text-green-600 hover:underline">
              Voir tous les restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || result.hasNextPage) && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/restaurants?${new URLSearchParams({ ...(sp.search ? { search: sp.search } : {}), ...(sp.city ? { city: sp.city } : {}), ...(sp.tags ? { tags: sp.tags } : {}), page: String(page - 1) })}`}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              >
                ← Précédent
              </Link>
            )}
            <span className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#40916C' }}>
              {page}
            </span>
            {result.hasNextPage && (
              <Link
                href={`/restaurants?${new URLSearchParams({ ...(sp.search ? { search: sp.search } : {}), ...(sp.city ? { city: sp.city } : {}), ...(sp.tags ? { tags: sp.tags } : {}), page: String(page + 1) })}`}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              >
                Suivant →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
