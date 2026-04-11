# Phase 2 : Communauté — Spec

Page de proposition de mots, dashboard de modération avec stats, workflow de validation admin, votes communautaires, et protection des routes. Approche TDD avec Vitest. React Hook Form + Zod pour les formulaires.

## Protection des routes

**Fichier :** `src/proxy.ts`

Helper `getSessionOrRedirect()` côté server component vérifie la session via Better Auth. Redirige vers `/connexion?callbackUrl=<current>` si non authentifié.

### Routes protégées

- `/proposer` — requiert auth (tout rôle)
- `/admin/*` — requiert auth + rôle MODERATEUR ou ADMIN

### Comportement

- Non connecté sur `/proposer` → redirect `/connexion?callbackUrl=/proposer`
- Non connecté sur `/admin` → redirect `/connexion?callbackUrl=/admin`
- USER sur `/admin/*` → redirect `/` (accès refusé)
- MODERATEUR/ADMIN sur `/admin/*` → accès autorisé

## Page `/proposer`

Page client avec formulaire React Hook Form + Zod resolver.

### Champs du formulaire

- `mot` — input texte, requis
- `definition` — textarea, requis
- `categorie` — select (NOM, VERBE, ADJECTIF, EXPRESSION, ADVERBE), optionnel
- `exemples` — champs dynamiques (ajouter/supprimer), au moins un recommandé

### Composants shadcn ajoutés

Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem.

### Validation

Réutilise `createMotSchema` de `src/lib/validators/mot.ts` via `@hookform/resolvers/zod`.

### Soumission

POST `/api/mots` (existe déjà). Après succès : message de confirmation + choix entre retourner à `/mots` ou proposer un autre mot. Erreur 409 : "Ce mot existe déjà".

## Modèle LogModeration

```prisma
enum ActionModeration {
  VALIDE
  REJETE
  EDITE
}

model LogModeration {
  id            String            @id @default(cuid())
  action        ActionModeration
  motif         String?
  motId         String
  mot           Mot               @relation(fields: [motId], references: [id], onDelete: Cascade)
  moderateurId  String
  moderateur    User              @relation("LogsModeration", fields: [moderateurId], references: [id])
  createdAt     DateTime          @default(now())

  @@map("log_moderation")
}
```

Relations ajoutées :
- `Mot` : `logsModeration LogModeration[]`
- `User` : `logsModeration LogModeration[] @relation("LogsModeration")`

## Modèle VoteMot

```prisma
enum Connaissance {
  OUI_UTILISE
  CONNAIS
  JAMAIS_ENTENDU
}

enum Exactitude {
  EXACTE
  APPROXIMATIVE
  FAUSSE
}

model VoteMot {
  id            String        @id @default(cuid())
  motId         String
  mot           Mot           @relation(fields: [motId], references: [id], onDelete: Cascade)
  userId        String
  user          User          @relation("VotesMots", fields: [userId], references: [id])
  connaissance  Connaissance
  exactitude    Exactitude
  createdAt     DateTime      @default(now())

  @@unique([motId, userId])
  @@map("vote_mot")
}
```

Relations ajoutées :
- `Mot` : `votes VoteMot[]`
- `User` : `votesMots VoteMot[] @relation("VotesMots")`

## API Modération

| Route | Méthode | Description | Accès |
|-------|---------|-------------|-------|
| `/api/admin/mots` | GET | Liste mots tous statuts (pagination, filtre statut/catégorie, recherche) | MODERATEUR+ |
| `/api/admin/mots/[slug]/valider` | POST | Valider un mot → statut VALIDE, crée LogModeration | MODERATEUR+ |
| `/api/admin/mots/[slug]/rejeter` | POST | Rejeter un mot → statut REJETE + motif requis, crée LogModeration | MODERATEUR+ |
| `/api/admin/mots/[slug]` | PUT | Éditer un mot avant validation, crée LogModeration EDITE | MODERATEUR+ |
| `/api/admin/stats` | GET | Stats (mots par statut, par modérateur, par période) | MODERATEUR+ |

### Validation Zod

- `rejeterMotSchema` : `{ motif: z.string().min(1) }` — motif requis pour le rejet
- `validerMotSchema` : body vide accepté
- Réutilise `updateMotSchema` pour l'édition

## API Votes communautaires

| Route | Méthode | Description | Accès |
|-------|---------|-------------|-------|
| `/api/mots/[slug]/vote` | POST | Soumettre un vote (upsert: un seul par user par mot) | USER+ |
| `/api/mots/[slug]/vote` | GET | Résumé des votes agrégés (compteurs par option) | Public |

### Validation Zod

- `voteMotSchema` : `{ connaissance: z.enum([...]), exactitude: z.enum([...]) }`

## Dashboard `/admin`

### Pages

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard : cartes stats + derniers mots EN_ATTENTE |
| `/admin/mots` | Liste complète filtrable par statut |
| `/admin/mots/[slug]` | Édition avec preview live + actions modération |

### Page `/admin` (dashboard principal)

- Cartes stats : nombre de mots par statut (EN_ATTENTE, VALIDE, REJETE), total contributions, modérateurs actifs
- Stats par période : mots soumis/validés cette semaine/ce mois (dérivés des LogModeration)
- Liste rapide des 10 derniers mots EN_ATTENTE avec score communautaire et actions directes

### Page `/admin/mots` (liste)

- Tabs par statut (EN_ATTENTE, VALIDE, REJETE, Tous)
- Tableau : mot, catégorie, auteur, date, statut, score communautaire, actions
- Pagination + recherche

### Page `/admin/mots/[slug]` (édition + preview)

- Layout split : formulaire React Hook Form à gauche, preview live à droite
- Le preview reproduit le rendu de la fiche mot (`/mots/[slug]`) en temps réel avec les mêmes composants
- Boutons d'action : "Valider", "Rejeter" (ouvre champ motif), "Sauvegarder" (édite sans changer statut)
- Score communautaire affiché (votes agrégés)
- Historique de modération en bas (logs des actions précédentes)

### Protection

Toutes les pages `/admin/*` vérifient le rôle via `getSessionOrRedirect()` avec check MODERATEUR/ADMIN.

## Affichage votes sur `/mots/[slug]`

Sur la page publique de détail d'un mot :
- Deux questions avec boutons (connaissance + exactitude)
- Résultats agrégés visibles (compteurs ou barres)
- Non connecté : voit les résultats, ne peut pas voter
- Connecté : peut voter, un seul vote par mot (upsert si re-vote)

## Testing (TDD)

### Nouveaux tests

| Couche | Ce qu'on teste | Type |
|--------|---------------|------|
| Zod schemas | Validation payloads modération (rejeter avec motif, voter) | Unitaire |
| API admin | GET /api/admin/mots (filtrage, permissions MODERATEUR+) | Intégration |
| API admin | POST valider, POST rejeter (création LogModeration) | Intégration |
| API admin | PUT éditer (création LogModeration EDITE) | Intégration |
| API admin | GET /api/admin/stats | Intégration |
| API votes | POST /api/mots/[slug]/vote (création, upsert, permissions) | Intégration |
| API votes | GET /api/mots/[slug]/vote (agrégation) | Intégration |
| CASL | USER ne peut pas accéder aux endpoints admin | Intégration |
| Protection | getSessionOrRedirect redirige correctement | Unitaire |

### Hors scope Phase 2

- Tests composants React (formulaires, dashboard)
- Tests E2E (Playwright)
