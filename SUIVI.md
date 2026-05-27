# France Veg — Suivi d'implémentation

> Fichier de référence mis à jour à chaque session. Source de vérité sur l'état réel du code.

---

## Phase 1 — Foundation ✅ TERMINÉE

| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Monorepo Turborepo + pnpm | ✅ | `pnpm-workspace.yaml`, `turbo.json` |
| Schéma DB Supabase complet | ✅ | `supabase/migrations/001_init.sql` |
| Tables : restaurants, regions, users, reviews, claims, blog_posts, jobs, subscriptions, featured_purchases, messages | ✅ | `001_init.sql` |
| RLS activé sur toutes les tables | ✅ | `001_init.sql` |
| Package `@france-veg/types` | ✅ | `packages/types/src/index.ts` |
| Package `@france-veg/db` | ✅ | `packages/db/src/index.ts` |
| Package `@france-veg/utils` | ✅ | `packages/utils/src/index.ts` |
| Skeleton NestJS API | ✅ | `apps/api/src/` |

---

## Phase 2 — Restaurant Directory Core ✅ TERMINÉE

| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Homepage (hero, search, featured, villes, régions, CTA) | ✅ | `apps/web/src/app/page.tsx` |
| Listing restaurants + filtres + pagination | ✅ | `apps/web/src/app/restaurants/page.tsx` |
| Fiche restaurant (cover, galerie, avis, horaires, info card) | ✅ | `apps/web/src/components/restaurants/RestaurantDetail.tsx` |
| Page région SEO | ✅ | `apps/web/src/app/region/[slug]/page.tsx` |
| Page ville SEO | ✅ | `apps/web/src/app/ville/[slug]/page.tsx` |
| `generateMetadata()` sur toutes les pages | ✅ | toutes les pages |
| `generateStaticParams()` restaurants + régions | ✅ | pages dynamiques |
| JSON-LD Restaurant + BreadcrumbList | ✅ | `apps/web/src/lib/seo.ts` |
| Sitemap dynamique | ✅ | `apps/web/src/app/sitemap.ts` |
| robots.txt | ✅ | `apps/web/src/app/robots.ts` |
| Client API (`lib/api.ts`) | ✅ | `apps/web/src/lib/api.ts` |
| Helpers SEO (`lib/seo.ts`) | ✅ | `apps/web/src/lib/seo.ts` |
| `RestaurantCard` component | ✅ | `apps/web/src/components/ui/RestaurantCard.tsx` |
| NestJS `RestaurantsController` + `RestaurantsService` | ✅ | `apps/api/src/restaurants/` |
| NestJS `RegionsController` + `RegionsService` | ✅ | `apps/api/src/regions/` |
| Script import CSV | ✅ code prêt | `supabase/seed/import_restaurants.ts` |
| **Upload CSV restaurants en prod** | ⏳ EN ATTENTE | fichier CSV pas encore disponible |

---

## Phase 3 — Comptes + Avis + Claim + Analytics Owner ✅ TERMINÉE

### 3.1 Auth Clerk — sync users
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| `ClerkAuthGuard` NestJS (vérifie JWT) | ✅ | `apps/api/src/common/guards/clerk-auth.guard.ts` |
| `@ClerkUserId()` decorator | ✅ | `apps/api/src/common/decorators/clerk-user-id.decorator.ts` |
| Webhook Clerk → sync table `users` | ✅ | `apps/api/src/users/users.controller.ts` |
| `UsersService` (findByClerkId, upsert, delete) | ✅ | `apps/api/src/users/users.service.ts` |
| `ClerkProvider` dans layout web | ✅ | `apps/web/src/app/layout.tsx` |
| `clerkMiddleware` (protège /dashboard) | ✅ | `apps/web/src/middleware.ts` |
| Pages `/connexion` et `/inscription` (noindex) | ✅ | `apps/web/src/app/connexion/`, `/inscription/` |

### 3.2 Avis (Reviews)
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Endpoint POST `/api/reviews` (auth requise) | ✅ | `apps/api/src/reviews/` |
| Gestion doublons (conflict 409) | ✅ | `reviews.service.ts` |
| Formulaire avis sur fiche restaurant | ✅ | `apps/web/src/components/reviews/ReviewForm.tsx` |
| Modération avis (pending → approved) | ⬜ via admin Phase 5 | |

### 3.3 Claim restaurant
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Endpoint POST `/api/claims` (auth requise) | ✅ | `apps/api/src/claims/` |
| Page reclamer (refactorisée avec nouvelles routes) | ✅ | `apps/web/src/components/restaurants/ReclamerClient.tsx` |

