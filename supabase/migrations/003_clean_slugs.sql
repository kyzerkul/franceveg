-- France Veg — Slugs propres par région
-- Permet d'avoir des URLs /restaurants/[ville]/[slug] sans répétition de la ville
-- Run with: supabase db push

-- ─── Drop la contrainte d'unicité globale sur slug ────────────────────────────
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_slug_key;

-- ─── Unicité du slug par région (pas global) ──────────────────────────────────
-- Deux restos avec le même nom OK s'ils sont dans des régions différentes
CREATE UNIQUE INDEX idx_restaurants_slug_region
  ON restaurants(slug, region_id)
  WHERE region_id IS NOT NULL;

-- Fallback pour restos sans région
CREATE UNIQUE INDEX idx_restaurants_slug_no_region
  ON restaurants(slug)
  WHERE region_id IS NULL;
