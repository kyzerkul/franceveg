export type TagConfig = {
  slug: string        // URL: "vegan", "sans-gluten"
  label: string       // Affichage: "vegan", "sans gluten"
  dbValue: string     // Valeur en base: "vegan", "sans gluten"
  adjective: string   // SEO: "vegan", "végétariens", "sans gluten"
}

export const TAGS: TagConfig[] = [
  { slug: 'vegan',         label: 'vegan',        dbValue: 'vegan',       adjective: 'vegan' },
  { slug: 'vegetarien',    label: 'végétarien',   dbValue: 'végétarien',  adjective: 'végétariens' },
  { slug: 'vegetalien',    label: 'végétalien',   dbValue: 'végétalien',  adjective: 'végétaliens' },
  { slug: 'bio',           label: 'bio',           dbValue: 'bio',         adjective: 'bio' },
  { slug: 'halal',         label: 'halal',         dbValue: 'halal',       adjective: 'halal' },
  { slug: 'brunch',        label: 'brunch',        dbValue: 'brunch',      adjective: 'brunch' },
  { slug: 'avec-terrasse', label: 'avec terrasse', dbValue: 'terrasse',    adjective: 'avec terrasse' },
  { slug: 'livraison',     label: 'livraison',     dbValue: 'livraison',   adjective: 'avec livraison' },
  { slug: 'sans-gluten',   label: 'sans gluten',   dbValue: 'sans gluten', adjective: 'sans gluten' },
  { slug: 'fait-maison',   label: 'fait maison',   dbValue: 'fait maison', adjective: 'fait maison' },
]

export function tagBySlug(slug: string): TagConfig | undefined {
  return TAGS.find((t) => t.slug === slug)
}

export function tagByDbValue(value: string): TagConfig | undefined {
  return TAGS.find((t) => t.dbValue === value)
}
