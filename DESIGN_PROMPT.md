# PROMPT DE REDESIGN COMPLET — FRANCE VEG
> Document de référence pour refaire le design de zéro, page par page.
> **Aucun contenu ne change. Seul le design est refait.**

---

## 0. CONTEXTE ET OBJECTIFS

France Veg est un annuaire SEO-first des restaurants vegan et végétariens en France.
Le design actuel est fonctionnel mais générique : gris + vert basique, aucune personnalité visuelle, aucune stratégie de rétention.

### Objectifs du redesign
1. Créer une identité visuelle forte, organique et premium
2. **Maximiser le temps passé sur les pages restaurant** — les infos de contact et le lien site web sont relégués tout en bas de page
3. Donner envie d'explorer : suggestions, galeries, articles liés
4. Interface cohérente sur toutes les pages, responsive mobile-first

---

## 1. DESIGN SYSTEM

### 1.1 Palette de couleurs

```css
/* ── Verts principaux ── */
--color-green-900: #1B4332;   /* Footer, fonds sombres */
--color-green-800: #2D6A4F;   /* Vert principal — boutons, titres forts */
--color-green-600: #40916C;   /* Vert intermédiaire — hover, accents */
--color-green-400: #74C69D;   /* Vert clair — icônes, décorations */
--color-green-100: #D8F3DC;   /* Fond vert très clair — surfaces */
--color-green-50:  #F0FDF4;   /* Fond quasi blanc verdâtre */

/* ── Oranges secondaires ── */
--color-orange-600: #E05B35;   /* Orange foncé — hover boutons CTA */
--color-orange-500: #F4845F;   /* Orange principal — CTAs secondaires */
--color-orange-200: #FCDCCC;   /* Orange clair — backgrounds badges */
--color-orange-50:  #FFF5F0;   /* Orange très clair — surfaces */

/* ── Blanc ivoire / or (couleur tertiaire) ── */
--color-ivory:      #FDF6EC;   /* Fond général du site, chaud et organique */
--color-cream:      #FAF3E0;   /* Fond cards, sections alternées */
--color-gold:       #D4A853;   /* Or doux — badges "mis en avant", étoiles */
--color-gold-light: #FEF3C7;   /* Or très clair — fond badges gold */

/* ── Textes ── */
--color-text-primary:   #1A1A2E; /* Near-black avec teinte navy */
--color-text-secondary: #4B5563; /* Gris moyen */
--color-text-muted:     #9CA3AF; /* Gris clair */

/* ── Interfaces ── */
--color-border:     #E5E7EB;   /* Bords de cards et inputs */
--color-border-green: #A7F3D0; /* Bords verts au hover */
```

### 1.2 Typographie

```
Titres display (H1 héros) : "Playfair Display" ou "Fraunces" — serif élégant
Titres section (H2, H3)   : "Plus Jakarta Sans" — sans-serif moderne
Corps de texte             : "Inter" — très lisible, neutre
```

Import Google Fonts (à ajouter dans layout.tsx) :
```
Playfair_Display:wght@400;600;700;800
Plus_Jakarta_Sans:wght@400;500;600;700
Inter:wght@400;500;600
```

Échelle typographique :
```
Display hero  : 56-72px / font-weight 800 / line-height 1.1
H1 page       : 36-48px / font-weight 700 / line-height 1.2
H2 section    : 28-32px / font-weight 700 / line-height 1.3
H3 carte      : 18-20px / font-weight 600 / line-height 1.4
Corps         : 16px    / font-weight 400 / line-height 1.7
Caption       : 13-14px / font-weight 400
```

### 1.3 Effets visuels

**Border radius :**
- Cards/panels : `rounded-2xl` (16px)
- Boutons larges : `rounded-full`
- Boutons rectangulaires : `rounded-xl` (12px)
- Inputs : `rounded-xl` (12px)
- Petits badges/tags : `rounded-full`
- Images : `rounded-2xl`

