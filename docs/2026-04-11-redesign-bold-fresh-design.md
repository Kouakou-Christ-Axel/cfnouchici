# Redesign "Bold & Fresh" — Spec

Refonte complète du design de Nouchici. Direction : moderne, jeune, clean. Fond blanc, noir intense, badges colorés doux, pill buttons, gradient rouge→orange. Typo Space Grotesk pour les titres. Procédé page par page, section par section.

## Contraintes

- **SEO essentiel** : balises meta (title, description, og:image, twitter:card), structured data JSON-LD (WebSite, DefinedTerm), semantic HTML (h1/h2/nav/main/section/article), server components pour le contenu indexable
- **shadcn et son écosystème** : utiliser les composants shadcn existants (Button, Card, Badge, Input, Separator, etc.) — ne pas créer de composants custom quand un shadcn existe
- **Max 250 lignes par fichier** : découper en sous-composants si un fichier dépasse
- **Un seul composant exporté par fichier** : chaque fichier = un composant = une responsabilité

## Design System

### Palette

| Token | Light | Usage |
|-------|-------|-------|
| `background` | `#FFFFFF` | Fond principal |
| `foreground` | `#111111` | Texte principal |
| `card` | `#FAFAFA` | Cards, surfaces élevées |
| `card-foreground` | `#111111` | Texte sur cards |
| `muted` | `#F5F5F5` | Fonds tertiaires, pills |
| `muted-foreground` | `#999999` | Texte secondaire |
| `primary` | `#111111` | CTA principaux, boutons |
| `primary-foreground` | `#FFFFFF` | Texte sur primary |
| `secondary` | `#F5F5F5` | Boutons secondaires |
| `secondary-foreground` | `#444444` | Texte sur secondary |
| `accent` | gradient `#EF4444 → #F97316` | Accent visuel (titres, highlights) |
| `border` | `#F0F0F0` | Bordures subtiles |
| `input` | `#FAFAFA` | Fond inputs |
| `ring` | `#111111` | Focus ring |
| `destructive` | `#EF4444` | Erreurs |

Dark mode à définir dans une phase ultérieure.

### Typographie

| Usage | Font | Weight | Style |
|-------|------|--------|-------|
| Titres (h1, h2) | Space Grotesk | 800-900 | uppercase, tracking -0.04em |
| Sous-titres (h3) | Space Grotesk | 700-800 | tracking -0.02em |
| Body | Inter | 400-500 | normal |
| Labels/badges | Inter | 500-600 | uppercase, tracking 0.04-0.06em |
| Noms de mots | Space Grotesk | 800 | uppercase, tracking -0.02em |

### Composants globaux

- **Boutons CTA** : fond noir, texte blanc, `border-radius: 999px` (pill shape)
- **Cards** : fond `#FAFAFA`, border `#F0F0F0`, `border-radius: 16px`, hover avec shadow subtile + translateY(-1px)
- **Badges catégorie** : fond pastel + texte saturé, `border-radius: 6px`
  - Verbe : `bg: #FEE2E2, color: #DC2626`
  - Nom : `bg: #DBEAFE, color: #2563EB`
  - Adjectif : `bg: #F3E8FF, color: #7C3AED`
  - Expression : `bg: #D1FAE5, color: #059669`
  - Adverbe : `bg: #FEF3C7, color: #D97706`
- **Tags/Pills** : `border-radius: 999px`, fond gris clair, hover gris plus foncé
- **Inputs** : fond `#FAFAFA`, border `#E5E5E5`, `border-radius: 999px` (search) ou `12px` (forms)

### Animations

- Hover cards : `translateY(-1px)`, shadow subtile, `transition 150ms`
- Pas de shimmer, gravity stars, light rays, ni highlighter
- Fade-in au scroll pour les sections (optionnel, simple IntersectionObserver)

## Page 1 : Homepage

### Navbar

