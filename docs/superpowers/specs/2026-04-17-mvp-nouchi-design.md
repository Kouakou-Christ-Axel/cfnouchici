# MVP nouchi.ci — Spec de design
**Date :** 2026-04-17
**Statut :** Approuvé

---

## Hypothèse à valider

> La communauté ivoirienne (terrain + diaspora) veut une référence Nouchi citable, vivante et contrôlée depuis la Côte d'Ivoire — suffisamment pour la consulter, y contribuer, et la partager.

Trois signaux confirment l'hypothèse à J+90 :
1. **Consultation** : des gens arrivent, cherchent, trouvent, reviennent.
2. **Contribution** : des soumissions spontanées arrivent sans sollicitation.
3. **Citation** : au moins un média, blog ou créateur cite nouchi.ci comme source.

---

## Principe directeur

Le SEO est la priorité absolue. Chaque fiche mot doit être citable comme source académique ou journalistique. L'architecture technique sert cet objectif en premier.

---

## Stack existante

- Next.js 16 App Router + Turbopack
- Tailwind CSS 4, oklch theming (light/dark)
- PostgreSQL + Prisma (schéma complet avec votes, modération, logs)
- Better Auth (configuré, infra prête)
- Docker multi-stage, Dokploy sur VPS
- Preview feature Prisma : `fullTextSearchPostgres`

## État d'avancement au moment du spec

- Routes publiques existantes : `/`, `/mots`, `/mots/[slug]`, `/mots/lettre/[lettre]`, `/blog`, `/blog/[slug]`
- Dashboard modération : 8 pages livrées, routing isolé
- Share button avec Web Share API + UTM tracking
- 12 mots en base (seed dev uniquement, non utilisé en prod)

---

## Sessions MVP

### S1 — Recherche full-text

**Objectif :** Permettre à un visiteur de trouver un mot en moins de 3 secondes, même avec une faute de frappe ou sans accent.

**Périmètre :**
- Barre de recherche proéminente sur la homepage et `/dictionnaire`
- Fuzzy search via `pg_trgm` (trigrammes PostgreSQL) — tolérance aux accents et fautes de frappe
- Résultats en < 200ms côté serveur
- Suggestions en temps réel (debounce 300ms)
- Route : `GET /api/search?q=...`

**Hors périmètre :** recherche par catégorie/région (→ filtres `/dictionnaire`, future session)

---

### S2 — SEO fiches mots

**Objectif :** Chaque fiche mot doit être citable comme source. C'est la brique SEO la plus importante du projet.

**Périmètre :**
- `generateMetadata` complet sur `/mots/[slug]` : title, description, OpenGraph, Twitter Card
- JSON-LD `Schema.org DefinedTerm` sur chaque fiche :
  ```json
  {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": "goumin",
    "description": "Définition...",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Dictionnaire Nouchi — nouchi.ci",
      "url": "https://nouchi.ci"
    }
  }
  ```
- URL canonique propre (sans paramètres UTM dans le canonical)
- Correction metadata homepage (valeur dynamique depuis DB, pas "+400 mots" hardcodé)

---

### S3 — OG image dynamique

**Objectif :** Chaque mot partagé sur WhatsApp/Twitter/LinkedIn génère une image de prévisualisation reconnaissable.

**Périmètre :**
- Route `src/app/mots/[slug]/opengraph-image.tsx` via `next/og` + `ImageResponse`
- Style : minimal typographique
  - Fond blanc/sombre selon thème (version unique, fond sombre)
  - Mot en grand (64-72px, bold)
  - Définition courte tronquée à 100 caractères (24px)
  - Logo / nom "nouchi.ci" en bas à droite
- Dimensions : 1200×630px
- Cache `revalidate` aligné sur la fiche mot

---

### S4 — Sitemap & robots

**Objectif :** Garantir l'indexation complète par les moteurs de recherche dès le lancement.

**Périmètre :**
- `src/app/sitemap.ts` dynamique : génère une entrée par mot validé + pages statiques
- `src/app/robots.ts` : autoriser tout sauf `/dashboard/`, `/admin/`, `/api/`
- `lastModified` sur chaque entrée sitemap basé sur `updatedAt` du mot
- Priorité : fiches mots = 0.8, homepage = 1.0, liste = 0.6

---

### S5 — Page /a-propos

**Objectif :** Donner une identité au projet, corriger le lien mort dans la nav.

**Périmètre :**
- Route `/a-propos` avec : mission, contexte culturel, équipe (Axel), comment contribuer
- Metadata SEO de base
- Lien dans `navigation.ts` déjà présent — plus de 404

---

### S6 — Auth publique

**Objectif :** Permettre à un utilisateur de s'inscrire et se connecter pour pouvoir soumettre des mots.

