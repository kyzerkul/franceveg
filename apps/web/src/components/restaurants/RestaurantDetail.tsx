import Link from 'next/link'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { MapPin, Phone, Globe, Clock, Star, Navigation } from 'lucide-react'
import type { RestaurantDetail as Restaurant } from '@/lib/api'
import { restaurantJsonLd, breadcrumbJsonLd, restaurantUrl, SITE_URL } from '@/lib/seo'
import { buildFaqItems } from '@/lib/faq'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Stars } from '@/components/ui/Stars'

const DAY_FR: Record<string, string> = {
  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
  vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim',
}
const DAY_ORDER = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

function isOpenNow(hours: Restaurant['opening_hours']): { open: boolean; label: string } {
  if (!hours) return { open: false, label: 'Horaires non disponibles' }
  const now = new Date()
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const today = days[now.getDay()]
  const todayHours = hours[today]
  if (!todayHours) return { open: false, label: 'Fermé aujourd\'hui' }
  const [openH, openM] = todayHours.open.split(':').map(Number)
  const [closeH, closeM] = todayHours.close.split(':').map(Number)
  const current = now.getHours() * 60 + now.getMinutes()
  const openTime = openH * 60 + openM
  const closeTime = closeH * 60 + closeM
  if (current >= openTime && current < closeTime) {
    return { open: true, label: `Ferme à ${todayHours.close}` }
  }
  return { open: false, label: `Ouvre à ${todayHours.open}` }
}

