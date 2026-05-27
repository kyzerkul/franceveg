import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type BreadcrumbItem = { label: string; href?: string }

export function Breadcrumb({ items, light = false }: { items: BreadcrumbItem[]; light?: boolean }) {
  return (
    <nav className="flex items-center gap-1.5 py-3 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight
              size={13}
              className={light ? 'text-white/40' : 'text-gray-300'}
            />
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className={`text-sm transition-colors ${
                light
                  ? 'text-white/60 hover:text-white'
                  : 'text-gray-400 hover:text-green-600'
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`text-sm font-medium ${
                light ? 'text-white/90' : 'text-gray-700'
              }`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
