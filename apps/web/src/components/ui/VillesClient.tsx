'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CityItem } from '@/lib/api'

export function VillesClient({ cities }: { cities: CityItem[] }) {
  const [sort, setSort] = useState<'count' | 'alpha'>('count')

  const sorted = [...cities].sort((a, b) =>
    sort === 'count'
      ? b.total_restaurants - a.total_restaurants
      : a.name.localeCompare(b.name, 'fr'),
  )

  const paris = sorted.find((c) => c.slug === 'paris')
  const others = sorted.filter((c) => c.slug !== 'paris')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Sort controls */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm text-gray-500 font-medium">Trier par :</span>
        <button
          onClick={() => setSort('count')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            sort === 'count'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
          }`}
        >
          Nombre de restaurants
        </button>
        <button
          onClick={() => setSort('alpha')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            sort === 'alpha'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
          }`}
        >
          Alphabétique
        </button>
      </div>

      {/* Paris featured card */}
      {paris && (
        <div className="mb-8">
          <Link
            href={`/ville/${paris.slug}`}
            className="group flex items-center gap-6 rounded-2xl bg-white border border-green-200 p-6 hover:shadow-lg transition-all"
            style={{ boxShadow: '0 4px 16px rgba(45,106,79,0.1)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'linear-gradient(135deg, #D8F3DC, #B7E4C7)' }}
            >
              🗼
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                  {paris.name}
                </p>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: '#D4A853', color: '#fff' }}
                >
                  ★ Top ville
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {paris.total_restaurants} restaurants vegan et végétariens
              </p>
            </div>
            <span className="text-green-600 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
        </div>
      )}

      {/* Other cities grid */}
      {others.length === 0 && !paris ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-gray-400">Aucune ville disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {others.map((city) => (
            <Link
              key={city.id}
              href={`/ville/${city.slug}`}
              className="group rounded-2xl bg-white border border-gray-100 p-5 hover:border-green-200 hover:shadow-md transition-all"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{ background: '#D8F3DC' }}
              >
                🌿
              </div>
              <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                {city.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {city.total_restaurants} restaurant{city.total_restaurants > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
