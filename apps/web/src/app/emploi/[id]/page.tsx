import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Briefcase, Clock, ExternalLink } from 'lucide-react'
import { getJob } from '@/lib/api'
import { buildTitle, canonicalUrl, truncate } from '@/lib/seo'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

type Props = { params: Promise<{ id: string }> }

export const revalidate = 1800

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id).catch(() => null)
  if (!job) return {}

  const title = buildTitle([job.title, job.type === 'offer' ? 'Offre d\'emploi' : 'CV'])
  const description = truncate(job.description, 160)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/emploi/${id}`) },
  }
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 30) return `Il y a ${days} jours`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function EmploiDetailPage({ params }: Props) {
  const { id } = await params
  const job = await getJob(id).catch(() => null)
  if (!job) notFound()

  const isOffer = job.type === 'offer'

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <Breadcrumb
            light
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Emploi', href: '/emploi' },
              { label: job.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2 mt-4 mb-3">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium border ${
                isOffer
                  ? 'bg-blue-100/20 text-blue-200 border-blue-300/30'
                  : 'bg-purple-100/20 text-purple-200 border-purple-300/30'
              }`}
            >
              {isOffer ? "Offre d'emploi" : "Recherche d'emploi (CV)"}
            </span>
            {job.contract_type && (
              <span
                className="text-sm px-3 py-1 rounded-full border"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                {job.contract_type}
              </span>
            )}
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#86EFAC' }}>
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Publié {timeAgo(job.created_at)}
            </span>
            {job.expires_at && (
              <span className="flex items-center gap-1.5 text-orange-300">
                <Clock size={14} />
                Expire le {new Date(job.expires_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Description
              </h2>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Restaurant */}
            {job.restaurant && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Restaurant</h3>
                {job.restaurant.cover_image && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3">
                    <Image
                      src={job.restaurant.cover_image}
                      alt={job.restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                  {job.restaurant.name}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={13} />{job.restaurant.city}
                </p>
                <Link
                  href={`/restaurants/${job.restaurant.slug}`}
                  className="mt-3 flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                  style={{ color: '#40916C' }}
                >
                  Voir la fiche <ExternalLink size={13} />
                </Link>
              </div>
            )}

            {/* Publisher */}
            {job.user.name && (
              <div className="rounded-2xl p-4 text-sm" style={{ background: '#FDF6EC' }}>
                <span className="font-medium text-gray-700">Publié par :</span>
                <span className="text-gray-600 ml-1">{job.user.name}</span>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl p-5 text-white text-center" style={{ background: '#1B4332' }}>
              <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center mx-auto mb-3">
                <Briefcase size={18} className="text-green-300" />
              </div>
              <p className="font-semibold mb-1 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                {isOffer ? 'Cette offre vous intéresse ?' : 'Ce profil vous intéresse ?'}
              </p>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: '#86EFAC' }}>
                Contactez directement le propriétaire de cette annonce.
              </p>
              <Link
                href="/emploi/proposer"
                className="block bg-white font-semibold py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
                style={{ color: '#1B4332' }}
              >
                Déposer ma propre annonce
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