export function RestaurantDetail({ r }: { r: Restaurant }) {
  const avgRating = r.reviews.length
    ? r.reviews.reduce((s, rv) => s + rv.rating, 0) / r.reviews.length
    : null

  const url = restaurantUrl({ slug: r.slug, city: r.city, region: r.region })
  const cityUrl = `/ville/${r.region?.slug ?? r.city.toLowerCase()}`
  const status = isOpenNow(r.opening_hours)

  const jsonLd = restaurantJsonLd({ ...r, reviews: r.reviews })
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Accueil', url: SITE_URL },
    { name: 'Restaurants', url: `${SITE_URL}/restaurants` },
    { name: r.city, url: `${SITE_URL}${cityUrl}` },
    { name: r.name, url: `${SITE_URL}${url}` },
  ])

  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: r.reviews.filter((rv) => rv.rating === n).length,
  }))

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${r.address}, ${r.zip_code} ${r.city}`)}`
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(`${r.address}, ${r.city}`)}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Restaurants', href: '/restaurants' },
          { label: r.city, href: cityUrl },
          { label: r.name },
        ]} />
      </div>

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden">
        <ImageWithFallback src={r.cover_image} alt={r.name} fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />

        {r.is_featured && (
          <span
            className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: '#D4A853' }}
          >
            <Star size={11} fill="white" stroke="white" />
            Mis en avant
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 max-w-7xl mx-auto">
          <h1
            className="text-3xl sm:text-5xl font-bold text-white mb-2 leading-tight"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
          >
            {r.name}
          </h1>
          {avgRating && (
            <div className="flex items-center gap-3">
              <Stars rating={avgRating} size="md" />
              <span className="text-white/80 text-sm">{avgRating.toFixed(1)} · {r.reviews.length} avis</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-white/70 text-sm">
            <MapPin size={13} />
            {r.city}
          </div>
        </div>
      </div>

      {/* Sticky mini info bar */}
      <div
        className="sticky z-40 px-4 py-3"
        style={{
          top: '64px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #F3F4F6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto text-sm">
          {r.cuisine_types[0] && (
            <span className="text-gray-600 shrink-0">{r.cuisine_types[0]}</span>
          )}
          {r.price_range && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-600 shrink-0">{'€'.repeat(r.price_range)}</span>
            </>
          )}
          <span className="text-gray-300">·</span>
          <span
            className={`flex items-center gap-1.5 shrink-0 font-medium ${status.open ? 'text-green-600' : 'text-red-500'}`}
          >
            <span className={`w-2 h-2 rounded-full ${status.open ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
            {status.open ? 'Ouvert' : 'Fermé'} · {status.label}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                À propos
              </h2>
              {r.description ? (
                <p className="text-gray-600 leading-relaxed text-base">{r.description}</p>
              ) : r.short_description ? (
                <p className="text-gray-600 leading-relaxed text-base">{r.short_description}</p>
              ) : (
                <p className="text-gray-400 leading-relaxed text-base italic">
                  Aucune description disponible pour ce restaurant.{' '}
                  <Link href={`${url}/reclamer`} className="text-green-600 not-italic underline hover:text-green-700">
                    Vous êtes propriétaire ? Enrichissez cette fiche.
                  </Link>
                </p>
              )}
            </section>

            {/* Gallery */}
            {r.images.length > 1 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {r.images.slice(1, 7).map((img, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
                      <ImageWithFallback
                        src={img}
                        alt={`${r.name} photo ${i + 2}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {(() => {
              const faqItems = buildFaqItems(r.tags, r.name, 5)
              if (faqItems.length === 0) return null
              return (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                    Questions fréquentes
                  </h2>
                  <div className="space-y-3">
                    {faqItems.map(({ question, answer }, i) => (
                      <details
                        key={i}
                        className="group rounded-2xl border border-gray-100 overflow-hidden"
                        style={{ background: '#fff' }}
                      >
                        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm list-none">
                          {question}
                          <span className="ml-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180">
                            ▾
                          </span>
                        </summary>
                        <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                          {answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )
            })()}

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                Avis ({r.reviews.length})
              </h2>

              {/* Rating summary */}
              {avgRating && r.reviews.length > 0 && (
                <div className="flex items-center gap-8 mb-6 p-5 rounded-2xl border border-gray-100" style={{ background: '#FAFAFA' }}>
                  <div className="text-center shrink-0">
                    <div
                      className="text-5xl font-bold mb-1"
                      style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#40916C' }}
                    >
                      {avgRating.toFixed(1)}
                    </div>
                    <Stars rating={avgRating} size="sm" />
                    <p className="text-xs text-gray-400 mt-1">{r.reviews.length} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingDist.map(({ n, count }) => (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-3 text-right">{n}</span>
                        <Star size={10} fill="#D4A853" stroke="#D4A853" />
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: r.reviews.length ? `${(count / r.reviews.length) * 100}%` : '0%',
                              background: '#F4845F',
                            }}
                          />
                        </div>
                        <span className="text-gray-400 w-4">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review cards */}
              {r.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm mb-6">Aucun avis pour l&apos;instant. Soyez le premier !</p>
              ) : (
                <div className="space-y-4 mb-8">
                  {r.reviews.slice(0, 5).map((rv) => {
                    const initials = (rv.user.name ?? 'A').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                    const colors = ['#40916C', '#F4845F', '#D4A853', '#74C69D', '#E05B35']
                    const color = colors[(rv.user.name ?? '').charCodeAt(0) % colors.length]
                    return (
                      <div key={rv.id} className="rounded-2xl border border-gray-100 p-5" style={{ background: '#fff' }}>
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: color }}
                          >
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800 text-sm">{rv.user.name ?? 'Anonyme'}</span>
                              <span className="text-xs text-gray-400">
                                {rv.visit_date ?? new Date(rv.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <Stars rating={rv.rating} size="sm" />
                          </div>
                        </div>
                        {rv.title && <p className="font-semibold text-gray-800 text-sm mb-1">{rv.title}</p>}
                        <p className="text-sm text-gray-600 line-clamp-4">{rv.content}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Review form */}
              <div className="rounded-2xl p-6" style={{ background: '#F0FDF4' }}>
                <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Partagez votre expérience
                </h3>
                <ReviewForm restaurantId={r.id} />
              </div>
            </section>

          </div>

          {/* ── Sidebar ── */}
          <aside>
            <div
              className="rounded-2xl border border-gray-100 p-5 space-y-5 sticky"
              style={{ top: '110px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
            >
              {/* Open status */}
              <div>
                <div className={`flex items-center gap-2 font-semibold text-sm ${status.open ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${status.open ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                  {status.open ? 'Ouvert maintenant' : 'Fermé'}
                </div>
                {status.label && (
                  <p className="text-xs text-gray-400 mt-0.5 ml-4">{status.label}</p>
                )}
              </div>

              {/* Hours */}
              {r.opening_hours && Object.keys(r.opening_hours).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <Clock size={13} />
                    Horaires
                  </div>
                  <div className="space-y-1">
                    {DAY_ORDER.filter((d) => r.opening_hours?.[d]).map((day) => {
                      const h = r.opening_hours![day]
                      return (
                        <div key={day} className="flex justify-between text-xs">
                          <span className="text-gray-500 capitalize">{DAY_FR[day] ?? day}</span>
                          <span className="text-gray-700 font-medium">
                            {h ? `${h.open}–${h.close}` : 'Fermé'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tags + cuisine */}
              {(r.tags.length > 0 || r.cuisine_types.length > 0) && (
                <div className="space-y-2">
                  {r.cuisine_types.length > 0 && (
                    <p className="text-xs text-gray-500">{r.cuisine_types.join(', ')}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {r.price_range && (
                    <p className="text-xs text-gray-500">Prix : {'€'.repeat(r.price_range)}</p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100" />

              {/* Map placeholder */}
              <div
                className="rounded-xl overflow-hidden flex items-center justify-center"
                style={{ height: '160px', background: 'linear-gradient(135deg, #D8F3DC, #B7E4C7)' }}
              >
                <div className="text-center">
                  <MapPin size={28} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-700 font-medium">{r.city}</p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="space-y-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ background: '#40916C' }}
                >
                  <Navigation size={15} />
                  Y aller (Google Maps)
                </a>
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB', color: '#4B5563' }}
                >
                  Ouvrir dans Waze
                </a>
              </div>

              <div className="border-t border-gray-100" />

              <Link
                href={`${url}/reclamer`}
                className="block text-center text-xs text-gray-400 hover:text-green-600 transition-colors"
              >
                Vous êtes propriétaire ?
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Contact section (BOTTOM ONLY) ── */}
      <div style={{ background: '#FAF3E0', borderTop: '2px solid #D8F3DC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-lg font-semibold text-gray-600 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            Informations pratiques
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Address */}
            {r.address && (
              <div className="flex gap-3">
                <MapPin size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Adresse</p>
                  <p className="text-sm text-gray-500">{r.address}</p>
                  <p className="text-sm text-gray-500">{r.zip_code} {r.city}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {r.phone && (
              <div className="flex gap-3">
                <Phone size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Téléphone</p>
                  <a href={`tel:${r.phone}`} className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                    {r.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {r.website && (
              <div className="flex gap-3">
                <Globe size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Site web</p>
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-green-600 transition-colors truncate block max-w-xs"
                  >
                    Visiter le site <span className="text-gray-300 text-xs">(quitte France Veg)</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Reserve / Order (discrete) */}
          {r.website && (
            <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex flex-wrap gap-3">
              <a
                href={r.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors hover:border-green-400 hover:text-green-700"
                style={{ borderColor: '#D4A8AC', color: '#6B7280' }}
              >
                <Globe size={14} />
                Site web du restaurant
              </a>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors hover:border-orange-300 hover:text-orange-600"
                style={{ borderColor: '#FCDCCC', color: '#9CA3AF' }}>
                Réserver / Commander
              </button>
            </div>
          )}

          <p className="text-xs text-gray-300 mt-6">
            <Link href="#" className="hover:text-gray-400">Signaler une erreur sur cette fiche</Link>
          </p>
        </div>
      </div>
    </>
  )
}