**Ombres :**
```css
--shadow-xs  : 0 1px 2px rgba(0,0,0,0.04);
--shadow-sm  : 0 2px 8px rgba(0,0,0,0.06);
--shadow-md  : 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
--shadow-lg  : 0 12px 32px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.04);
--shadow-xl  : 0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06);
--shadow-green: 0 8px 24px rgba(45,106,79,0.18);  /* ombre colorée verte */
--shadow-orange: 0 8px 24px rgba(240,132,95,0.22); /* ombre colorée orange */
```

**Transitions :**
```css
/* Standard */
transition: all 0.25s ease;
/* Lent (hover cards) */
transition: transform 0.3s ease, box-shadow 0.3s ease;
/* Rapide (états focus) */
transition: all 0.15s ease;
```

**Animations hover cards :**
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

**Fonds texturés :**
- Sections ivoire : `background: var(--color-ivory)` avec motif SVG discret de petites feuilles (opacité 3-5%)
- Hero : gradient radial `from-green-900 via-green-800 to-green-700`

---

## 2. COMPOSANTS GLOBAUX

### 2.1 Navbar (à créer — absente actuellement du root layout)

**Desktop :**
- Fond `white/90` avec `backdrop-blur-md` quand scrollé, transparent en haut du héros
- Padding horizontal `px-6`, hauteur `h-16`
- Gauche : Logo (feuille SVG verte + "France Veg" en Plus Jakarta Sans bold)
- Centre : liens nav `Restaurants | Blog | Emploi | Villes` — underline animé vert au hover
- Droite : bouton ghost "Se connecter", bouton orange pill "Soumettre un restaurant"
- Border bottom `border-b border-gray-100` au scroll
- `position: sticky top-0 z-50`

**Mobile :**
- Hamburger menu → drawer latéral depuis la droite
- Fond vert forêt `#2D6A4F`, liens en blanc
- Logo en haut du drawer

### 2.2 Footer

**Layout 4 colonnes sur desktop, 2×2 sur tablet, empilé sur mobile :**

Colonne 1 : Brand
- Logo large + tagline "Le meilleur annuaire vegan & végétarien de France"
- Icônes réseaux sociaux (Instagram, Facebook, TikTok) — ronds verts au hover

Colonne 2 : Explorer
- Liens : Tous les restaurants, Paris, Lyon, Marseille, Bordeaux, Nantes

Colonne 3 : Contenu
- Blog, Offres d'emploi, Soumettre un restaurant, Réclamer une fiche

Colonne 4 : Légal
- À propos, Mentions légales, Politique de confidentialité, Contact

**Style footer :**
- Fond `#1B4332` (vert forêt très foncé)
- Texte `#D1FAE5` (vert très clair)
- Liens hover `#74C69D`
- Border-top `1px solid rgba(255,255,255,0.08)`
- Copyright bar en bas avec fond légèrement plus sombre

### 2.3 RestaurantCard (composant réutilisable)

Dimensions : 100% width, hauteur auto

**Image :**
- Ratio 16:9 → `aspect-video`
- `object-cover` avec `overflow-hidden rounded-t-2xl`
- Au hover : `scale(1.06)` avec `transition-transform duration-500`
- Overlay gradient `from-black/0 to-black/30` en bas de l'image
- Badge "Mis en avant" `top-3 left-3` → fond or `#D4A853`, texte blanc, petite étoile, `rounded-full px-2.5 py-1 text-xs font-semibold`
- Badge type (vegan/végé) `top-3 right-3` → fond vert clair, texte vert

**Corps de card :**
- Fond `white`
- Border `border border-gray-100`
- Hover : `border-green-200`
- Toute la card : `shadow-sm` → hover `shadow-lg` + `translateY(-4px)`
- `rounded-2xl overflow-hidden`

**Contenu :**
- Nom : `font-semibold text-gray-900 text-base` → hover `text-green-800`
- Ville : icône MapPin vert + texte gris
- Étoiles : remplissage or `#D4A853`, avec score et nombre d'avis
- Prix : `€` répété, gris
- Tags : pills vert clair très petites `bg-green-50 text-green-700 rounded-full px-2 py-0.5 text-xs`
- Bas : ligne fine grise + "Voir la fiche →" en vert au hover

