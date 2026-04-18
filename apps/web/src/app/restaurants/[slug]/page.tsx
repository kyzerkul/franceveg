import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, Clock, Star, ChevronRight } from 'lucide-react'
import { getRestaurant, getRestaurantSlugs } from '@/lib/api'
import { buildTitle, truncate, canonicalUrl, restaurantJsonLd, breadcrumbJsonLd, SITE_URL } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getRestaurantSlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const r = await getRestaurant(slug).catch(() => null)
  if (!r) return {}

  const title = r.seo_title ?? buildTitle([r.name, r.city])
  const description = r.seo_description ?? truncate(
    `${r.name} — restaurant ${r.tags.join(', ')} à ${r.city}. ${r.short_description ?? ''}`,
  )

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/restaurants/${slug}`) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(`/restaurants/${slug}`),
      images: r.cover_image ? [{ url: r.cover_image, alt: r.name }] : [],
    },
  }
}

const DAY_FR: Record<string, string> = {
  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
  vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  )
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params
  const r = await getRestaurant(slug).catch(() => null)
  if (!r) notFound()

  const avgRating = r.reviews.length
    ? r.reviews.reduce((s, rv) => s + rv.rating, 0) / r.reviews.length
    : null

  const jsonLd = restaurantJsonLd({ ...r, reviews: r.reviews })
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Accueil', url: SITE_URL },
    { name: 'Restaurants', url: `${SITE_URL}/restaurants` },
    { name: r.city, url: `${SITE_URL}/ville/${r.region?.slug ?? r.city.toLowerCase()}` },
    { name: r.name, url: `${SITE_URL}/restaurants/${slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-green-600">Accueil</Link>
          <ChevronRight size={14} />
          <Link href="/restaurants" className="hover:text-green-600">Restaurants</Link>
          <ChevronRight size={14} />
          <Link href={`/ville/${r.region?.slug ?? r.city.toLowerCase()}`} className="hover:text-green-600">{r.city}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600 truncate">{r.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover image */}
            {r.cover_image && (
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
                <Image src={r.cover_image} alt={r.name} fill className="object-cover" priority />
              </div>
            )}

            {/* Title + tags */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {r.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{tag}</span>
                ))}
                {r.is_featured && (
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-medium">★ Mis en avant</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{r.name}</h1>
              {avgRating && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-sm text-gray-500">{avgRating.toFixed(1)} · {r.reviews.length} avis</span>
                </div>
              )}
            </div>

            {/* Description */}
            {r.description && (
              <div className="prose prose-green max-w-none text-gray-600">
                <p>{r.description}</p>
              </div>
            )}

            {/* Images gallery */}
            {r.images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {r.images.slice(1, 7).map((img, i) => (
                  <div key={i} className="relative h-32 rounded-xl overflow-hidden">
                    <Image src={img} alt={`${r.name} photo ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Avis ({r.reviews.length})</h2>
              {r.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun avis pour l&apos;instant. Soyez le premier !</p>
              ) : (
                <div className="space-y-4">
                  {r.reviews.slice(0, 5).map((rv) => (
                    <div key={rv.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StarRating rating={rv.rating} />
                          <span className="font-medium text-sm text-gray-700">{rv.user.name ?? 'Anonyme'}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {rv.visit_date ?? new Date(rv.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {rv.title && <p className="font-medium text-gray-800 mb-1">{rv.title}</p>}
                      <p className="text-sm text-gray-600">{rv.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right — info card */}
          <aside className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-4 space-y-4">
              {/* Price range + cuisine */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{r.cuisine_types.join(', ')}</span>
                <span className="font-medium text-gray-700">{'€'.repeat(r.price_range ?? 1)}</span>
              </div>

              {/* Address */}
              <div className="flex gap-2 text-sm text-gray-600">
                <MapPin size={16} className="mt-0.5 shrink-0 text-green-600" />
                <div>
                  <p>{r.address}</p>
                  <p>{r.zip_code} {r.city}</p>
                </div>
              </div>

              {/* Phone */}
              {r.phone && (
                <a href={`tel:${r.phone}`} className="flex gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                  <Phone size={16} className="mt-0.5 shrink-0 text-green-600" />
                  {r.phone}
                </a>
              )}

              {/* Website */}
              {r.website && (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 text-sm text-green-600 hover:underline"
                >
                  <Globe size={16} className="mt-0.5 shrink-0" />
                  Visiter le site web
                </a>
              )}

              {/* Opening hours */}
              {r.opening_hours && Object.keys(r.opening_hours).length > 0 && (
                <div>
                  <div className="flex gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="mt-0.5 text-green-600" />
                    Horaires
                  </div>
                  <div className="space-y-1">
                    {Object.entries(r.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-xs text-gray-500">
                        <span className="capitalize">{DAY_FR[day] ?? day}</span>
                        <span>{hours ? `${hours.open} – ${hours.close}` : 'Fermé'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-2 space-y-2">
                {r.website && (
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    Réserver / Commander
                  </a>
                )}
                <Link
                  href={`/restaurants/${slug}/reclamer`}
                  className="block w-full text-center border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Vous êtes le propriétaire ?
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
