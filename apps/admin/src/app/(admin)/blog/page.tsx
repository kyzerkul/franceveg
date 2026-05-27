import Link from 'next/link'
import { getAdminBlogPosts } from '@/lib/api'
import { deleteBlogPostAction, togglePublishAction } from '@/lib/actions'

type Props = { searchParams: Promise<{ page?: string }> }

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))

  const result = await getAdminBlogPosts({ page }).catch(() => ({
    data: [], total: 0, hasNextPage: false,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Blog
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{result.total} article{result.total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/blog/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: '#40916C' }}
        >
          + Nouvel article
        </Link>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #E8EEEB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F4F2' }}>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Titre
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">
                Tags
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Statut
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">
                Date
              </th>
              <th className="px-5 py-3.5 w-44" />
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                  Aucun article pour l&apos;instant.{' '}
                  <Link href="/blog/new" className="text-green-600 underline">
                    Créer le premier.
                  </Link>
                </td>
              </tr>
            )}
            {result.data.map((post) => (
              <tr key={post.id} style={{ borderTop: '1px solid #F4F6F5' }}>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[200px]">
                    {post.slug}
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={
                      post.published_at
                        ? { color: '#40916C', background: '#F0FDF4' }
                        : { color: '#9CA3AF', background: '#F9FAFB' }
                    }
                  >
                    {post.published_at ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                  {new Date(post.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5 justify-end flex-wrap">
                    <Link
                      href={`/blog/${post.id}/edit`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: '#EEF2FF', color: '#6366F1' }}
                    >
                      Éditer
                    </Link>
                    <form action={togglePublishAction.bind(null, post.id)}>
                      <button
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        style={
                          post.published_at
                            ? { background: '#FFF7F5', color: '#F4845F' }
                            : { background: '#F0FDF4', color: '#40916C' }
                        }
                      >
                        {post.published_at ? 'Dépublier' : 'Publier'}
                      </button>
                    </form>
                    <form action={deleteBlogPostAction.bind(null, post.id)}>
                      <button
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ background: '#FEF2F2', color: '#EF4444' }}
                        onClick={(e) => {
                          if (!confirm(`Supprimer "${post.title}" ?`)) e.preventDefault()
                        }}
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(page > 1 || result.hasNextPage) && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E8EEEB', color: '#374151' }}
            >
              ← Précédent
            </Link>
          )}
          {result.hasNextPage && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E8EEEB', color: '#374151' }}
            >
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