### 2.4 Breadcrumb

Fond transparent, texte `text-gray-400`, séparateur `/` ou chevron, dernier item `text-gray-700`.
Hover → `text-green-600`. Padding vertical `py-3`.

### 2.5 Badges de statut

- Actif / Ouvert : fond `#DCFCE7`, texte `#166534`, point animé (pulse) vert
- En attente : fond `#FEF3C7`, texte `#92400E`
- Fermé / Rejeté : fond `#FEE2E2`, texte `#991B1B`

### 2.6 Étoiles notation

- Remplissage : dégradé `from-amber-400 to-yellow-400` (ou `fill-amber-400`)
- Vides : `fill-gray-200`
- 3 tailles : `sm` (12px listing), `md` (16px cards), `lg` (20px fiche détail)

---

## 3. PAGE D'ACCUEIL (`/`)

### 3.1 Section Hero

**Fond :** Gradient radial `from-green-900 via-green-800 to-emerald-700`, avec en overlay un motif SVG subtil de feuilles/branches (opacité 8%), et une image photo de restaurant végétarien chaleureux en `position: absolute` avec `opacity-20 mix-blend-overlay`.

**Contenu centré :**
- Badge de confiance : `bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5` → icône feuille + "500+ restaurants vegan en France"
- H1 en Playfair Display 64px blanc : "Les meilleurs restaurants" — retour ligne — `<span color="#F4845F">vegan & végétariens</span>` en France
- Sous-titre Inter 18px `text-green-100` : "Fiches complètes, avis certifiés, horaires en temps réel."
- Barre de recherche : card blanche avec ombre, padding `p-2`, flex row :
  - Input recherche (icône Search) flex-1
  - Séparateur vertical
  - Input ville (icône MapPin) w-48
  - Bouton vert `bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold`
- Trust signals row : 3 items séparés par `·` — "500+ restaurants" / "Avis vérifiés" / "100% gratuit"

**Bas du hero :** wave SVG blanc arrondi pour transition naturelle vers la suite.

### 3.2 Section Restaurants mis en avant

- Fond blanc
- Header : trait vertical vert 3px à gauche + H2 "Sélection de la semaine" + lien "Voir tous →" en vert
- Grid 3 colonnes responsive → RestaurantCard premium
- Si vide : masquée

### 3.3 Section Villes populaires

- Fond `var(--color-ivory)` avec motif feuilles discret
- H2 centré avec icône MapPin vert
- Grid 4 colonnes (desktop) / 2 (mobile)
- Chaque card : fond blanc, bord `border-gray-100`, rounded-2xl, padding `p-4`
  - Emoji 2.5rem
  - Nom ville bold
  - "N restaurants" gris
  - Hover : border vert + fond vert-50 + translateY(-2px)

### 3.4 Section Par région

- Fond blanc
- Chips pills cliquables : fond vert-50, texte vert-700, hover fond vert-100
- Scroll horizontal sur mobile

### 3.5 Section CTA propriétaire (split design)

- 2 colonnes égales sur desktop, empilées sur mobile
- Gauche : fond vert-800, padding généreux — H2 blanc, description, icônes bénéfices (gratuit ✓, publié sous 48h ✓, visible partout ✓), bouton orange `bg-orange-500 hover:bg-orange-600 text-white`
- Droite : photo d'ambiance restaurant chaleureux, `object-cover`, légèrement arrondie seulement côté droit

### 3.6 Section Blog preview

- Fond ivory
- H2 + 3 cards articles en grid
- Chaque card : image, tags, titre, extrait, date, auteur
- Bouton "Voir tous les articles" centré

### 3.7 Section Chiffres clés

- 3-4 stats : "500+ restaurants", "1 000+ avis", "20 régions", "100% gratuit"
- Fond vert-900 sombre
- Chiffres en Playfair Display 48px blanc, labels en vert-300

---

## 4. PAGE LISTING RESTAURANTS (`/restaurants`)

### Header

