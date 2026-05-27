import { notFound } from 'next/navigation'
import { getRestaurant } from '@/lib/api'
import { ReclamerClient } from '@/components/restaurants/ReclamerClient'

type Props = { params: Promise<{ city: string; slug: string }> }

export default async function ReclamerPage({ params }: Props) {
  const { city, slug } = await params
  const r = await getRestaurant(slug, city).catch(() => null)
  if (!r) notFound()
  return (
    <ReclamerClient
      restaurantId={r.id}
      restaurantPageUrl={`/restaurants/${city}/${slug}`}
    />
  )
}
