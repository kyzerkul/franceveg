# France Veg — Guide Projet

## Projet
Meilleur annuaire vegan/végétarien de France. SEO-first. 6 phases.

## Stack
| Layer | Tech |
|-------|------|
| Backend | NestJS 11 + TypeScript |
| Frontend | Next.js **16.2.4** + React 19 + Tailwind 4 |
| Admin | Next.js **16.2.4** (subdomain `admin.domain.com`) |
| DB | Supabase (PostgreSQL) |
| Auth | Clerk |
| Paiements | Paddle |
| Analytics | PostHog |
| Monorepo | Turborepo + pnpm |

## Structure
```
france-veg/
├── apps/
│   ├── web/      # site public (domain.com)
│   ├── admin/    # dashboard admin (admin.domain.com)
│   └── api/      # NestJS REST API
├── packages/
│   ├── types/    # @france-veg/types — interfaces TS partagées
│   ├── db/       # @france-veg/db — client Supabase
│   └── utils/    # @france-veg/utils — slugify, SEO, date helpers
└── supabase/
    ├── migrations/  # SQL migrations
    └── seed/        # scripts import CSV
```

## Commandes

```bash
# Dev (tous les apps en parallèle)
pnpm dev

# Dev individuel
pnpm --filter web dev         # Next.js public → http://localhost:3000
pnpm --filter admin dev       # Next.js admin  → http://localhost:3001
pnpm --filter api start:dev   # NestJS API     → http://localhost:4000

# Build
pnpm build

# Install toutes les deps
pnpm install

# Supabase
supabase db push              # appliquer migrations
supabase gen types typescript --local > packages/db/src/types.ts
```

## Variables d'environnement

Créer `.env.local` dans chaque app :

**apps/web/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CLERK_SIGN_IN_URL=/connexion
CLERK_SIGN_UP_URL=/inscription
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

**apps/admin/.env.local**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
API_URL=http://localhost:4000
```

**apps/api/.env**
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PORT=4000
```

## Phases
1. **Phase 1** ✅ Foundation — monorepo, DB, Auth skeleton
2. **Phase 2** ✅ Restaurant directory core — pages, SEO, CSV import
3. **Phase 3** ✅ Comptes + avis — reviews, claim, analytics owner
4. **Phase 4** ✅ Blog + emploi
5. **Phase 5** Dashboard admin complet
6. **Phase 6** Monétisation Paddle

> Suivi détaillé → [SUIVI.md](./SUIVI.md)

## SEO — Règles critiques
- `generateMetadata()` sur **chaque** page Next.js
- `generateStaticParams()` → SSG pour tous les restaurants + régions
- JSON-LD `Restaurant` schema sur chaque page restaurant
- Canonical absolu sur chaque page
- `noindex` sur: `/dashboard`, `/connexion`, `/inscription`, admin
- Sitemap dynamique → `/sitemap.xml`

## URLs clés
```
/                               → Homepage
/restaurants                    → Listing (filtres)
/restaurants/[slug]             → Fiche restaurant
/region/[slug]                  → Page région (SEO)
/ville/[slug]                   → Page ville (SEO)
/ville/paris/[arr-slug]         → Page arrondissement Paris (SEO)
/blog                           → Blog
/blog/[slug]                    → Article
/emploi                         → Offres d'emploi
/soumettre-un-restaurant        → Formulaire soumission
/dashboard                      → Espace owner (privé)
```

## Important: Next.js 16
- `params` est un **Promise** → toujours `await params`
- Lire `node_modules/next/dist/docs/` avant d'utiliser une API

## Skills disponibles
- `/caveman` — réponses ultra-compressées (-75% tokens)
- `/ui-ux-pro-max` — design system generator
