'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RestaurantCard } from '@/components/ui/RestaurantCard'
import { CityMapWrapper } from '@/components/ui/CityMapWrapper'
import { MapPin } from 'lucide-react'
import type { RestaurantCard as Restaurant, RegionDetail } from '@/lib/api'

const NEARBY_CITIES = ['paris', 'lyon', 'marseille', 'bordeaux', 'nantes', 'toulouse', 'lille', 'nice', 'strasbourg', 'montpellier']

export function VilleCityContent({
  region,
  children,
  restaurants,
  total,
  slug,
}: {
  region: RegionDetail['region']
  children: RegionDetail['children']
  restaurants: Restaurant[]
  total: number
  slug: string
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const isParisCity = slug === 'paris'
  const arrondissements = isParisCity ? children.filter((c) => c.type === 'arrondissement') : []

  const allTags = [...new Set(restaurants.flatMap((r) => r.tags))].slice(0, 20)

  const filtered = activeTag
    ? restaurants.filter((r) => r.tags.includes(activeTag))
    : restaurants

  const nearbyCities = NEARBY_CITIES.filter((c) => c !== slug).slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-8 items-start">

      {/* ── LEFT COLUMN: Map + Tags + Other cities ── */}
      <div className="lg:sticky lg:top-20 space-y-5">

        {/* Map */}
        <div
          className="rounded-2xl overflow-hidden border border-gray-100"
          style={{ height: '380px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
        >
          <CityMapWrapper restaurants={filtered.length > 0 ? filtered : restaurants} citySlug={slug} cityName={region.name} />
        </div>

        {/* SEO description */}
        {region.seo_description && (
          <div className="rounded-2xl p-5 text-gray-600 text-sm leading-relaxed" style={{ background: '#FDF6EC' }}>
            {region.seo_description}
          </div>
        )}

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#40916C' }} />
              Filtrer par tag
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                >
                  ✕ Tout voir
                </button>
              )}
              {allTags.map((tag) => {
                const isActive = activeTag === tag
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all border"
                    style={{
                      background: isActive ? '#2D6A4F' : '#F0FDF4',
                      color: isActive ? '#fff' : '#2D6A4F',
                      borderColor: isActive ? '#2D6A4F' : '#B7E4C7',
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Other cities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#40916C' }} />
            Explorer d&apos;autres villes
          </h3>
          <div className="flex flex-wrap gap-2">
            {nearbyCities.map((city) => (
              <Link
                key={city}
                href={`/ville/${city}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors hover:bg-gray-100"
                style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}
              >
                {city.charAt(0).toUpperCase() + city.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Restaurant cards ── */}
      <div>
        {/* Paris arrondissements */}
        {arrondissements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <MapPin size={15} className="text-green-600" />
              Par arrondissement
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
              {arrondissements.map((arr) => (
                <Link
                  key={arr.slug}
                  href={`/ville/${arr.slug}`}
                  className="bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1.5 rounded-xl text-xs text-center font-medium transition-colors border border-green-100"
                >
                  {arr.name.replace('Paris ', '')}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section title */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {activeTag ? (
              <>
                <span className="text-green-700">{filtered.length}</span> restaurant{filtered.length > 1 ? 's' : ''}{' '}
                <span className="text-base font-normal text-gray-500">· {activeTag}</span>
              </>
            ) : (
              <>{total} restaurant{total > 1 ? 's' : ''}</>
            )}
          </h2>
          {total > 50 && !activeTag && (
            <Link href={`/restaurants?city=${region.name}`} className="text-sm font-medium text-green-600 hover:text-green-700">
              Voir tous →
            </Link>
          )}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🌿</div>
            <p className="text-gray-400 text-sm">Aucun restaurant avec ce tag.</p>
            <button onClick={() => setActiveTag(null)} className="mt-3 text-sm text-green-600 hover:underline">
              Voir tous les restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