**Périmètre :**
- Pages publiques : `/connexion`, `/inscription` (Better Auth infrastructure déjà configurée)
- Provider : Google OAuth (principal) + magic link email via Resend (secours)
- Question provenance posée **une seule fois** après la première inscription :
  - 🇨🇮 Terrain (Côte d'Ivoire) / ✈️ Diaspora / 🌍 Autre
  - Stockage : champ `provenance` sur le modèle `User`
- Redirection post-connexion vers la page d'origine
- Protection des routes `/soumettre` et `/mon-espace/*`

**Hors périmètre :** email de bienvenue, onboarding, profil public

---

### S7 — Soumission de mot

**Objectif :** Permettre à un utilisateur connecté de proposer un mot au dictionnaire.

**Périmètre :**
- Route `/soumettre` (protégée par auth)
- Formulaire avec :
  - Champs obligatoires : mot, définition, 1 exemple
  - Champs optionnels : phonétique, catégorie, région, origine, variantes
- Prévisualisation avant envoi (rendu côté client de la fiche)
- Soumission → crée un `Mot` avec statut `EN_ATTENTE`
- Confirmation + redirection vers `/mon-espace/soumissions`
- Email d'accusé de réception via Resend

---

### S8 — Mes soumissions

**Objectif :** Permettre à un contributeur de suivre le statut de ses soumissions.

**Périmètre :**
- Route `/mon-espace/soumissions` (protégée)
- Liste des mots soumis avec statut : `EN_ATTENTE` / `VALIDE` / `REJETE`
- Motif de rejet visible si rejeté
- Lien vers la fiche publiée si validé
- Pagination si > 20 soumissions

---

### S9 — Workflow modération

**Objectif :** Permettre à un admin de valider, éditer ou rejeter les soumissions avec traçabilité.

**Périmètre :**
- File d'attente `/dashboard/moderation` triée par date ASC (plus ancien en premier)
- Actions par soumission :
  - **Valider** : statut → `VALIDE`, mot visible publiquement
  - **Éditer et valider** : modifier la définition/exemples avant publication
  - **Rejeter** : statut → `REJETE` + motif obligatoire (champ texte libre)
- Email de notification au contributeur (Resend) pour validation et rejet
- `LogModeration` créé à chaque action (modèle Prisma existant)
- Rôle requis : `ADMIN` ou `MODERATEUR`

**Existant :** dashboard shell + routing déjà en place — compléter le workflow

---

### S10 — API publique v1

**Objectif :** Permettre à des développeurs et médias de consommer le dictionnaire programmatiquement.

**Périmètre :**
- Endpoints read-only :
  - `GET /api/v1/mots` — liste paginée (cursor-based), mots validés uniquement
  - `GET /api/v1/mots/[slug]` — fiche complète avec exemples
  - `GET /api/v1/search?q=...` — recherche full-text
- Format réponse : JSON avec `data`, `meta` (pagination), `error`
- Rate limit : 100 req/h par IP (middleware Next.js)
- En-tête `X-Source: nouchi.ci` dans chaque réponse
- CORS ouvert (`*`)
- Page `/api` avec documentation minimale (OpenAPI ou markdown)

---

## Contenu éditorial (hors sessions techniques)

- **100 mots soignés** saisis via le dashboard avant ouverture publique — non négociable
- Répartition : 40 mots courants, 30 expressions, 20 verbes, 10 interjections
- Chaque mot : définition claire + 1 exemple minimum + catégorie + origine/étymologie

---

## Critères de succès

### Techniques (à J-0)
- Lighthouse mobile ≥ 90 sur homepage, /dictionnaire, /mots/[slug]
- FCP < 1.5s sur 3G simulée
- Recherche < 200ms côté serveur
- Zéro lien 404 dans la nav
- HTTPS, HSTS, CSP configurés

### Produit (à J+30)
- 100 mots validés à l'ouverture
- Parcours "chercher → trouver → comprendre" testé sur 5 personnes sans aide
- Parcours "soumettre un mot" < 3 minutes chrono

### Adoption (à J+90)
- Minimum : 500 visiteurs uniques/mois, 10 soumissions validées, 1 citation externe
- Objectif : 2000 visiteurs/mois, 50 soumissions, 3 citations
- Signal fort : mention média ivoirien tier 1

---

## Ce qui est HORS MVP (→ V1.5+)

| Fonctionnalité | Cible |
|----------------|-------|
| Votes publics (activer quand >500 users actifs) | V1.5 |
| Gamification (points, badges, niveaux) | V1.5 |
| Contributions qualitatives sur fiches | V1.5 |
| Interface anglaise | V2 |
| Audio communautaire | V2 |
| App mobile native | V3 |

**Note :** Le schéma Prisma garde tous les champs pour éviter une migration lourde. Seule l'UI les masque.
