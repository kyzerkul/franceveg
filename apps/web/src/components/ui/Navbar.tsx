'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

const NAV_LINKS = [
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/blog', label: 'Blog' },
  { href: '/emploi', label: 'Emploi' },
  { href: '/villes', label: 'Villes' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isHomepage = pathname === '/'

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled || !isHomepage
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              width={140}
              height={35}
              alt="France Veg"
              className={`h-8 w-auto transition-all duration-300 ${
                scrolled || !isHomepage ? '' : 'brightness-0 invert'
              }`}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative group ${
                  scrolled || !isHomepage
                    ? 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
                <span className={`absolute bottom-1 left-4 right-4 h-0.5 bg-green-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${
                  pathname.startsWith(href) ? 'scale-x-100' : ''
                }`} />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                  scrolled || !isHomepage
                    ? 'border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                Mon espace
              </Link>
            ) : (
              <Link
                href="/connexion"
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                  scrolled || !isHomepage
                    ? 'border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                Se connecter
              </Link>
            )}
            <Link
              href="/soumettre-un-restaurant"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm"
            >
              Soumettre un restaurant
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isHomepage
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-green-700 z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-green-600">
                <div className="flex items-center">
                  <Image
                    src="/logo.svg"
                    width={120}
                    height={30}
                    alt="France Veg"
                    className="h-7 w-auto brightness-0 invert"
                  />
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                  >
                    {label}
                  </Link>
                ))}
                {isSignedIn && (
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                  >
                    Mon espace
                  </Link>
                )}
              </nav>

              <div className="px-4 pb-6 space-y-3">
                {!isSignedIn && (
                  <Link
                    href="/connexion"
                    className="block w-full text-center py-3 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Se connecter
                  </Link>
                )}
                <Link
                  href="/soumettre-un-restaurant"
                  className="block w-full text-center py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                >
                  Soumettre un restaurant
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
