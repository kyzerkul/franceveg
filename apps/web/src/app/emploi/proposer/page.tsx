'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CheckCircle, Briefcase, MapPin } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const CONTRACT_TYPES = ['CDI', 'CDD', 'Temps partiel', 'Stage', 'Alternance', 'Freelance', 'Autre']

export default function ProposerEmploiPage() {
  const { isSignedIn, getToken } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    type: 'offer' as 'offer' | 'cv',
    title: '',
    description: '',
    location: '',
    contract_type: '',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          description: form.description,
          location: form.location || undefined,
          contract_type: form.contract_type || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Annonce publiée !
          </h1>
          <p className="text-gray-500 mb-6">Votre annonce est maintenant visible sur France Veg.</p>
          <Link
            href="/emploi"
            className="inline-block text-white font-semibold px-6 py-3 rounded-xl"
            style={{ background: '#40916C' }}
          >
            Voir toutes les annonces →
          </Link>
        </div>
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FDF6EC' }}>
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5"
            style={{ border: '1px solid #F3F4F6', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
          >
            <Briefcase size={28} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Déposer une annonce
          </h1>
          <p className="text-gray-500 mb-6 text-sm">Vous devez être connecté pour publier une annonce.</p>
          <Link
            href="/connexion?redirect=/emploi/proposer"
            className="inline-block text-white font-semibold px-6 py-3 rounded-xl"
            style={{ background: '#1B4332' }}
          >
            Se connecter
          </Link>
        </div>
      </main>
    )
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white'

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Déposer une annonce
          </h1>
          <p className="text-sm" style={{ color: '#86EFAC' }}>
            Offre d&apos;emploi ou recherche d&apos;emploi dans le secteur vegan/végétarien.
          </p>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            {/* Type toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d&apos;annonce *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['offer', 'cv'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                      form.type === t ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                    }`}
                    style={form.type === t ? { background: '#40916C' } : {}}
                  >
                    {t === 'offer' ? "Offre d'emploi" : "Je cherche un emploi (CV)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'offer' ? 'Poste proposé *' : 'Poste recherché *'}
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={inputClass}
                placeholder={form.type === 'offer' ? 'Ex: Cuisinier vegan — Paris' : 'Ex: Chef de cuisine végétalien'}
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={6}
                maxLength={2000}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none bg-white"
                placeholder={
                  form.type === 'offer'
                    ? 'Décrivez le poste, les responsabilités, les requis...'
                    : 'Décrivez votre profil, votre expérience, vos disponibilités...'
                }
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
            </div>

            {/* Location + Contract */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className={`${inputClass} pl-8`}
                    placeholder="Paris, Lyon..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                <select
                  value={form.contract_type}
                  onChange={(e) => set('contract_type', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Non précisé</option>
                  {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              Une erreur est survenue. Réessayez.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50"
            style={{ background: '#1B4332' }}
          >
            {status === 'loading' ? 'Publication...' : "Publier l'annonce"}
          </button>
        </form>
      </main>
    </>
  )
}
