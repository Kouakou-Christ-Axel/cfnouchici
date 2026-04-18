# Design : Corrections UX nouchi.ci

**Date :** 2026-04-18
**Issu de :** Audit UX complet (agent ux-auditor-nouchi)
**Score avant corrections :** 6,5/10

---

## Périmètre

Corrections en 3 phases issues de l'audit UX. Aucune nouvelle feature — uniquement réduction de friction et polish.

---

## Phase 1 — API : contribution anonyme

### Contexte

`soumisParId` est déjà `String?` dans le schema Prisma — aucune migration nécessaire.

### Changements

**`src/lib/mutations/mots.ts`**
- `createMot(input: CreateMotInput, userId: string | null)` — accepte `null`
- Le champ `soumisParId: userId` reste identique (Prisma accepte `null` sur nullable)

**`src/app/api/mots/route.ts` — POST**
- Supprimer le check `if (!session) return 401`
- `const userId = session?.user.id ?? null`
- Appeler `createMot(parsed.data, userId)`

**`src/app/(public)/proposer/page.tsx`**
- Supprimer `await getSessionOrRedirect("/proposer")`
- La page devient publique, accessible sans compte

### Résultat

Un utilisateur non connecté peut soumettre un mot. Le mot est créé avec `soumisParId: null` et s'affiche "Ajouté par : —" sur la fiche.

---

## Phase 2 — Pages bloquantes

### 2a. Écran de succès contribution anonyme

**`src/components/public/proposer/proposer-form.tsx`**

Dans l'état `success`, après le message de confirmation existant et avant les boutons, ajouter une section conditionnelle visible uniquement si l'utilisateur n'est pas connecté :

```
┌──────────────────────────────────────┐
│ 🔔 Suis tes contributions            │
│ Crée un compte pour être notifié     │
│ quand ton mot est publié.            │
│ [Se connecter avec Google]           │
└──────────────────────────────────────┘
```

- Utiliser `authClient.useSession()` pour détecter si l'utilisateur est déjà connecté
- Le bouton appelle `authClient.signIn.social({ provider: "google", callbackURL: "/" })`
- Section visuellement distincte (border, bg-muted/50) mais sans bloquer les autres actions

### 2b. ShareButton sur la fiche mot

**`src/app/(public)/mots/[slug]/page.tsx`**

Dans le `<header>` de la fiche, transformer le layout pour avoir badge catégorie + ShareButton sur la même ligne :

```tsx
<header className="space-y-4">
  <div className="flex items-center justify-between">
    <span className={`badge...`}>{categoryLabel(mot.categorie)}</span>
    <ShareButton mot={mot.mot} slug={slug} size="sm" variant="outline" />
  </div>
  <h1 ...>{mot.mot}</h1>
</header>
```

Import : `import { ShareButton } from "@/components/share/share-button"`

### 2c. Homepage ISR

**`src/app/(public)/page.tsx`**
- Remplacer `export const dynamic = "force-dynamic"` par `export const revalidate = 3600`
- Transformer en Server Component async
- Fetch les données une fois : `getPopularMots(6)`, `db.mot.count()`, `db.user.count()`, `db.voteMot.count()`
- Passer `mots`, `wordCount`, `contributorCount`, `voteCount` en props à `HeroSection`

**`src/components/public/accueil/hero-section.tsx`**
- Devenir un Server Component synchrone (ou simplement un composant qui reçoit les props)
- Supprimer les 4 appels DB internes
- Accepter props `{ mots, wordCount, contributorCount, voteCount }`

**`src/components/public/accueil/popular-words-section.tsx`**
- Accepter `mots` en prop obligatoire (type `{ slug: string; mot: string; definition: string | null; categorie: Categorie | null; soumisPar: { name: string } | null }[]`)
- Supprimer le `getPopularMots(6)` interne
- La page parente devient la seule source de données

---

## Phase 3 — Irritants

### 3a. `⌘K` invisible sur mobile

**`src/components/public/accueil/hero-search.tsx`**
- Wrapper le `<kbd>⌘K</kbd>` avec `className="hidden md:flex"` ou `hidden md:inline-flex`

### 3b. Typo "À propos" dans la navigation

**`src/config/navigation.ts`** (ou fichier équivalent contenant `navLinks`)
- `'A Propos'` → `'À propos'`

### 3c. Suppression du composant mort

- Supprimer `src/components/public/mots/word-interactions.tsx`

### 3d. CTA "Proposer un mot" dans le hero

**`src/components/public/accueil/hero-section.tsx`**
- `HeroSearch` est un Client Component dédié au bouton search — ne pas le modifier pour ce CTA
- Ajouter un `<Link href="/proposer">` entre `<HeroSearch />` et `<HeroTags />` dans hero-section.tsx
- Texte : "Proposer un mot" avec icône `PenLine`, style bouton outline/ghost

### 3e. Connexion `callbackURL` dynamique

**`src/app/(public)/connexion/page.tsx`**
- Transformer en Server Component pour lire `searchParams`
- Extraire `callbackUrl` depuis `searchParams`
- Passer en prop au composant client `ConnexionForm`
- `authClient.signIn.social({ provider: "google", callbackURL: callbackUrl ?? "/" })`

### 3f. Nettoyage des URLs partagées

**`src/lib/share.ts`**
- `getShareUrl` : supprimer `?vote=1` du retour
- Résultat : `${base}/mots/${slug}?utm_source=share&utm_medium=link`
- Mettre à jour le texte WhatsApp/native : remplacer "Vote ici →" par "Découvres-le →"

### 3g. Navigation prev/next entre lettres

**`src/app/(public)/mots/lettre/[lettre]/page.tsx`**
- Calculer la liste triée des lettres disponibles depuis `generateStaticParams` (ou re-fetch `listAllMotsValides` et en extraire les premières lettres uniques)
- Déterminer `prevLetter` et `nextLetter` par rapport à la lettre courante
- Remplacer le bouton unique "Voir toutes les lettres" par :
  ```
  [← Lettre B]   [Toutes les lettres]   [Lettre D →]
  ```

---

## Ce qui n'est PAS dans ce périmètre

- OG image (conservée telle quelle à la demande)
- OG image blog
- VoteSection SSR (C4 de l'audit) — déféré
- Blog OG image — déféré
- Sidebar catégorie en double — déféré

---

## Ordre d'implémentation recommandé

1. `share.ts` — nettoyage URLs (aucune dépendance)
2. `word-interactions.tsx` — suppression (aucune dépendance)
3. API `POST /api/mots` + mutation `createMot` — anonymisation
4. `proposer/page.tsx` — retrait auth guard + écran succès avec section compte
5. `mots/[slug]/page.tsx` — ajout ShareButton
6. `page.tsx` homepage — ISR + déduplication
7. `hero-section.tsx` — réception props au lieu de fetch
8. `hero-search.tsx` — masquer ⌘K mobile + CTA proposer
9. `navigation.ts` — typo À propos
10. `connexion/page.tsx` — callbackURL dynamique
11. `lettre/[lettre]/page.tsx` — navigation prev/next
