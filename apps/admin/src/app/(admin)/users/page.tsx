import { getUsers } from '@/lib/api'
import Link from 'next/link'

type Props = { searchParams: Promise<{ page?: string }> }

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #74C69D, #2D6A4F)' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default async function UsersPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const result = await getUsers({ page }).catch(() => ({ data: [], total: 0, hasNextPage: false }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{result.total} inscrits</p>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F4F2' }}>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Utilisateur</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-16 text-gray-400">Aucun utilisateur</td>
              </tr>
            )}
            {result.data.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #F4F6F5' }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name ?? u.email ?? 'U'} />
                    <span className="font-medium text-gray-900">
                      {u.name ?? <span className="text-gray-300 italic">Sans nom</span>}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{u.email ?? '—'}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell">
                  {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(page > 1 || result.hasNextPage) && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/users?page=${page - 1}`}
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
              href={`/users?page=${page + 1}`}
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
