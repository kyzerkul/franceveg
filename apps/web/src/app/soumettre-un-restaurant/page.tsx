'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CheckCircle, Leaf, MapPin, Phone, Tag, FileText } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const TAGS_OPTIONS = ['vegan', 'végétarien', 'végétalien', 'sans gluten', 'bio', 'fait maison', 'cru', 'sans lactose']
const CUISINE_OPTIONS = ['française', 'italienne', 'asiatique', 'indienne', 'mexicaine', 'méditerranéenne', 'japonaise', 'africaine', 'libanaise', 'autre']

const STEPS = [
  { icon: MapPin, label: 'Adresse' },
  { icon: Phone, label: 'Contact' },
  { icon: Tag, label: 'Type' },
  { icon: FileText, label: 'Description' },
]

export default function SoumettreRestaurantPage() {
  const { getToken } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    name: '', address: '', zip_code: '', city: '',
    phone: '', email: '', website: '', description: '',
    tags: [] as string[], cuisine_types: [] as string[],
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleArray(field: 'tags' | 'cuisine_types', value: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const token = await getToken().catch(() => null)
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API_URL}/api/submissions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined,
          email: form.email || undefined,
          website: form.website || undefined,
          description: form.description || undefined,
          tags: form.tags.length ? form.tags : undefined,
          cuisine_types: form.cuisine_types.length ? form.cuisine_types : undefined,
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
            Merci pour votre soumission !
          </h1>
          <p className="text-gray-500 mb-6">Notre équipe examinera votre demande et publiera le restaurant sous 48h.</p>
          <a href="/" className="inline-block text-white font-semibold px-6 py-3 rounded-xl" style={{ background: '#40916C' }}>
            Retour à l&apos;accueil
          </a>
        </div>
      </main>
    )
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white'

  return (
    <>
      {/* Hero with stepper */}
      <section style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-sm" style={{ color: '#86EFAC' }}>
            <Leaf size={16} />
            <span>Gratuit · Publié sous 48h</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Soumettre un restaurant
          </h1>
          <p className="text-sm mb-8" style={{ color: '#86EFAC' }}>
            Ajoutez un restaurant vegan ou végétarien à l&apos;annuaire France Veg.
          </p>
          {/* Stepper */}
          <div className="flex items-center justify-center">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <Icon size={15} className="text-white" />
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-8 sm:w-14 h-px mx-2 mb-5" style={{ background: 'rgba(255,255,255,0.2)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Adresse */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <MapPin size={15} className="text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Informations principales</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant *</label>
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="Le Jardin Vert" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input required value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} placeholder="12 rue de la Paix" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                  <input required value={form.zip_code} onChange={(e) => set('zip_code', e.target.value)} className={inputClass} placeholder="75001" maxLength={5} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <input required value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} placeholder="Paris" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Contact */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <Phone size={15} className="text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Contact</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} placeholder="01 23 45 67 89" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="contact@restaurant.fr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </div>
          </section>

          {/* Section 3: Type */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <Tag size={15} className="text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Type de restaurant</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Régimes alimentaires</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleArray('tags', tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                        form.tags.includes(tag) ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                      }`}
                      style={form.tags.includes(tag) ? { background: '#40916C' } : {}}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleArray('cuisine_types', c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                        form.cuisine_types.includes(c) ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                      }`}
                      style={form.cuisine_types.includes(c) ? { background: '#2D6A4F' } : {}}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Description */}
          <section
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid #F3F4F6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <FileText size={15} className="text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Description</h2>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Décrivez le restaurant, l'ambiance, les spécialités..."
              rows={4}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none bg-white"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
          </section>

          {status === 'error' && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              Une erreur est survenue. Vérifiez les champs et réessayez.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full text-white font-semibold py-4 rounded-xl transition-colors text-base disabled:opacity-50"
            style={{ background: '#1B4332' }}
          >
            {status === 'loading' ? 'Envoi en cours...' : 'Soumettre le restaurant'}
          </button>
        </form>
      </main>
    </>
  )
}
