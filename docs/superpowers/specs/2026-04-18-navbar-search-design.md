# Navbar Search — Design Spec
_Date: 2026-04-18_

## Objectif

Ajouter une barre de recherche dans la navbar publique permettant à l'utilisateur de trouver un mot nouchi avec suggestions live (mot + aperçu définition). S'appuie sur l'infrastructure pg_trgm déjà en place.

---

## Architecture des composants

```
Navbar
└── SearchBar (client component)
    ├── [desktop] icône loupe → input inline expandable + Popover Radix
    │   ├── SearchInput
    │   └── SearchSuggestions (Popover)
    │       ├── SuggestionItem × N (mot + catégorie + définition tronquée)
    │       └── "Voir les N résultats pour 'xyz' →"
    └── [mobile] icône loupe → Dialog fullscreen shadcn
        ├── SearchInput (réutilisé)
        └── SearchSuggestions (réutilisé)
```

Fichiers à créer :
- `src/hooks/use-search.ts`
- `src/components/layouts/general/search-bar.tsx`

Fichiers à modifier :
- `src/components/layouts/general/navbar.tsx`

---

## Hook `useSearch`

```ts
// src/hooks/use-search.ts
useSearch(query: string): { results: SearchResult[], loading: boolean }
```

- Ne fetch pas si `query.trim().length < 2`
- Debounce 250ms avant chaque requête
- AbortController : annule la requête précédente si nouvelle frappe
- Endpoint : `GET /api/search?q={query}` → `{ data: SearchResult[] }`
- `SearchResult` : `{ id, slug, mot, definition, categorie, statut }`

---

## Comportement Desktop

1. La navbar affiche une icône loupe (`Search` de lucide-react)
2. Clic → l'input apparaît avec `transition-[width] duration-200 ease-out` (`0 → 280px`), focus automatique
3. Frappe → debounce 250ms → fetch → popover Radix s'ouvre
4. Escape (1er) → ferme le popover, input reste ouvert
5. Escape (2e) ou clic extérieur → reset input, retour à la loupe
6. Clic suggestion → navigation vers `/mots/[slug]`, reset complet
7. Clic "Voir tous les résultats" → navigation vers `/mots?search={query}`

---

## Comportement Mobile

1. Clic loupe → Dialog shadcn en fullscreen (fond semi-transparent)
2. Input en haut avec bouton "Annuler" (ferme Dialog + reset)
3. Suggestions en liste scrollable dessous
4. Même logique fetch/debounce via `useSearch`
5. Clic suggestion → ferme Dialog + navigation

---

## Anatomie d'une suggestion

```
┌────────────────────────────────────────────────┐
│  gou-gou          [NOM]                        │
│  Quelqu'un de naïf, facilement influençable…   │
└────────────────────────────────────────────────┘
```

- Mot en `font-semibold`
- Badge catégorie (réutilise `categoryColor` + `categoryLabel` de `src/lib/category.ts`)
- Définition tronquée à 1 ligne (`line-clamp-1`), texte `text-muted-foreground text-sm`
- Hover : `bg-muted/50`
- Maximum 10 résultats (déjà limité côté API dans `searchMots()`)

---

## Lien "Voir tous les résultats"

- Affiché uniquement si `results.length > 0`
- Texte : `Voir les {N} résultats pour "{query}" →`
- Destination : `/mots?search={query}`
- Style : `text-sm text-muted-foreground` avec hover souligné

---

## Accessibilité

- Input : `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`
- Liste : `role="listbox"`
- Items : `role="option"`, `aria-selected` pour l'item actif
- Navigation clavier ↑↓ sur les suggestions, Enter pour sélectionner
- Focus trap dans le Dialog mobile (shadcn le gère nativement)

---

## États visuels

| État | UI |
|------|----|
| Fermé | Icône loupe seule |
| Ouvert, vide | Input visible, pas de popover |
| Chargement | Spinner dans l'input (icon animé) |
| Résultats | Popover avec liste |
| Aucun résultat | Popover avec "Aucun mot trouvé pour *xyz*" |

---

## Contraintes techniques

- Tailwind v4 — utiliser `w-(--var)` et non `w-[--var]` pour les variables CSS
- Pas de modification de l'API backend (déjà fonctionnelle)
- Le composant `SearchBar` est `"use client"` uniquement — la navbar devient client si elle ne l'est pas déjà (elle l'est : `useState` pour mobile menu)
- Réutiliser `categoryColor` et `categoryLabel` de `src/lib/category.ts`
