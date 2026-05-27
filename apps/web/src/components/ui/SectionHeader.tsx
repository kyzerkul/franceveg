import Link from 'next/link'

export function SectionHeader({ title, href, linkLabel = 'Voir tous →' }: {
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-green-600 rounded-full" />
        <h2
          className="text-2xl sm:text-3xl font-bold text-gray-900"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
