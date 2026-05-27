import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'France Veg Admin',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr" className="h-full">
        <body
          className="h-full antialiased"
          style={{
            fontFamily: `var(--font-inter), system-ui, sans-serif`,
            ['--font-heading' as string]: `var(--font-plus-jakarta), system-ui, sans-serif`,
            ['--font-body' as string]: `var(--font-inter), system-ui, sans-serif`,
          }}
        >
          <div className={`${plusJakarta.variable} ${inter.variable} h-full`}>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
