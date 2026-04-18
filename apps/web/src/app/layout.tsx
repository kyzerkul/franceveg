import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

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
    <ClerkProvider>
      <html lang="fr" className={geist.variable}>
        <body className="min-h-screen bg-white text-gray-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
