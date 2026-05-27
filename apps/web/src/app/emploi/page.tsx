import type { Metadata } from 'next'
import Link from 'next/link'
import { getJobs } from '@/lib/api'
import { buildTitle, canonicalUrl } from '@/lib/seo'
import { Briefcase, MapPin, Clock, PlusCircle, Search } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

type SearchParams = Promise<{ type?: string; location?: string; contract_type?: string; page?: string }>

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: buildTitle(['Offres d\'emploi vegan & végétarien']),
    description: 'Trouvez un emploi dans un restaurant vegan ou végétarien en France. CDI, CDD, temps partiel.',
    alternates: { canonical: canonicalUrl('/emploi') },
  }
}

const CONTRACT_TYPES = ['CDI', 'CDD', 'Temps partiel', 'Stage', 'Alternance', 'Freelance']

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 30) return `Il y a ${days} j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default async function EmploiPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const type = sp.type as 'offer' | 'cv' | undefined

  const result = await getJobs({
    page, limit: 20,
    type: sp.type,
    location: sp.location,
    contract_type: sp.contract_type,
  }).catch(() => ({ data: [], total: 0, page: 1, limit: 20, hasNextPage: false }))

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <Breadcrumb light items={[{ label: 'Accueil', href: '/' }, { label: 'Emploi' }]} />
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-2">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Emploi vegan &amp; végétarien
              </h1>
              <p className="text-sm" style={{ color: '#86EFAC' }}>
                {result.total} annonce{result.total > 1 ? 's' : ''} · Offres &amp; recherches d&apos;emploi
              </p>
            </div>
            <Link
              href="/emploi/proposer"
              className="flex items-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm text-white transition-colors shrink-0"
              style={{ background: '#F4845F' }}
            >
              <PlusCircle size={16} />
              Déposer une annonce
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div
          className="rounded-2xl p-4 mb-8"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}
        >
          <form method="GET" className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1.5">
              {[
                { label: 'Tout', value: '' },
                { label: 'Offres', value: 'offer' },
                { label: 'CVs', value: 'cv' },
              ].map(({ label, value }) => (
                <Link
                  key={value}
                  href={value ? `/emploi?type=${value}` : '/emploi'}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    (value === '' && !type) || type === value
                      ? 'text-white border-transparent'
                      : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                  }`}
                  style={(value === '' && !type) || type === value ? { background: '#40916C' } : {}}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="relative flex-1 min-w-36">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="location"
                defaultValue={sp.location}
                placeholder="Ville..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              />
            </div>
            <select
              name="contract_type"
              defaultValue={sp.contract_type}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            >
              <option value="">Tous contrats</option>
              {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#1B4332' }}
            >
              <Search size={14} />
              Filtrer
            </button>
          </form>
        </div>

        {/* Listing */}
        {result.data.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 mb-4">Aucune annonce pour l&apos;instant.</p>
            <Link
              href="/emploi/proposer"
              className="inline-flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-xl"
              style={{ background: '#40916C' }}
            >
              <PlusCircle size={15} />
              Déposer la première annonce
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {result.data.map((job) => (
              <Link
                key={job.id}
                href={`/emploi/${job.id}`}
                className="group flex items-center gap-4 bg-white rounded-2xl p-4 transition-all hover:shadow-md hover:border-green-100"
                style={{ border: '1px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {job.restaurant?.cover_image ? (
                  <img
                    src={job.restaurant.cover_image}
                    alt={job.restaurant.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Briefcase size={18} className="text-green-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.type === 'offer' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {job.type === 'offer' ? 'Offre' : 'CV'}
                    </span>
                    {job.contract_type && (
                      <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                        {job.contract_type}
                      </span>
                    )}
                  </div>
                  <h2
                    className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {job.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {job.restaurant && <span className="truncate">{job.restaurant.name}</span>}
                    {job.location && (
                      <span className="flex items-center gap-0.5 shrink-0">
                        <MapPin size={11} />{job.location}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Clock size={11} />{timeAgo(job.created_at)}
                    </span>
                  </div>
                </div>

                <span
                  className="text-sm font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#40916C' }}
                >
                  Voir →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || result.hasNextPage) && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/emploi?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v)), page: String(page - 1) })}`}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              >
                ← Précédent
              </Link>
            )}
            <span className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#40916C' }}>
              {page}
            </span>
            {result.hasNextPage && (
              <Link
                href={`/emploi?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v)), page: String(page + 1) })}`}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              >
                Suivant →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