- Section héro mini : fond vert-50 → blanc via gradient, padding `py-12`
- H1 "Restaurants vegan & végétariens {ville|en France}" en Plus Jakarta Sans
- Compteur en vert "N adresses trouvées"

### Filtres

**Barre principale :**
- `bg-white rounded-2xl shadow-md border border-gray-100 p-4` sticky sous la navbar
- Ligne 1 : input recherche (loupe, flex-1) + input ville (mappin) + bouton "Filtrer" vert
- Ligne 2 : chips de tags horizontales scrollables — état actif : fond vert + texte blanc, inactif : bord gris + hover vert

**Filtres avancés (dropdown collapsible) :**
- "Type de cuisine" (checkboxes)
- "Fourchette de prix" (€ à €€€€)
- "Régime" (vegan / végétarien / végétalien / sans gluten / bio)
- Bouton "Réinitialiser" ghost

### Grid

- 3 colonnes desktop / 2 tablet / 1 mobile
- `gap-6`
- RestaurantCard premium

### Pagination

- Pills numérotées centrées + "Précédent" / "Suivant"
- Page active : fond vert, texte blanc
- Style : `border rounded-xl px-3 py-1.5 text-sm`

---

## 5. PAGE RESTAURANT DÉTAIL (`/restaurants/[city]/[slug]`)
### ⚠️ PAGE LA PLUS IMPORTANTE — STRATÉGIE DE RÉTENTION MAX

**Objectif absolu : garder l'utilisateur le plus longtemps possible sur la page.**
**RÈGLE : Le lien vers le site web du restaurant et toutes les infos de contact SONT TOUT EN BAS DE PAGE UNIQUEMENT. Ils ne doivent JAMAIS apparaître dans la sidebar sticky ni dans le premier tiers de la page.**

### Structure globale

```
[Breadcrumb]
[Hero image pleine largeur + overlay titre]
[Mini info bar sticky]
─────────────────────────────────────────────
[ COLONNE PRINCIPALE 2/3 ]  [ SIDEBAR 1/3 ]
─────────────────────────────────────────────
[Section 1 : Description]   [Statut ouvert]
[Section 2 : Galerie photo] [Horaires]
[Section 3 : Avis + Form]   [Tags cuisine]
[Section 4 : Restos voisins][Map embed]
[Section 5 : Articles liés] [Bouton itinéraire]
─────────────────────────────────────────────
[SECTION CONTACT EN BAS DE PAGE — fond ivoire]
[Adresse | Tél | Site web | Email]
```

### 5.1 Hero image

- Hauteur `h-72 sm:h-96` pleine largeur (max-w-none)
- `object-cover`
- Overlay gradient `from-transparent via-black/20 to-black/60`
- Sur l'image en bas : nom du restaurant (H1 blanc Playfair 42px), étoiles + nb avis, ville
- Badge "Mis en avant" si applicable, en or

### 5.2 Mini info bar

- `sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm`
- Contenu : Type cuisine | `€€€` | "Ouvert maintenant" (badge vert animé) ou "Fermé" (badge rouge)
- Sur mobile : scroll horizontal

### 5.3 Section Description

- Texte complet du restaurant
- Style `prose prose-green` avec Inter 17px, line-height 1.8
- Encadré highlight ivoire pour la description courte si existante

### 5.4 Section Galerie photos

- Si 2+ images : grid masonry 2-3 colonnes
- Images avec `rounded-xl overflow-hidden aspect-[4/3] object-cover`
- Hover : overlay sombre léger + icône loupe
- Click → lightbox modale (fond noir, navigation prev/next, fermeture ×)
- Si 6+ images : bouton "+ Voir toutes les photos" (N)

### 5.5 Section Avis

**Résumé visuel :**
- Score global en grand (ex: "4.3 / 5") avec Playfair Display 56px vert
- Barre de distribution 5→1 étoiles avec barres de progression orange

**Cards d'avis :**
- Fond blanc, bord léger, `rounded-2xl p-5`
- Avatar : initiales colorées (chaque couleur dérivée du nom) dans cercle
- Nom + date en meta grise
- Étoiles + titre de l'avis
- Texte avec `line-clamp-4` et "Lire la suite" si long