### 3.4 Dashboard Owner
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Page `/dashboard` (noindex, auth requise) | ✅ | `apps/web/src/app/dashboard/page.tsx` |
| Vue liste mes restaurants | ✅ | `dashboard/page.tsx` |
| Endpoint GET `/api/users/me/restaurants` | ✅ | `apps/api/src/users/users.controller.ts` |
| Stats avancées (PostHog) | ⬜ Phase suivante | |

### 3.5 Soumission restaurant
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Page `/soumettre-un-restaurant` | ✅ | `apps/web/src/app/soumettre-un-restaurant/page.tsx` |
| Endpoint POST `/api/submissions` | ✅ | `apps/api/src/submissions/` |
| Soumission anonyme ou connecté | ✅ | `submissions.controller.ts` |

### Config à faire (manuellement)
| Tâche | Statut |
|-------|--------|
| Ajouter `NEXT_PUBLIC_API_URL` dans `apps/web/.env.local` | ⏳ |
| Ajouter vars Clerk redirect dans `apps/web/.env.local` | ⏳ |
| Configurer webhook Clerk → `POST /api/users/webhook` dans dashboard Clerk | ⏳ |
| `supabase db push` si pas encore fait | ⏳ |

---

## Phase 2bis — Enrichissement data Google ✅ TERMINÉE

> Data Google Maps (241 restaurants actifs importés).

### Schéma DB
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Migration 002 (attributes, popular_times, external_rating, google_place_id, topics, logo) | ✅ appliqué | `supabase/migrations/002_enrich_restaurants.sql` |
| Migration 003 (slug unique par region_id, pas global) | ✅ appliqué | `supabase/migrations/003_clean_slugs.sql` |

### Import data
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Script d'import XLS/XLSX (xlsx package) | ✅ | `supabase/seed/import_restaurants.ts` |
| Parse des JSON Google (attributes, topics, rating, work_time) | ✅ | id. |
| Auto-création régions (ville + arrondissements Paris depuis ZIP) | ✅ | id. |
| Extraction tags (vegan, bio, halal, brunch, terrasse, livraison…) | ✅ | id. |
| Skip auto `closed_forever` / `temporarily_closed` | ✅ | id. |
| Upsert par `google_place_id` (re-run safe) | ✅ | id. |
| **241 restaurants importés en local** | ✅ | |

### URLs SEO hiérarchiques ✅ TERMINÉES
| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Route `/restaurants/[city]/[slug]` (hors Paris) | ✅ | `apps/web/src/app/restaurants/[city]/[slug]/page.tsx` |
| Route `/restaurants/paris/[arr]/[slug]` (arrondissements) | ✅ | `apps/web/src/app/restaurants/paris/[arr]/[slug]/page.tsx` |
| Pages reclamer pour les 2 nouvelles routes | ✅ | `.../reclamer/page.tsx` (×2) |
| `generateStaticParams` (filtre Paris vs hors-Paris) | ✅ | dans chaque page |
| `sitemap.ts` mis à jour | ✅ | `apps/web/src/app/sitemap.ts` |
| `RestaurantCard` → liens avec `restaurantUrl()` | ✅ | `apps/web/src/components/ui/RestaurantCard.tsx` |
| `RestaurantDetail` composant partagé | ✅ | `apps/web/src/components/restaurants/RestaurantDetail.tsx` |
| `ReclamerClient` composant partagé | ✅ | `apps/web/src/components/restaurants/ReclamerClient.tsx` |
| Ancien `/restaurants/[slug]/` supprimé | ✅ | (pre-launch, pas de 301 nécessaire) |
| `region.type` ajouté au select `findAll` + `findFeatured` API | ✅ | `apps/api/src/restaurants/restaurants.service.ts` |

### Pages SEO automatiques ✅ TERMINÉES
| Page | Statut | Fichiers |
|------|--------|---------|
| `/restaurants/vegan`, `/restaurants/bio`, etc. (10 tags) | ✅ | `apps/web/src/app/restaurants/[city]/page.tsx` |
| Croisement ville × tag (`/ville/lyon/vegan`, etc.) auto-généré | ✅ | `apps/web/src/app/ville/[slug]/[tag]/page.tsx` |
| Config tags centralisée | ✅ | `apps/web/src/lib/tags.ts` |
| Endpoint `GET /api/restaurants/tag-coverage` | ✅ | `apps/api/src/restaurants/restaurants.controller.ts` |
| Sitemap inclut pages tags + ville×tag | ✅ | `apps/web/src/app/sitemap.ts` |
| `ImageWithFallback` (images cassées → emoji 🌿) | ✅ | `apps/web/src/components/ui/ImageWithFallback.tsx` |
| Filtre Street View dans script import | ✅ | `supabase/seed/import_restaurants.ts` |

