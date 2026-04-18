import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/api'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { buildTitle, canonicalUrl } from '@/lib/seo'
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

  const TAGS = ['vegan', 'végétarien', 'végétalien', 'sans gluten', 'bio', 'fait maison']

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Restaurants vegan &amp; végétariens{sp.city ? ` à ${sp.city}` : ' en France'}
      </h1>
      <p className="text-gray-500 mb-8">{result.total} adresses trouvées</p>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-8">
        <input
          name="search"
          defaultValue={sp.search}
          placeholder="Rechercher..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          name="city"
          defaultValue={sp.city}
          placeholder="Ville..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
          Filtrer
        </button>
        {(sp.search || sp.city || sp.tags) && (
          <Link href="/restaurants" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Réinitialiser
          </Link>
        )}
      </form>

      {/* Quick tag filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/restaurants?tags=${tag}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              sp.tags === tag
                ? 'bg-green-600 text-white border-green-600'
                : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {result.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun restaurant trouvé.</p>
          <Link href="/restaurants" className="mt-4 inline-block text-green-600 hover:underline">
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
        <div className="flex justify-center gap-3 mt-12">
          {page > 1 && (
            <Link
              href={`/restaurants?${new URLSearchParams({ ...sp, page: String(page - 1) })}`}
              className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              ← Précédent
            </Link>
          )}
          {result.hasNextPage && (
            <Link
              href={`/restaurants?${new URLSearchParams({ ...sp, page: String(page + 1) })}`}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
