import { Star } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<Size, number> = { sm: 12, md: 16, lg: 20 }

export function Stars({ rating, size = 'md', showValue = false, count }: {
  rating: number
  size?: Size
  showValue?: boolean
  count?: number
}) {
  const px = SIZE_MAP[size]
  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={px}
            fill={i < full ? '#D4A853' : i === full && hasHalf ? '#D4A853' : '#E5E7EB'}
            stroke={i < full ? '#D4A853' : i === full && hasHalf ? '#D4A853' : '#E5E7EB'}
            style={{ opacity: i === full && hasHalf ? 0.6 : 1 }}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 ml-0.5">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-sm text-gray-400">({count})</span>
      )}
    </div>
  )
}
