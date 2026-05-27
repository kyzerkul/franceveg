'use client'

import dynamic from 'next/dynamic'
import type { RestaurantCard } from '@/lib/api'

const CityMapInner = dynamic(
  () => import('./CityMap').then((m) => m.CityMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '380px',
          background: 'linear-gradient(135deg, #D8F3DC, #B7E4C7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#2D6A4F', fontSize: '13px', fontWeight: 500 }}>Chargement de la carte…</span>
      </div>
    ),
  },
)

export function CityMapWrapper(props: {
  restaurants: RestaurantCard[]
  citySlug: string
  cityName: string
}) {
  return <CityMapInner {...props} />
}
