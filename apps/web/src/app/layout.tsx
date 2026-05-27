import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Restaurants Vegan & Végétariens en France`, template: `%s | ${SITE_NAME}` },
  description: 'Trouvez les meilleurs restaurants vegan et végétariens en France. Fiches complètes, avis, horaires et localisation.',
  openGraph: {
    siteName: SITE_NAME,
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/connexion"
      signUpUrl="/inscription"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="fr" className={`${playfair.variable} ${jakarta.variable} ${inter.variable}`}>
        <body
          className="min-h-screen bg-white antialiased"
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
          }}
        >
          <Navbar />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
