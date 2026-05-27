/**
 * Import restaurants depuis le fichier Google Maps (XLS ou XLSX) vers Supabase
 *
 * Usage:
 *   pnpm --filter api tsx ../../supabase/seed/import_restaurants.ts ../../restaurants.xlsx
 *
 * Le script :
 *   - lit XLS/XLSX directement (pas besoin de convertir en CSV)
 *   - parse les colonnes JSON (attributes, place_topics, rating, work_time, popular_times)
 *   - crée auto les régions (ville + arrondissement Paris depuis ZIP)
 *   - extrait les tags depuis attributes Google
 *   - skip les restaurants closed_forever (sécurité)
 *   - upsert par google_place_id (re-lancer le script = update au lieu de duplicate)
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import * as XLSX from 'xlsx'

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌  SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans l'env")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Types ────────────────────────────────────────────────────────────────────

type GoogleRow = {
  title: string
  description: string
  category: string
  feature_id: string
  address: string
  address_info_borough: string
  address_info_address: string
  address_info_city: string
  address_info_zip: string
  address_info_region: string
  address_info_country_code: string
  place_id: string
  phone: string
  url: string
  logo: string
  main_image: string
  latitude: string | number
  longitude: string | number
  attributes: string
  place_topics: string
  rating: string
  hotel_rating: string
  price_level: string
  people_also_search: string
  work_time: string
  popular_times: string
  contact_info: string
  check_url: string
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

function filterImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  // Street View thumbnails and Maps internal URLs don't work as static images
  if (url.includes('streetviewpixels-pa.googleapis.com')) return null
  if (url.includes('maps.googleapis.com/maps/api/streetview')) return null
  return url
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── JSON safe parser ─────────────────────────────────────────────────────────

function safeJSON<T = unknown>(raw: string | undefined | null): T | null {
  if (!raw || typeof raw !== 'string') return null
  try { return JSON.parse(raw) as T } catch { return null }
}

// ─── Paris arrondissement detection ───────────────────────────────────────────

function parisArrondissement(zip: string): { num: number; name: string; slug: string } | null {
  if (!zip || !zip.startsWith('750')) return null
  const num = Number(zip.slice(2))
  if (num < 1 || num > 20) return null
  const ordinal = num === 1 ? '1er' : `${num}e`
  return {
    num,
    name: `${ordinal} arrondissement`,
    slug: `paris-${num}e`,
  }
}

// ─── Tags extraction ──────────────────────────────────────────────────────────

const OFFERINGS_TAGS: Record<string, string> = {
  serves_vegan: 'vegan',
  serves_organic: 'bio',
  serves_halal_food: 'halal',
  serves_healthy: 'healthy',
}

const DINING_TAGS: Record<string, string> = {
  serves_brunch: 'brunch',
  serves_breakfast: 'petit-déjeuner',
}

const SERVICE_TAGS: Record<string, string> = {
  has_seating_outdoors: 'terrasse',
  has_delivery: 'livraison',
  has_takeout: 'à emporter',
}

const CROWD_TAGS: Record<string, string> = {
  welcomes_families: 'family-friendly',
  welcomes_lgbtq: 'lgbtq-friendly',
}

const ATMOSPHERE_TAGS: Record<string, string> = {
  feels_romantic: 'romantique',
  feels_cozy: 'cosy',
  feels_quiet: 'calme',
  feels_hip: 'hipster',
}

function extractTags(
  attributes: Record<string, Record<string, string[]>> | null,
  description: string,
): string[] {
  const tags = new Set<string>()
  const avail = attributes?.available_attributes ?? {}

  const mapGroup = (key: string, dict: Record<string, string>) => {
    const list = avail[key] as string[] | undefined
    if (!list) return
    for (const item of list) {
      if (dict[item]) tags.add(dict[item])
    }
  }

  mapGroup('offerings', OFFERINGS_TAGS)
  mapGroup('dining_options', DINING_TAGS)
  mapGroup('service_options', SERVICE_TAGS)
  mapGroup('crowd', CROWD_TAGS)
  mapGroup('atmosphere', ATMOSPHERE_TAGS)

  // Pets : welcomes_dogs ou allows_dogs_inside → dog-friendly
  const pets = avail['pets'] as string[] | undefined
  if (pets?.some((p) => p.startsWith('welcomes_dogs') || p === 'allows_dogs_inside')) {
    tags.add('dog-friendly')
  }

  // Femme entrepreneure
  const from = avail['from_the_business'] as string[] | undefined
  if (from?.includes('is_owned_by_women')) tags.add('femme entrepreneure')

  // Sans gluten — pas dans les attributes Google, on cherche dans la description
  if (description && /sans gluten|gluten[- ]free/i.test(description)) {
    tags.add('sans gluten')
  }

  return Array.from(tags)
}

// ─── Price level → price_range ────────────────────────────────────────────────

function priceRange(level: string): number | null {
  switch (level?.toLowerCase()) {
    case 'inexpensive': return 1
    case 'moderate': return 2
    case 'expensive': return 3
    case 'very_expensive': return 4
    default: return null
  }
}

// ─── Opening hours format ─────────────────────────────────────────────────────
// Google format → notre format simplifié { lundi: { open: "12:00", close: "14:30" } }

function formatOpeningHours(workTime: { work_hours?: { timetable?: Record<string, Array<{ open: { hour: number; minute: number }; close: { hour: number; minute: number } }> | null> } } | null): Record<string, { open: string; close: string } | null> | null {
  if (!workTime?.work_hours?.timetable) return null
  const dayMap: Record<string, string> = {
    monday: 'lundi', tuesday: 'mardi', wednesday: 'mercredi', thursday: 'jeudi',
    friday: 'vendredi', saturday: 'samedi', sunday: 'dimanche',
  }
  const result: Record<string, { open: string; close: string } | null> = {}
  for (const [en, fr] of Object.entries(dayMap)) {
    const slots = workTime.work_hours.timetable[en]
    if (!slots || slots.length === 0) {
      result[fr] = null
      continue
    }
    // Prendre le premier créneau (on simplifie pour Phase 2)
    const slot = slots[0]
    const pad = (n: number) => String(n).padStart(2, '0')
    result[fr] = {
      open: `${pad(slot.open.hour)}:${pad(slot.open.minute)}`,
      close: `${pad(slot.close.hour)}:${pad(slot.close.minute)}`,
    }
  }
  return result
}

// ─── Email extraction depuis contact_info ─────────────────────────────────────

function extractEmail(contactInfo: Array<{ type: string; value: string }> | null): string | null {
  if (!Array.isArray(contactInfo)) return null
  const mail = contactInfo.find((c) => c.type === 'mail')
  return mail?.value ?? null
}

// ─── Region : find or create ──────────────────────────────────────────────────

const regionCache = new Map<string, string>() // slug → id

async function findOrCreateRegion(
  name: string,
  slug: string,
  type: 'city' | 'arrondissement',
  parentId: string | null = null,
): Promise<string> {
  if (regionCache.has(slug)) return regionCache.get(slug)!

  const { data: existing } = await supabase
    .from('regions')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing?.id) {
    regionCache.set(slug, existing.id)
    return existing.id
  }

  const { data: created, error } = await supabase
    .from('regions')
    .insert({ name, slug, type, parent_id: parentId })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Region creation failed for ${slug}: ${error?.message}`)
  regionCache.set(slug, created.id)
  return created.id
}

// ─── Resolve region for a restaurant ──────────────────────────────────────────

async function resolveRegion(city: string, zip: string): Promise<string | null> {
  if (!city) return null

  const isParis = city.trim().toLowerCase() === 'paris'

  if (isParis) {
    const arr = parisArrondissement(zip)
    if (!arr) {
      // Paris sans arrondissement reconnu → fallback ville
      return findOrCreateRegion('Paris', 'paris', 'city')
    }
    const parisId = await findOrCreateRegion('Paris', 'paris', 'city')
    return findOrCreateRegion(arr.name, arr.slug, 'arrondissement', parisId)
  }

  return findOrCreateRegion(city.trim(), slugify(city), 'city')
}

// ─── Unique slug ──────────────────────────────────────────────────────────────
// Slug = nom du restaurant slugifié (sans ville)
// Disambigué par région : "pita", "pita-2", "pita-3" si plusieurs dans même région

async function uniqueSlug(name: string, regionId: string | null, currentRestaurantId: string | null): Promise<string> {
  const base = slugify(name)
  let candidate = base
  let i = 0
  while (i < 50) {
    const query = supabase
      .from('restaurants')
      .select('id')
      .eq('slug', candidate)
    if (regionId) query.eq('region_id', regionId)
    else query.is('region_id', null)
    const { data } = await query.maybeSingle()

    // Slug libre, ou occupé par le même restaurant (update)
    if (!data || data.id === currentRestaurantId) return candidate
    i++
    candidate = `${base}-${i}`
  }
  throw new Error(`Cannot generate unique slug for ${name}`)
}

// ─── Status check ─────────────────────────────────────────────────────────────

function isOpenStatus(workTime: { work_hours?: { current_status?: string } } | null): boolean {
  const status = workTime?.work_hours?.current_status
  return status !== 'closed_forever' && status !== 'temporarily_closed'
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: tsx supabase/seed/import_restaurants.ts <chemin-vers-xlsx-ou-csv>')
    process.exit(1)
  }

  const absPath = resolve(filePath)
  console.log(`📄  Lecture de ${absPath}`)

  const workbook = XLSX.readFile(absPath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: GoogleRow[] = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' })

  console.log(`📊  ${rows.length} lignes dans le fichier`)

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    if (!row.title || !row.address_info_city) {
      skipped++
      continue
    }

    try {
      const attributes = safeJSON<Record<string, Record<string, string[]>>>(row.attributes)
      const topics = safeJSON<Record<string, number>>(row.place_topics)
      const rating = safeJSON<{ value?: number; votes_count?: number }>(row.rating)
      const workTime = safeJSON<{ work_hours?: { current_status?: string; timetable?: Record<string, Array<{ open: { hour: number; minute: number }; close: { hour: number; minute: number } }> | null> } }>(row.work_time)
      const popularTimes = safeJSON(row.popular_times)
      const contactInfo = safeJSON<Array<{ type: string; value: string }>>(row.contact_info)

      // Skip si fermé pour toujours (sécurité même si user a déjà nettoyé)
      if (!isOpenStatus(workTime)) {
        skipped++
        continue
      }

      const city = row.address_info_city.trim()
      const zip = String(row.address_info_zip ?? '').trim()
      const regionId = await resolveRegion(city, zip)
      const tags = extractTags(attributes, row.description)

      // Upsert key : google_place_id si on l'a, sinon nouveau
      const placeId = row.place_id?.trim() || null

      // Check si existant par google_place_id
      let existingId: string | null = null
      if (placeId) {
        const { data } = await supabase
          .from('restaurants')
          .select('id, slug')
          .eq('google_place_id', placeId)
          .maybeSingle()
        existingId = data?.id ?? null
      }

      // Slug propre (sans ville) — disambigué par région si conflit
      const slug = await uniqueSlug(row.title, regionId, existingId)

      const record = {
        name: row.title.trim(),
        slug,
        description: row.description?.trim() || null,
        short_description: row.description?.trim().slice(0, 160) || null,
        address: row.address_info_address?.trim() || row.address?.trim() || 'Adresse non renseignée',
        zip_code: zip || '00000',
        city,
        region_id: regionId,
        lat: row.latitude ? Number(row.latitude) : null,
        lng: row.longitude ? Number(row.longitude) : null,
        phone: row.phone?.trim() || null,
        email: extractEmail(contactInfo),
        website: row.url?.trim() || null,
        cover_image: filterImageUrl(row.main_image?.trim()),
        logo: row.logo?.trim() || null,
        tags,
        cuisine_types: [],
        price_range: priceRange(row.price_level),
        opening_hours: formatOpeningHours(workTime),
        attributes: attributes ?? {},
        topics,
        popular_times: popularTimes,
        external_rating: rating?.value ?? null,
        external_rating_count: rating?.votes_count ?? 0,
        google_place_id: placeId,
        status: 'active' as const,
      }

      if (existingId) {
        const { error } = await supabase.from('restaurants').update(record).eq('id', existingId)
        if (error) throw error
        updated++
      } else {
        const { error } = await supabase.from('restaurants').insert(record)
        if (error) throw error
        created++
      }

      if ((created + updated) % 25 === 0) {
        console.log(`   ${created + updated} / ${rows.length} traités…`)
      }
    } catch (err) {
      console.error(`❌  ${row.title} (${row.address_info_city}): ${err instanceof Error ? err.message : err}`)
      errors++
    }
  }

  console.log(`\n📊  Résultat:`)
  console.log(`   ✅  ${created} créés`)
  console.log(`   🔄  ${updated} mis à jour`)
  console.log(`   ⏭   ${skipped} ignorés (sans nom/ville ou fermés)`)
  console.log(`   ❌  ${errors} erreurs`)
  console.log(`\n🌍  ${regionCache.size} régions touchées`)
}

main().catch((err) => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