**Formulaire d'avis :**
- Section séparée avec fond vert-50
- Titre "Partagez votre expérience"
- Étoiles interactives (grand format, 32px)
- Si non connecté : card invitation élégante avec bouton vert "Se connecter pour noter"

### 5.6 Section Restaurants similaires

- H2 "Dans le même esprit" ou "Autres adresses à {ville}"
- Scroll horizontal de cards (3 visibles desktop, 1.5 mobile)
- RestaurantCard format compact (image + nom + ville + étoiles)
- Flèches prev/next

### 5.7 Section Articles liés (blog)

- H2 "À lire aussi"
- 2-3 cards articles du blog liés à la ville ou au type de cuisine
- Format compact : image 16:9 + tag + titre

### 5.8 Sidebar (sticky `top-20`)

```
┌────────────────────────────┐
│ 🟢 Ouvert maintenant        │ ← badge animé
│ Ferme à 22h30              │
│ ─────────────────────────  │
│ Lun 12h–14h | 19h–22h30   │ ← horaires compacts
│ Mar ...                    │
│ ...                        │
│ ─────────────────────────  │
│ 🍽 Cuisine française        │ ← type cuisine
│ 🌱 Vegan · Bio             │ ← régimes
│ 💰 Prix : €€               │ ← prix
│ ─────────────────────────  │
│ [MAP EMBED 200px]          │ ← Google Maps static
│ ─────────────────────────  │
│ 🗺 Y aller (Google Maps)   │ ← bouton vert plein
│ 🚗 Ouvrir dans Waze        │ ← bouton ghost
│ ─────────────────────────  │
│ Vous êtes propriétaire ?   │ ← lien ghost petit
└────────────────────────────┘
```

Style : `bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4`

**IMPORTANT :** Aucun lien vers le site web du restaurant dans la sidebar.

### 5.9 Section Contact (tout en bas — fond ivoire)

C'est la SEULE section où les infos de contact et lien site web apparaissent.

- Fond `var(--color-cream)` avec bord top vert subtil
- H2 "Informations pratiques" (discret, pas too-prominent)
- Grid 2-3 colonnes :
  - 📍 Adresse complète (copiable au click)
  - 📞 Téléphone (lien `tel:`, clic pour appeler sur mobile)
  - ✉️ Email si disponible
  - 🌐 Site web : bouton **outline** (non rempli) discret avec mention "(quitte France Veg)" en micro-texte
  - 🍽 Réserver / Commander : bouton **outline orange** discret (non proéminent)
- Lien "Signaler une erreur sur cette fiche" très discret

---

## 6. PAGES VILLE (`/ville/[slug]`) ET RÉGION (`/region/[slug]`)

### Hero mini

- Section `bg-gradient-to-r from-green-800 to-green-700 py-16 px-4`
- H1 blanc "Restaurants vegan à {ville/région}"
- Sous-titre : "N adresses · Avis certifiés · Fiches complètes"
- Breadcrumb blanc/transparent au-dessus

### Arrondissements Paris

- Grid 5 colonnes, cards pill avec hover vert
- Compteur par arrondissement si disponible

### SEO text

- Fond ivory, padding généreux
- Texte en prose soignée Inter, pas en block gris terne

### Grid restaurants

- RestaurantCard premium, identique listing

### Section "Villes voisines" / "Explorer aussi"

- Chips scrollables horizontalement
- Style pills verts

---

## 7. PAGE BLOG — LISTING (`/blog`)

### Hero

- Fond ivory avec motif SVG botanique discret
- Icône BookOpen vert + H1 "Le blog vegan & végétarien"
- Sous-titre
- Filtre par tag : chips horizontales

### Article vedette (premier article)

- Layout 2 colonnes : image gauche (60%) + contenu droite (40%)
- Image grande `rounded-2xl`, tags, H2 large, extrait, date + auteur + bouton "Lire"
- `bg-white rounded-3xl shadow-md overflow-hidden`

