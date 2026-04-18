import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page introuvable</h1>
        <p className="text-gray-500 mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
            Retour à l&apos;accueil
          </Link>
          <Link href="/restaurants" className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center">
            <Search size={16} />
            Chercher un restaurant
          </Link>
        </div>
      </div>
    </main>
  )
}
