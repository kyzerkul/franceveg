'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Star } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type Props = {
  restaurantId: string
  onSuccess?: () => void
}

export function ReviewForm({ restaurantId, onSuccess }: Props) {
  const { isSignedIn, getToken } = useAuth()
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  if (!isSignedIn) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 text-center">
        <p className="text-gray-600 mb-3">Connectez-vous pour laisser un avis</p>
        <Link
          href="/connexion"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-700 font-medium">Merci pour votre avis !</p>
        <p className="text-green-600 text-sm mt-1">Il sera publié après modération.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setStatus('loading')

    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          visit_date: visitDate || undefined,
        }),
      })

      if (res.status === 409) { setStatus('duplicate'); return }
      if (!res.ok) throw new Error()
      setStatus('success')
      onSuccess?.()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Note étoiles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Note *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  i <= (hovered || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Titre (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre (optionnel)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Résumez votre expérience"
          maxLength={100}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Contenu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre avis *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Partagez votre expérience..."
          required
          rows={4}
          maxLength={1000}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/1000</p>
      </div>

      {/* Date de visite (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date de visite (optionnel)</label>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">Une erreur est survenue. Réessayez.</p>
      )}
      {status === 'duplicate' && (
        <p className="text-sm text-orange-600">Vous avez déjà laissé un avis pour ce restaurant.</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !content.trim()}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        {status === 'loading' ? 'Envoi...' : 'Publier mon avis'}
      </button>
    </form>
  )
}
