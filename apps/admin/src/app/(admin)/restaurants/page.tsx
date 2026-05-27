import { getAdminRestaurants } from '@/lib/api'
import { setRestaurantStatusAction } from '@/lib/actions'
import Link from 'next/link'

type Props = { searchParams: Promise<{ page?: string; status?: string }> }

const STATUS_LABEL: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  rejected: 'Rejeté',
  inactive: 'Inactif',
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:   { color: '#40916C', bg: '#F0FDF4' },
  pending:  { color: '#F4845F', bg: '#FFF7F5' },
  rejected: { color: '#EF4444', bg: '#FEF2F2' },
  inactive: { color: '#9CA3AF', bg: '#F9FAFB' },
}

export default async function RestaurantsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const status = sp.status

  const result = await getAdminRestaurants({ page, status }).catch(() => ({
    data: [], total: 0, hasNextPage: false,
  }))

  const STATUSES = [
    { value: '', label: 'Tous' },
    { value: 'active', label: 'Actifs' },
    { value: 'pending', label: 'En attente' },
    { value: 'inactive', label: 'Inactifs' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Restaurants
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{result.total} au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        {STATUSES.map(({ value, label }) => {
          const active = status === value || (!status && !value)
          return (
            <Link
              key={value}
              href={value ? `/restaurants?status=${value}` : '/restaurants'}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={
                active
                  ? { background: '#1B4332', color: 'white' }
                  : { background: 'white', color: '#6B7280', border: '1px solid #E8EEEB' }
              }
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F4F2' }}>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Nom</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Ville</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Région</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Propriétaire</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
              <th className="px-5 py-3.5 w-28" />
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400">
                  Aucun restaurant
                </td>
              </tr>
            )}
            {result.data.map((r) => {
              const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.inactive
              return (
                <tr
                  key={r.id}
                  className="transition-colors"
                  style={{ borderTop: '1px solid #F4F6F5' }}
                  onMouseEnter={undefined}
                >
                  <td className="px-5 py-3.5 font-medium text-gray-900">{r.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{r.city}</td>
                  <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{r.region?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-400 hidden lg:table-cell">{r.owner?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ color: s.color, background: s.bg }}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 justify-end">
                      {r.status !== 'active' && (
                        <form action={setRestaurantStatusAction.bind(null, r.id, 'active')}>
                          <button
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: '#F0FDF4', color: '#40916C' }}
                          >
                            Activer
                          </button>
                        </form>
                      )}
                      {r.status === 'active' && (
                        <form action={setRestaurantStatusAction.bind(null, r.id, 'inactive')}>
                          <button
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: '#F9FAFB', color: '#9CA3AF' }}
                          >
                            Désactiver
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
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
              href={`/restaurants?page=${page - 1}${status ? `&status=${status}` : ''}`}
              className="px-4 py-2 rounded-xl text-sm transition-colors"
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
              href={`/restaurants?page=${page + 1}${status ? `&status=${status}` : ''}`}
              className="px-4 py-2 rounded-xl text-sm transition-colors"
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
