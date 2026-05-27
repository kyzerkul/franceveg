'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(
  () => import('./TiptapEditor').then((m) => m.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[320px] rounded-2xl border animate-pulse"
        style={{ background: '#F9FAFB', borderColor: '#E8EEEB' }}
      />
    ),
  },
)

export type BlogFormData = {
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  tags: string[]
  seo_title: string
  seo_description: string
  published: boolean
}

type Props = {
  initialData?: Partial<BlogFormData>
  onSubmit: (data: BlogFormData) => Promise<unknown>
}

const SUGGESTED_TAGS = [
  'vegan', 'végétarien', 'recette', 'actualité',
  'nutrition', 'lifestyle', 'restaurant', 'événement',
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function BlogPostForm({ initialData, onSubmit }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug)
  const [error, setError] = useState('')

  const [form, setForm] = useState<BlogFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    content: initialData?.content ?? '',
    excerpt: initialData?.excerpt ?? '',
    cover_image: initialData?.cover_image ?? '',
    tags: initialData?.tags ?? [],
    seo_title: initialData?.seo_title ?? '',
    seo_description: initialData?.seo_description ?? '',
    published: initialData?.published ?? false,
  })

  function set<K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleTitleChange(title: string) {
    set('title', title)
    if (!slugEdited) set('slug', slugify(title))
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return
    const { url } = await res.json() as { url: string }
    set('cover_image', url)
    e.target.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        await onSubmit(form)
        router.push('/blog')
      } catch (err) {
        setError(String(err))
      }
    })
  }

  const inputCls = 'w-full rounded-xl border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400'
  const inputStyle = { borderColor: '#E8EEEB', background: 'white' }
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 rounded-xl text-sm text-red-600" style={{ background: '#FEF2F2' }}>
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelCls}>Titre *</label>
        <input
          required
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputCls}
          style={inputStyle}
          placeholder="Mon article sur les restaurants vegans de Paris"
        />
      </div>

      {/* Slug */}
      <div>
        <label className={labelCls}>Slug (URL)</label>
        <input
          required
          value={form.slug}
          onChange={(e) => { setSlugEdited(true); set('slug', e.target.value) }}
          className={inputCls}
          style={inputStyle}
          placeholder="mon-article-vegans-paris"
        />
        <p className="text-xs text-gray-400 mt-1">
          URL finale : /blog/{form.slug || '…'}
        </p>
      </div>

      {/* Content */}
      <div>
        <label className={labelCls}>Contenu *</label>
        <TiptapEditor content={form.content} onChange={(html) => set('content', html)} />
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelCls}>Résumé (extrait)</label>
        <textarea
          rows={3}
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          className={inputCls}
          style={inputStyle}
          placeholder="Courte description pour les listes et le partage social…"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className={labelCls}>Image de couverture</label>
        <div className="flex gap-2">
          <input
            value={form.cover_image}
            onChange={(e) => set('cover_image', e.target.value)}
            className={`${inputCls} flex-1`}
            style={inputStyle}
            placeholder="https://…"
          />
          <label
            className="flex items-center px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors shrink-0"
            style={{ background: '#F0FDF4', color: '#40916C', border: '1px solid #D8F3DC' }}
          >
            Uploader
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
        </div>
        {form.cover_image && (
          <img src={form.cover_image} alt="Aperçu couverture" className="mt-2 rounded-xl h-32 object-cover" />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() =>
                set('tags', form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t])
              }
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={
                form.tags.includes(t)
                  ? { background: '#1B4332', color: 'white', borderColor: '#1B4332' }
                  : { background: 'white', color: '#6B7280', borderColor: '#E8EEEB' }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: '#F9FAFB', border: '1px solid #E8EEEB' }}
      >
        <h3 className="text-sm font-semibold text-gray-700">SEO</h3>
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className={labelCls} style={{ marginBottom: 0 }}>Titre SEO</label>
            <span className={`text-xs ${form.seo_title.length > 60 ? 'text-orange-500' : 'text-gray-400'}`}>
              {form.seo_title.length}/60
            </span>
          </div>
          <input
            value={form.seo_title}
            onChange={(e) => set('seo_title', e.target.value)}
            maxLength={70}
            className={inputCls}
            style={{ ...inputStyle, borderColor: form.seo_title.length > 60 ? '#F4845F' : '#E8EEEB' }}
          />
        </div>
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <label className={labelCls} style={{ marginBottom: 0 }}>Meta description</label>
            <span className={`text-xs ${form.seo_description.length > 160 ? 'text-orange-500' : 'text-gray-400'}`}>
              {form.seo_description.length}/160
            </span>
          </div>
          <textarea
            rows={2}
            value={form.seo_description}
            onChange={(e) => set('seo_description', e.target.value)}
            maxLength={170}
            className={inputCls}
            style={{ ...inputStyle, borderColor: form.seo_description.length > 160 ? '#F4845F' : '#E8EEEB' }}
          />
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set('published', !form.published)}
          className="relative w-11 h-6 rounded-full transition-colors shrink-0"
          style={{ background: form.published ? '#40916C' : '#D1D5DB' }}
          aria-label={form.published ? 'Dépublier' : 'Publier'}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
            style={{ transform: form.published ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
        <span className="text-sm text-gray-700">
          {form.published ? 'Publié — visible sur le blog' : 'Brouillon — non visible'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
          style={{ background: '#40916C' }}
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/blog')}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'white', color: '#6B7280', border: '1px solid #E8EEEB' }}
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
