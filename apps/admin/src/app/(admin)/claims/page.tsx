import { getClaims } from '@/lib/api'
import { approveClaimAction, rejectClaimAction } from '@/lib/actions'
import Link from 'next/link'

type Props = { searchParams: Promise<{ page?: string; status?: string }> }

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: '#F4845F', bg: '#FFF7F5', label: 'En attente' },
  approved: { color: '#40916C', bg: '#F0FDF4', label: 'Approuvé' },
  rejected: { color: '#EF4444', bg: '#FEF2F2', label: 'Rejeté' },
}

export default async function ClaimsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const status = sp.status ?? 'pending'

  const result = await getClaims({ page, status }).catch(() => ({ data: [], total: 0, hasNextPage: false }))

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
            Claims
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{result.total} demande{result.total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        {STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={`/claims?status=${value}`}
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

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F4F2' }}>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Restaurant</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Demandeur</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Message</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
              {status === 'pending' && <th className="px-5 py-3.5 w-40" />}
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  Aucun claim
                </td>
              </tr>
            )}
            {result.data.map((c) => {
              const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.pending
              return (
                <tr key={c.id} style={{ borderTop: '1px solid #F4F6F5' }}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{c.restaurant?.name ?? '—'}</div>
                    {c.restaurant?.city && (
                      <div className="text-xs text-gray-400 mt-0.5">{c.restaurant.city}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{c.user?.name ?? 'Anonyme'}</td>
                  <td className="px-5 py-3.5 text-gray-400 max-w-xs truncate hidden md:table-cell">
                    {c.message ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ color: s.color, background: s.bg }}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  {status === 'pending' && (
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2 justify-end">
                        <form action={approveClaimAction.bind(null, c.id)}>
                          <button
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: '#F0FDF4', color: '#40916C' }}
                          >
                            Approuver
                          </button>
                        </form>
                        <form action={rejectClaimAction.bind(null, c.id)}>
                          <button
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: '#FEF2F2', color: '#EF4444' }}
                          >
                            Rejeter
                          </button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(page > 1 || result.hasNextPage) && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/claims?page=${page - 1}&status=${status}`}
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
              href={`/claims?page=${page + 1}&status=${status}`}
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
