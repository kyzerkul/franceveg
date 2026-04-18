/**
 * Import restaurants depuis un fichier CSV vers Supabase
 *
 * Usage:
 *   npx tsx supabase/seed/import_restaurants.ts ./restaurants.csv
 *
 * Format CSV attendu (séparateur virgule, première ligne = en-têtes) :
 *   name, address, zip_code, city, description, short_description,
 *   phone, email, website, tags, cuisine_types, price_range,
 *   lat, lng, cover_image
 *
 * tags et cuisine_types : séparés par | (ex: "vegan|végétarien|bio")
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans les variables d\'environnement')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Slug utils ───────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueSlug(name: string, city: string, index: number): string {
  const base = `${slugify(name)}-${slugify(city)}`
  return index === 0 ? base : `${base}-${index}`
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n').map((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas inside
    const values: string[] = []
    let inQuote = false
    let current = ''
    for (const char of line) {
      if (char === '"') { inQuote = !inQuote; continue }
      if (char === ',' && !inQuote) { values.push(current.trim()); current = ''; continue }
      current += char
    }
    values.push(current.trim())

    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: npx tsx supabase/seed/import_restaurants.ts <chemin-vers-csv>')
    process.exit(1)
  }

  const content = readFileSync(resolve(csvPath), 'utf-8')
  const rows = parseCSV(content)
  console.log(`📄  ${rows.length} restaurants à importer...`)

  // Track slugs to avoid duplicates in same batch
  const usedSlugs = new Set<string>()
  let created = 0
  let skipped = 0
  let errors = 0

  for (const row of rows) {
    if (!row.name || !row.city) {
      console.warn(`⚠️   Ligne ignorée (name ou city manquant): ${JSON.stringify(row)}`)
      skipped++
      continue
    }

    // Generate unique slug
    let slugIndex = 0
    let slug = uniqueSlug(row.name, row.city, slugIndex)
    while (usedSlugs.has(slug)) {
      slugIndex++
      slug = uniqueSlug(row.name, row.city, slugIndex)
    }
    usedSlugs.add(slug)

    // Find or resolve region_id
    let region_id: string | null = null
    if (row.city) {
      const { data: region } = await supabase
        .from('regions')
        .select('id')
        .ilike('name', row.city.trim())
        .in('type', ['city', 'arrondissement'])
        .limit(1)
        .single()
      region_id = region?.id ?? null
    }

    const record = {
      name: row.name.trim(),
      slug,
      address: (row.address ?? '').trim() || 'Adresse non renseignée',
      zip_code: (row.zip_code ?? '').trim() || '00000',
      city: row.city.trim(),
      region_id,
      description: row.description?.trim() || null,
      short_description: row.short_description?.trim() || null,
      phone: row.phone?.trim() || null,
      email: row.email?.trim() || null,
      website: row.website?.trim() || null,
      tags: row.tags ? row.tags.split('|').map((t) => t.trim()).filter(Boolean) : [],
      cuisine_types: row.cuisine_types ? row.cuisine_types.split('|').map((t) => t.trim()).filter(Boolean) : [],
      price_range: row.price_range ? Number(row.price_range) : null,
      lat: row.lat ? Number(row.lat) : null,
      lng: row.lng ? Number(row.lng) : null,
      cover_image: row.cover_image?.trim() || null,
      status: 'active' as const,
    }

    const { error } = await supabase.from('restaurants').insert(record)

    if (error) {
      if (error.code === '23505') {
        // Unique constraint → slug conflict with existing DB record
        console.warn(`⚠️   "${record.name}" (${record.city}) existe déjà, ignoré`)
        skipped++
      } else {
        console.error(`❌  Erreur pour "${record.name}": ${error.message}`)
        errors++
      }
    } else {
      console.log(`✅  ${record.name} — ${record.city}`)
      created++
    }
  }

  console.log(`\n📊  Résultat: ${created} créés · ${skipped} ignorés · ${errors} erreurs`)
}

main().catch((err) => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
