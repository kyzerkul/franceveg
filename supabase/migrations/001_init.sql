-- France Veg — Initial Schema
-- Run with: supabase db push

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ─── Regions ──────────────────────────────────────────────────────────────────
-- Hierarchy: région → département → ville → arrondissement

CREATE TYPE region_type AS ENUM ('region', 'department', 'city', 'arrondissement');

CREATE TABLE regions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  type        region_type NOT NULL,
  parent_id   uuid REFERENCES regions(id) ON DELETE SET NULL,
  seo_title   text,
  seo_description text,
  lat         float,
  lng         float,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_regions_slug    ON regions(slug);
CREATE INDEX idx_regions_type    ON regions(type);
CREATE INDEX idx_regions_parent  ON regions(parent_id);

-- ─── Users ────────────────────────────────────────────────────────────────────
-- Synced from Clerk via webhook

CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');

CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id   text NOT NULL UNIQUE,
  email      text NOT NULL UNIQUE,
  name       text,
  role       user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role     ON users(role);

-- ─── Restaurants ──────────────────────────────────────────────────────────────

CREATE TYPE restaurant_status AS ENUM ('active', 'pending', 'rejected');

CREATE TABLE restaurants (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text,
  short_description   text,
  address             text NOT NULL,
  zip_code            text NOT NULL,
  city                text NOT NULL,
  region_id           uuid REFERENCES regions(id) ON DELETE SET NULL,
  lat                 float,
  lng                 float,
  phone               text,
  email               text,
  website             text,
  social_links        jsonb DEFAULT '{}',
  opening_hours       jsonb DEFAULT '{}',
  price_range         smallint CHECK (price_range BETWEEN 1 AND 4),
  tags                text[] DEFAULT '{}',
  cuisine_types       text[] DEFAULT '{}',
  images              text[] DEFAULT '{}',
  cover_image         text,
  menu_url            text,
  status              restaurant_status NOT NULL DEFAULT 'active',
  is_featured         boolean NOT NULL DEFAULT false,
  featured_until      timestamptz,
  featured_region_id  uuid REFERENCES regions(id) ON DELETE SET NULL,
  owner_id            uuid REFERENCES users(id) ON DELETE SET NULL,
  claimed_at          timestamptz,
  seo_title           text,
  seo_description     text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_slug       ON restaurants(slug);
CREATE INDEX idx_restaurants_status     ON restaurants(status);
CREATE INDEX idx_restaurants_region     ON restaurants(region_id);
CREATE INDEX idx_restaurants_owner      ON restaurants(owner_id);
CREATE INDEX idx_restaurants_featured   ON restaurants(is_featured, featured_until) WHERE is_featured = true;
CREATE INDEX idx_restaurants_city       ON restaurants(city);
CREATE INDEX idx_restaurants_tags       ON restaurants USING GIN(tags);
CREATE INDEX idx_restaurants_cuisine    ON restaurants USING GIN(cuisine_types);
-- Full-text search index
CREATE INDEX idx_restaurants_fts ON restaurants
  USING GIN(to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || city));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Claims ───────────────────────────────────────────────────────────────────

CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE claims (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          claim_status NOT NULL DEFAULT 'pending',
  message         text,
  admin_note      text,
  reviewed_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX idx_claims_restaurant ON claims(restaurant_id);
CREATE INDEX idx_claims_user       ON claims(user_id);
CREATE INDEX idx_claims_status     ON claims(status);

-- ─── Reviews ─────────────────────────────────────────────────────────────────

CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE reviews (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating          smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           text,
  content         text NOT NULL,
  status          review_status NOT NULL DEFAULT 'pending',
  moderated_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  visit_date      date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user       ON reviews(user_id);
CREATE INDEX idx_reviews_status     ON reviews(status);

-- ─── Blog ─────────────────────────────────────────────────────────────────────

CREATE TABLE blog_posts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  content         text NOT NULL,
  excerpt         text,
  cover_image     text,
  author_id       uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  tags            text[] DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_slug        ON blog_posts(slug);
CREATE INDEX idx_blog_published   ON blog_posts(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_blog_tags        ON blog_posts USING GIN(tags);

-- ─── Restaurant submissions ───────────────────────────────────────────────────

CREATE TABLE restaurant_submissions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  data            jsonb NOT NULL,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_status ON restaurant_submissions(status);

-- ─── Jobs ─────────────────────────────────────────────────────────────────────

CREATE TYPE job_type AS ENUM ('offer', 'cv');

CREATE TABLE jobs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            job_type NOT NULL,
  title           text NOT NULL,
  description     text NOT NULL,
  restaurant_id   uuid REFERENCES restaurants(id) ON DELETE SET NULL,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location        text,
  contract_type   text,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_type        ON jobs(type);
CREATE INDEX idx_jobs_status      ON jobs(status);
CREATE INDEX idx_jobs_restaurant  ON jobs(restaurant_id);
CREATE INDEX idx_jobs_user        ON jobs(user_id);

-- ─── Analytics ────────────────────────────────────────────────────────────────

CREATE TYPE page_event_type AS ENUM ('view', 'click_website', 'click_phone', 'click_directions', 'click_map');

CREATE TABLE page_events (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type      page_event_type NOT NULL,
  session_id      text,
  referrer        text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Partition by month for performance (optional at scale)
CREATE INDEX idx_events_restaurant  ON page_events(restaurant_id);
CREATE INDEX idx_events_type        ON page_events(event_type);
CREATE INDEX idx_events_created     ON page_events(created_at);

-- ─── Subscriptions (Paddle) ───────────────────────────────────────────────────

CREATE TYPE subscription_plan   AS ENUM ('starter', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');

CREATE TABLE subscriptions (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id           uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  paddle_subscription_id  text NOT NULL UNIQUE,
  plan                    subscription_plan NOT NULL,
  status                  subscription_status NOT NULL,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user       ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_restaurant ON subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_status     ON subscriptions(status);

-- ─── Featured purchases (Paddle) ─────────────────────────────────────────────

CREATE TABLE featured_purchases (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id           uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  paddle_transaction_id   text NOT NULL UNIQUE,
  region_id               uuid REFERENCES regions(id) ON DELETE SET NULL,
  starts_at               timestamptz NOT NULL,
  ends_at                 timestamptz NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_featured_restaurant ON featured_purchases(restaurant_id);
CREATE INDEX idx_featured_ends_at    ON featured_purchases(ends_at);

-- ─── Messages ─────────────────────────────────────────────────────────────────

CREATE TYPE message_type AS ENUM ('modification_request', 'general', 'claim_message');

CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id   uuid REFERENCES restaurants(id) ON DELETE SET NULL,
  type            message_type NOT NULL,
  content         text NOT NULL,
  status          text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_user       ON messages(from_user_id);
CREATE INDEX idx_messages_restaurant ON messages(restaurant_id);
CREATE INDEX idx_messages_status     ON messages(status);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE restaurants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_purchases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;

-- Public read: restaurants (active), regions, blog posts (published), jobs (active)
CREATE POLICY "public_read_restaurants"  ON restaurants  FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_regions"      ON regions      FOR SELECT USING (true);
CREATE POLICY "public_read_blog"         ON blog_posts   FOR SELECT USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "public_read_jobs"         ON jobs         FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_reviews"      ON reviews      FOR SELECT USING (status = 'approved');

-- API (service role) bypasses RLS — used by NestJS with service_role key
-- All other write operations go through NestJS API (uses service_role key)