### Grid articles

- 3 colonnes desktop / 2 tablet / 1 mobile
- Cards : image 16:9, tags pill, H3, extrait line-clamp-2, meta date+auteur
- Hover : translateY(-4px) + shadow-lg

### CTA Newsletter

- Fond vert-800, centré, H2 blanc, input email + bouton orange "S'abonner"

---

## 8. PAGE ARTICLE BLOG (`/blog/[slug]`)

### Hero article

- Image pleine largeur `h-80 sm:h-96`
- Overlay gradient bas
- Tags, H1 blanc 48px Playfair, auteur + date + "X min de lecture" en blanc/semi-transparent

### Layout article

- Colonne principale `max-w-3xl mx-auto` avec sidebar TOC sticky à droite (desktop)
- Sidebar TOC : titres H2/H3 de l'article, item actif surligné vert
- Corps article :
  - `prose prose-lg prose-green`
  - Blocs citation : `border-l-4 border-orange-400 bg-orange-50 italic pl-5 py-2 rounded-r-xl`
  - Mise en avant : `bg-green-50 border border-green-200 rounded-xl p-5`
- Partage : row d'icônes sociales (Twitter/X, Facebook, LinkedIn, copier lien)

### Fin d'article

- Section "À propos de l'auteur" : avatar, nom, bio courte
- CTA newsletter : fond ivory, titre, input email + bouton
- Section "Articles recommandés" : 3 cards grid

---

## 9. PAGE EMPLOI — LISTING (`/emploi`)

### Hero

- Fond `bg-gradient-to-br from-green-800 to-green-700 py-14`
- H1 blanc + compteur
- Bouton orange "Déposer une annonce" proéminent à droite

### Filtres

- Tabs "Tout | Offres | CVs" avec compteurs badge
- Input localisation + select contrat en ligne
- Bouton filtrer

### Cards emploi

- Layout liste verticale
- Chaque card : `rounded-2xl bg-white border shadow-sm hover:shadow-md hover:border-green-200 p-5`
- Logo restaurant (ou placeholder Briefcase dans cercle vert-50)
- Badge type (offre bleue / CV violet)
- Badge contrat (gris)
- Titre H3 → hover vert
- Meta : restaurant + ville + date
- Hover : "Voir l'annonce →" apparaît à droite

---

## 10. PAGE EMPLOI DÉTAIL (`/emploi/[id]`)

### Layout 2 colonnes

**Colonne principale :**
- Breadcrumb
- Badges type + contrat
- H1 grand
- Meta row : lieu + date publication + expiration si proche (orange)
- Description richement typographiée en prose Inter

**Sidebar :**
- Card restaurant associé : image + nom + ville + lien "Voir la fiche"
- Card "Publié par" : nom
- CTA vert : "Cette offre vous intéresse ? Contactez l'employeur"
- Bouton "Déposer ma propre annonce" orange outline

---

## 11. FORMULAIRES

### `/soumettre-un-restaurant` et `/emploi/proposer`

**Principe Stepper :**
- Indicateur d'étapes en haut : 3-4 étapes numérotées avec labels
- Étape active : cercle vert plein ; passée : cercle vert avec ✓ ; future : cercle gris
- Transition fluide entre étapes avec `fade + slide`

**Style des inputs :**
- `bg-white border border-gray-200 rounded-xl px-4 py-3`
- Focus : `ring-2 ring-green-400 border-green-400`
- Label flottant au focus (`floating label pattern`)
- Icône décorative gauche si applicable (mappin pour ville, etc.)

**Chips toggle (tags, cuisines) :**
- Inactif : `border-gray-200 text-gray-600 bg-white`
- Actif : `bg-green-600 border-green-600 text-white`
- Transition `all 0.2s ease`

**Bouton submit :**
- Pleine largeur, `rounded-xl py-4`
- Fond vert-800 → hover vert-700
- État loading : spinner animé + texte "En cours..."
- État succès : ✓ + animation confetti légère

---

## 12. DASHBOARD (`/dashboard`)

### Header