### Features bonus (data Google)
| Feature | Statut |
|---------|--------|
| Badges tags visibles sur fiche restaurant | ⬜ |
| JSON-LD enrichi avec note Google (`aggregateRating`) | ⬜ |
| Heures d'affluence sur fiche (popular_times) | ⬜ |
| Section "Vous aimerez aussi" (depuis `people_also_search`) | ⬜ |
| Vue carte interactive avec lat/lng | ⬜ |
| Filtres avancés sur `/restaurants` (régime, ambiance, services) | ⬜ |

---

## Phase 4 — Blog + Emploi ✅ TERMINÉE

| Tâche | Statut | Fichiers |
|-------|--------|---------|
| Endpoint GET `/api/blog`, `/api/blog/slugs`, `/api/blog/:slug` | ✅ | `apps/api/src/blog/` |
| Page `/blog` (listing, pagination, filtres tag) | ✅ | `apps/web/src/app/blog/page.tsx` |
| Page `/blog/[slug]` (JSON-LD Article, generateStaticParams) | ✅ | `apps/web/src/app/blog/[slug]/page.tsx` |
| Endpoint GET `/api/jobs`, `/api/jobs/:id`, POST `/api/jobs` | ✅ | `apps/api/src/jobs/` |
| Page `/emploi` (listing, filtres type/ville/contrat) | ✅ | `apps/web/src/app/emploi/page.tsx` |
| Page `/emploi/[id]` (fiche offre) | ✅ | `apps/web/src/app/emploi/[id]/page.tsx` |
| Page `/emploi/proposer` (formulaire, auth requise) | ✅ | `apps/web/src/app/emploi/proposer/page.tsx` |
| Types blog + jobs dans `lib/api.ts` | ✅ | `apps/web/src/lib/api.ts` |

---

## Phase 5 — Dashboard Admin ✅ TERMINÉE

| Tâche | Statut | Fichiers |
|-------|--------|---------|
| App admin Next.js 16 — layout + Clerk auth + sidebar | ✅ | `apps/admin/src/app/(admin)/layout.tsx`, `Sidebar.tsx` |
| `AdminGuard` NestJS (vérifie JWT + `ADMIN_CLERK_IDS`) | ✅ | `apps/api/src/common/guards/admin.guard.ts` |
| `AdminService` — stats, restaurants, claims, reviews, users | ✅ | `apps/api/src/admin/admin.service.ts` |
| `AdminController` — routes `GET/PATCH` protégées | ✅ | `apps/api/src/admin/admin.controller.ts` |
| Server Actions Next.js (approve/reject/activate) | ✅ | `apps/admin/src/lib/actions.ts` |
| Client API admin (fetch avec token Clerk) | ✅ | `apps/admin/src/lib/api.ts` |
| Dashboard `/dashboard` — 4 stats cards | ✅ | `apps/admin/src/app/(admin)/dashboard/page.tsx` |
| Page restaurants — tableau + filtres + activer/désactiver | ✅ | `apps/admin/src/app/(admin)/restaurants/page.tsx` |
| Page claims — tableau + approuver/rejeter | ✅ | `apps/admin/src/app/(admin)/claims/page.tsx` |
| Page avis — liste + approuver/rejeter | ✅ | `apps/admin/src/app/(admin)/avis/page.tsx` |
| Page users — tableau | ✅ | `apps/admin/src/app/(admin)/users/page.tsx` |
| Page `/unauthorized` | ✅ | `apps/admin/src/app/unauthorized/page.tsx` |
| `clerkMiddleware` admin | ✅ | `apps/admin/src/middleware.ts` |

### Config requise
| Variable | Fichier |
|----------|---------|
| `ADMIN_CLERK_IDS=user_xxx` | `apps/admin/.env.local` + `apps/api/.env` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `apps/admin/.env.local` |
| `CLERK_SECRET_KEY` | `apps/admin/.env.local` |

---

## Phase 6 — Monétisation Paddle ⬜ À FAIRE

| Tâche | Statut |
|-------|--------|
| Intégration Paddle (webhooks, checkout) | ⬜ |
| Plans starter / pro (subscriptions) | ⬜ |
| Featured listings (mise en avant payante) | ⬜ |
| Page pricing | ⬜ |

---

## Légende
| Symbole | Sens |
|---------|------|
| ✅ | Terminé et mergé |
| 🚧 | En cours |
| ⏳ | Bloqué / en attente externe |
| ⬜ | À faire |
