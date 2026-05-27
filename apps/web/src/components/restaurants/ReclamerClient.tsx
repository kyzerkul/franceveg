'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { ChevronRight, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function ReclamerClient({ restaurantId, restaurantPageUrl }: { restaurantId: string; restaurantPageUrl: string }) {
  const { isSignedIn, getToken } = useAuth()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  const rid = restaurantId

  if (!isSignedIn) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Réclamez votre restaurant</h1>
        <p className="text-gray-500 mb-6">Vous devez être connecté pour soumettre une demande de réclamation.</p>
        <Link
          href={`/connexion?redirect=${restaurantPageUrl}/reclamer`}
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Se connecter
        </Link>
      </main>
    )
  }

  if (status === 'success') {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h1>
        <p className="text-gray-500 mb-6">Notre équipe examinera votre demande et vous contactera sous 48h.</p>
        <Link href={restaurantPageUrl} className="text-green-600 hover:underline text-sm">
          Retour à la fiche restaurant
        </Link>
      </main>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rid) return
    setStatus('loading')

    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurant_id: rid, message: message.trim() || undefined }),
      })

      if (res.status === 409) { setStatus('duplicate'); return }
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-green-600">Accueil</Link>
        <ChevronRight size={14} />
        <Link href="/restaurants" className="hover:text-green-600">Restaurants</Link>
        <ChevronRight size={14} />
        <Link href={restaurantPageUrl} className="hover:text-green-600">Restaurant</Link>
        <ChevronRight size={14} />
        <span className="text-gray-600">Réclamer</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Vous êtes le propriétaire ?</h1>
      <p className="text-gray-500 mb-8">
        Soumettez une demande de réclamation. Notre équipe vérifiera votre identité et vous donnera accès à la gestion de cette fiche.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Précisez comment vous pouvez prouver que vous êtes le propriétaire (site web, SIRET, etc.)"
            rows={4}
            maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-red-600">Une erreur est survenue. Réessayez.</p>
        )}
        {status === 'duplicate' && (
          <p className="text-sm text-orange-600">Une demande est déjà en cours pour ce restaurant.</p>
        )}
        {!rid && (
          <p className="text-sm text-orange-600">Lien invalide. Accédez à cette page depuis la fiche restaurant.</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !rid}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {status === 'loading' ? 'Envoi...' : 'Envoyer ma demande'}
        </button>
      </form>
    </main>
  )
}
