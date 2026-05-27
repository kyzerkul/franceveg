import type { Metadata } from 'next'
import { getCities } from '@/lib/api'
import { buildTitle, canonicalUrl } from '@/lib/seo'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { VillesClient } from '@/components/ui/VillesClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: buildTitle(['Restaurants vegan par ville en France']),
  description: 'Découvrez les meilleurs restaurants vegan et végétariens dans toutes les villes de France. Fiches complètes avec avis, horaires et adresses.',
  alternates: { canonical: canonicalUrl('/villes') },
}

export default async function VillesPage() {
  const cities = await getCities().catch(() => [])
  const visible = cities.filter((c) => c.total_restaurants > 0)

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <Breadcrumb
            light
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Villes' },
            ]}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Restaurants vegan par ville
          </h1>
          <p className="text-green-100 text-sm">
            {visible.length} villes répertoriées · Avis certifiés · Fiches complètes
          </p>
        </div>
      </section>

      <VillesClient cities={visible} />
    </>
  )
}
