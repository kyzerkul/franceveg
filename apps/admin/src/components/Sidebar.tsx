'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ShieldCheck, Star, Users, Leaf, BookOpen } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { href: '/claims', label: 'Claims', icon: ShieldCheck },
  { href: '/avis', label: 'Avis', icon: Star },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/users', label: 'Utilisateurs', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside
      className="w-60 flex flex-col shrink-0 h-full"
      style={{ background: '#1B4332' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#40916C' }}
          >
            <Leaf size={15} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              France Veg
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Administration</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={
                active
                  ? { background: '#40916C', color: '#fff', fontWeight: 500 }
                  : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} France Veg
        </p>
      </div>
    </aside>
  )
}
