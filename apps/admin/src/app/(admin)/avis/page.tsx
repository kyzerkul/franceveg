import { getReviews } from '@/lib/api'
import { approveReviewAction, rejectReviewAction } from '@/lib/actions'
import Link from 'next/link'

type Props = { searchParams: Promise<{ page?: string; status?: string }> }

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? '#D4A853' : '#E5E7EB', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #74C69D, #2D6A4F)' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default async function AvisPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const status = sp.status ?? 'pending'

  const result = await getReviews({ page, status }).catch(() => ({ data: [], total: 0, hasNextPage: false }))

  const STATUSES = [
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvés' },
    { value: 'rejected', label: 'Rejetés' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Avis
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{result.total} avis</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        {STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={`/avis?status=${value}`}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={
              status === value
                ? { background: '#1B4332', color: 'white' }
                : { background: 'white', color: '#6B7280', border: '1px solid #E8EEEB' }
            }
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Cards */}
      {result.data.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center text-gray-400"
          style={{ background: 'white', border: '1px solid #E8EEEB' }}
        >
          Aucun avis
        </div>
      ) : (
        <div className="space-y-3">
          {result.data.map((rv) => (
            <div
              key={rv.id}
              className="rounded-2xl p-5"
              style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start gap-3">
                <Avatar name={rv.user?.name ?? 'A'} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <Stars n={rv.rating} />
                    <span className="font-medium text-gray-900 text-sm">{rv.user?.name ?? 'Anonyme'}</span>
                    {rv.restaurant?.name && (
                      <>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-gray-500 text-xs">{rv.restaurant.name}</span>
                      </>
                    )}
                    <span className="text-gray-400 text-xs ml-auto">
                      {new Date(rv.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {rv.title && (
                    <div className="font-semibold text-gray-800 text-sm mb-1">{rv.title}</div>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{rv.content}</p>
                </div>
                {status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <form action={approveReviewAction.bind(null, rv.id)}>
                      <button
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: '#F0FDF4', color: '#40916C' }}
                      >
                        Approuver
                      </button>
                    </form>
                    <form action={rejectReviewAction.bind(null, rv.id)}>
                      <button
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: '#FEF2F2', color: '#EF4444' }}
                      >
                        Rejeter
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || result.hasNextPage) && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/avis?page=${page - 1}&status=${status}`}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: 'white', border: '1px solid #E8EEEB', color: '#374151' }}
            >
              ← Précédent
            </Link>
          )}
          <span className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#40916C' }}>
            {page}
          </span>
          {result.hasNextPage && (
            <Link
              href={`/avis?page=${page + 1}&status=${status}`}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ background: 'white', border: '1px solid #E8EEEB', color: '#374151' }}
            >
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