- Wave vert-50 → blanc, salutation personnalisée H1 avec prénom
- Avatar initiales colorées (cercle 48px)
- Sous-titre gris

### Stats cards (si données disponibles)

- 3-4 cards horizontales : vues fiche / nb avis / note moyenne / dernière activité
- Fond blanc, ombre subtile, icône vert

### Liste mes restaurants

- Cards plus grandes que la liste publique
- Badge statut coloré (actif/attente/rejeté)
- Actions : "Voir la fiche" + "Modifier" (si implémenté)

### Empty state

- Illustration SVG plante/feuille dessinée à la main (style organic)
- Message bienveillant
- 2 CTA : "Soumettre mon restaurant" (vert) + "Chercher ma fiche existante" (outline)

---

## 13. PAGE 404

- Fond ivory avec motif botanique discret
- Grande illustration SVG : plante avec feuille tombée, style dessiné
- "Oups, page introuvable" en Playfair Display
- Message humain et bienveillant
- 2 CTA : "Retour à l'accueil" (vert) + "Chercher un restaurant" (outline)
- Liste de 3-4 liens populaires sous forme de chips verts

---

## 14. MICRO-INTERACTIONS ET DETAILS

### Loading states

- Skeleton shimmer sur RestaurantCard pendant chargement
- `bg-gray-200 animate-pulse rounded` sur les placeholders

### Toast / notifications

- Succès : fond vert-50, bord vert-400, texte vert-800, icône ✓
- Erreur : fond red-50, bord red-400
- Position : `fixed bottom-4 right-4 z-50`
- Animation : slide depuis le bas + fade out après 4s

### Scrollbar

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #40916C; border-radius: 3px; }
```

### Focus visible (accessibilité)

```css
:focus-visible { outline: 2px solid #40916C; outline-offset: 2px; }
```

### Impression générale

- Chaque section a un fond légèrement différent (blanc → ivory → white → green-50) pour créer un rythme visuel
- Séparateurs de sections : wave SVG doux OU simple gradient 12px
- Photos : toujours `object-cover`, jamais déformées
- Jamais de bleu ! La palette est vert + orange + ivory uniquement.

---

## 15. GLOBALS CSS — VARIABLES À DÉFINIR

```css
@import "tailwindcss";

:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  --color-green-900: #1B4332;
  --color-green-800: #2D6A4F;
  --color-green-600: #40916C;
  --color-green-400: #74C69D;
  --color-green-100: #D8F3DC;
  --color-green-50:  #F0FDF4;

  --color-orange-600: #E05B35;
  --color-orange-500: #F4845F;
  --color-orange-50:  #FFF5F0;

  --color-ivory:  #FDF6EC;
  --color-cream:  #FAF3E0;
  --color-gold:   #D4A853;

  --color-text:   #1A1A2E;

  --shadow-card: 0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  --shadow-hover: 0 16px 36px rgba(0,0,0,0.11), 0 6px 12px rgba(0,0,0,0.05);
  --shadow-green: 0 8px 24px rgba(45,106,79,0.18);
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: #fff;
}

h1, h2 { font-family: var(--font-heading); }
.display { font-family: var(--font-display); }
```

---

## 16. NOTES TECHNIQUES

- Stack : Next.js 16 + Tailwind 4 + React 19 — utiliser les classes utilitaires Tailwind normalement
- Images : toujours `next/image` avec `fill` ou dimensions explicites
- Animations légères : `framer-motion` recommandé pour les transitions de pages et animations d'apparition (`whileInView`, `initial/animate`)
- Maps : Google Maps Embed API (iframe statique) dans la sidebar restaurant, lien "Y aller" → `https://www.google.com/maps/dir/?api=1&destination=ADRESSE`
- Lightbox photos : `yet-another-react-lightbox` (léger, accessible)
- Ne jamais mettre `noindex` sur les pages publiques restaurants, villes, régions, blog
- Toutes les pages gardent leurs `generateMetadata()` et JSON-LD existants

---

*Fin du document de redesign — France Veg*
*Généré le 22 mai 2026*
