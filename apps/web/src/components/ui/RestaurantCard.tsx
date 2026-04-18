import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import type { RestaurantCard as R } from '@/lib/api'

function priceRange(n: number | null) {
  return n ? '€'.repeat(n) : ''
}

export function RestaurantCard({ r }: { r: R }) {
  const reviewCount = r.reviews_count?.[0]?.count ?? 0

  return (
    <Link
      href={`/restaurants/${r.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-48 bg-gray-100">
        {r.cover_image ? (
          <Image
            src={r.cover_image}
            alt={r.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <span className="text-5xl">🌿</span>
          </div>
        )}
        {r.is_featured && (
          <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Mis en avant
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
            {r.name}
          </h3>
          <span className="text-sm text-gray-500 shrink-0">{priceRange(r.price_range)}</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={13} className="shrink-0" />
          <span>{r.city}</span>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <Star size={13} fill="currentColor" />
            <span className="text-gray-600">{reviewCount} avis</span>
          </div>
        )}

        {r.short_description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-auto">{r.short_description}</p>
        )}

        {r.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {r.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
