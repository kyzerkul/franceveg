import { notFound } from 'next/navigation'
import { getRestaurant } from '@/lib/api'
import { ReclamerClient } from '@/components/restaurants/ReclamerClient'

type Props = { params: Promise<{ arr: string; slug: string }> }

export default async function ReclamerPage({ params }: Props) {
  const { arr, slug } = await params
  const r = await getRestaurant(slug, `paris-${arr}`).catch(() => null)
  if (!r) notFound()
  return (
    <ReclamerClient
      restaurantId={r.id}
      restaurantPageUrl={`/restaurants/paris/${arr}/${slug}`}
    />
  )
}
