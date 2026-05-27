import Link from 'next/link'
import { MapPin, Star, ArrowRight } from 'lucide-react'
import type { RestaurantCard as R } from '@/lib/api'
import { restaurantUrl } from '@/lib/seo'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

function priceRange(n: number | null) {
  if (!n) return null
  return <span className="text-sm text-gray-400 shrink-0">{'€'.repeat(n)}</span>
}

export function RestaurantCard({ r }: { r: R }) {
  const reviewCount = r.reviews_count?.[0]?.count ?? 0

  return (
    <Link
      href={restaurantUrl(r)}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white card-hover"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <ImageWithFallback
          src={r.cover_image}
          alt={r.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Badges */}
        {r.is_featured && (
          <span
            className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: '#D4A853' }}
          >
            <Star size={10} fill="white" />
            Mis en avant
          </span>
        )}
        {r.tags.length > 0 && (
          <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
            {r.tags[0]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {r.name}
          </h3>
          {priceRange(r.price_range)}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin size={13} className="text-green-500 shrink-0" />
          <span>{r.city}</span>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star size={13} className="shrink-0" fill="#D4A853" stroke="#D4A853" />
            <span className="text-gray-600 font-medium">{reviewCount}</span>
            <span className="text-gray-400">avis</span>
          </div>
        )}

        {r.tags.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {r.tags.slice(1, 4).map((tag) => (
              <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {r.cuisine_types?.[0] ?? ''}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Voir la fiche
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}
