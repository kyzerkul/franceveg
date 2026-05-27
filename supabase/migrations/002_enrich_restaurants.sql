-- France Veg — Enrichissement restaurants avec data Google
-- Run with: supabase db push

-- ─── Nouveaux champs sur restaurants ──────────────────────────────────────────

-- Attributs Google Maps complets (offerings, atmosphere, crowd, services, etc.)
-- Utilisé pour les filtres avancés et les badges sur la fiche
ALTER TABLE restaurants ADD COLUMN attributes JSONB DEFAULT '{}'::jsonb;

-- Heures d'affluence (popular_times Google, jour × heure)
ALTER TABLE restaurants ADD COLUMN popular_times JSONB;

-- Note Google + nombre d'avis Google (différent de notre note interne via reviews)
ALTER TABLE restaurants ADD COLUMN external_rating NUMERIC(2,1);
ALTER TABLE restaurants ADD COLUMN external_rating_count INT DEFAULT 0;

-- Google Place ID — pour resync futur et déduplication
ALTER TABLE restaurants ADD COLUMN google_place_id TEXT;

-- Topics : mots-clés extraits des avis Google (ex: {"brunch": 127, "terrasse": 45})
ALTER TABLE restaurants ADD COLUMN topics JSONB;

-- Logo séparé du cover_image (Google fournit les deux)
ALTER TABLE restaurants ADD COLUMN logo TEXT;

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX idx_restaurants_google_place_id
  ON restaurants(google_place_id)
  WHERE google_place_id IS NOT NULL;

CREATE INDEX idx_restaurants_external_rating
  ON restaurants(external_rating DESC NULLS LAST)
  WHERE status = 'active';

-- Index GIN sur attributes pour filtres rapides
-- Ex: WHERE attributes->'offerings' ? 'serves_vegan'
CREATE INDEX idx_restaurants_attributes_gin ON restaurants USING GIN(attributes);