- Logo "nouchi.ci" en Space Grotesk 800, point en rouge `#EF4444`
- Liens : Accueil (actif = noir), Explorer, Blog, À propos (inactifs = `#999`)
- Droite : "Se connecter" en texte, "Proposer un mot" en pill noir
- Si connecté : avatar + dropdown remplace "Se connecter"
- Border-bottom `#F0F0F0`

### Hero Section

- Pill stats : fond `#F5F5F5`, border `#ECECEC`, "🇨🇮 +{count} mots documentés par la communauté"
- Titre : Space Grotesk 64px 900, "C'est quoi / ce **mot** là ?" — "mot" en gradient rouge→orange
- Sous-titre : Inter 16px, couleur `#999`
- Barre de recherche : pill shape (radius 999px), fond `#FAFAFA`, border `#E5E5E5`, bouton "Chercher" noir pill à l'intérieur, icône search à gauche
- Tags populaires : label "Populaires :", premier tag en noir (🔥 hot), les suivants en gris `#F5F5F5`
- Stats bar : séparée par border-top `#F0F0F0`. 3 stats en Space Grotesk 28px bold : Mots, Contributeurs, Votes

### Section "Mots du moment"

- Header : titre Space Grotesk 24px 800 + lien "Voir tout →"
- Grille 3 colonnes de word cards
- Chaque card : badge catégorie (pastel), nom du mot (Space Grotesk 20px bold uppercase), définition (Inter 13px `#888`), meta (auteur + votes) séparée par border-top

### Section "Derniers ajouts"

- Même style que l'existant mais avec le nouveau design system
- Liste verticale avec séparateurs, numérotation, catégorie pill, date relative, auteur

### Suppressions

- `GravityStarsBackground` — supprimé
- `LightRays` — supprimé
- `ShimmeringText` — supprimé
- `Highlighter` — supprimé
- `TrustSection` — supprimé (pas de valeur ajoutée)
- `PopularWordBadge` — remplacé par les tags pills

### SEO Homepage

- `title` : "Nouchici — Le dictionnaire du nouchi ivoirien"
- `description` : "Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. +400 mots documentés par la communauté."
- JSON-LD `WebSite` avec `potentialAction: SearchAction` pour le sitelinks search box Google
- Open Graph image à créer

### Fichiers impactés

**Modifiés :**
- `src/app/globals.css` — nouvelle palette CSS variables
- `src/app/layout.tsx` — charger Space Grotesk depuis next/font/google, metadata globale
- `src/app/page.tsx` — metadata SEO, JSON-LD
- `src/lib/category.ts` — nouvelles couleurs catégorie (pastel)

**Réécrits (découpés en sous-composants) :**
- `src/components/layouts/general/navbar.tsx` — refonte complète
  - `src/components/layouts/general/nav-links.tsx` — liens de navigation
  - `src/components/layouts/general/nav-auth.tsx` — section auth (login/avatar)
- `src/components/public/accueil/hero-section.tsx` — orchestrateur hero
  - `src/components/public/accueil/hero-title.tsx` — titre + sous-titre
  - `src/components/public/accueil/hero-search.tsx` — barre de recherche
  - `src/components/public/accueil/hero-tags.tsx` — tags populaires
  - `src/components/public/accueil/hero-stats.tsx` — stats bar
- `src/components/public/accueil/popular-words-section.tsx` — section mots du moment
  - `src/components/public/accueil/word-card.tsx` — card mot réutilisable
- `src/components/public/accueil/recent-words-section.tsx` — section derniers ajouts
  - `src/components/public/accueil/recent-word-row.tsx` — ligne mot récent

**Supprimés :**
- `src/components/ui/highlighter.tsx`
- `src/components/ui/light-rays.tsx`
- `src/components/animate-ui/` (tout le dossier)
- `src/components/public/accueil/popular-word-badge.tsx`
- `src/components/public/accueil/trust-section.tsx` (si existe)
