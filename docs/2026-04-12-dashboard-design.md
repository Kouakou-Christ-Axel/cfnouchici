# Dashboard multi-rôles — Spec

Dashboard unifié sous `/dashboard` avec sections dynamiques selon le rôle (USER / MODERATEUR / ADMIN). Fusionne les pages `/admin/*` existantes dans ce nouveau layout sidebar. Utilise exclusivement les composants shadcn.

## Contraintes

- **shadcn uniquement** : Sidebar, Card, Table, Badge, Button, Input, Select, Tabs, DropdownMenu, Avatar, Separator, Dialog (pour confirmations)
- **Max 250 lignes par fichier**, un composant par fichier
- **Pas de filtering/search/stats côté client** — toute agrégation et filtrage passent par les endpoints API (`/api/me/*`, `/api/admin/*`)
- **Permissions via CASL** — chaque section vérifie les abilities, pas de checks de rôle inline
- **Fetching** : server components → query layer direct pour l'initial render. Client components → endpoints REST

## Architecture

### Routes

```
/dashboard                        Landing — Vue d'ensemble (selon rôle)
/dashboard/propositions            Mes propositions (USER+)
/dashboard/profil                  Profil & paramètres (USER+)
/dashboard/moderation              File de modération (MODERATEUR+)
/dashboard/moderation/[slug]       Édition d'un mot
/dashboard/mots                    Tous les mots (MODERATEUR+)
/dashboard/stats                   Stats globales (MODERATEUR+)
/dashboard/utilisateurs            Gestion utilisateurs (ADMIN)
/dashboard/logs                    Logs de modération (ADMIN)
```

### Layout

`src/app/dashboard/layout.tsx` — server component qui :
1. Vérifie la session via `getSessionOrRedirect("/dashboard")` (tout user connecté)
2. Récupère le rôle de l'utilisateur
3. Rend le `<DashboardShell>` avec le user passé en props
4. Les enfants (pages) sont rendus dans la zone main

`<DashboardShell>` — client component qui compose le Sidebar shadcn + zone main.

### Migration des pages /admin existantes

Les pages `/admin`, `/admin/mots`, `/admin/mots/[slug]` sont **supprimées**. Leur contenu est migré vers :
- `/admin` → `/dashboard/moderation` (même fonction : file d'attente + stats rapides)
- `/admin/mots` → `/dashboard/mots` (liste filtrable)
- `/admin/mots/[slug]` → `/dashboard/moderation/[slug]` (édition avec preview)

Les redirections : `/admin*` → `/dashboard/*` équivalent (via `redirect()` dans des pages `/admin/page.tsx` wrapper, ou via le proxy).

### Sidebar (shadcn Sidebar component)

Installation : `pnpm dlx shadcn@latest add sidebar`

Structure :

```
Sidebar
├── SidebarHeader (logo nouchi.ci)
├── SidebarContent
│   ├── SidebarGroup "Mon espace" (tous les rôles)
│   │   ├── Vue d'ensemble (LayoutDashboard)
│   │   ├── Mes propositions (FileText) + badge count EN_ATTENTE
│   │   └── Profil & paramètres (User)
│   ├── SidebarGroup "Modération" (MODERATEUR+, can("moderate", "Mot"))
│   │   ├── File d'attente (Shield) + badge count EN_ATTENTE global
│   │   ├── Tous les mots (MessageSquare)
│   │   └── Stats globales (BarChart)
│   └── SidebarGroup "Administration" (ADMIN, can("manage", "all"))
│       ├── Utilisateurs (Users)
│       └── Logs de modération (FileText)
└── SidebarFooter
    └── User card (avatar + nom + role badge) avec dropdown vers /deconnexion
```

Le sidebar est **collapsible** sur mobile (shadcn built-in).

## Pages par rôle

### `/dashboard` — Vue d'ensemble

**USER :**
- Header : "Bonjour {name} 👋" + sous-titre
- 3 stat cards : Propositions (total), Validées (% réussite), En attente (date plus ancienne)
- Section "Dernières propositions" : 5 derniers mots soumis avec chip statut (EN_ATTENTE/VALIDE/REJETE)
- Lien "Voir tout" → `/dashboard/propositions`

**MODERATEUR+ :**
- Même page que USER, mais la page d'accueil par défaut redirige vers `/dashboard/moderation` (pour aller direct au travail). Un toggle "Vue perso" permet de revenir à la vue USER.

Source : `GET /api/me/stats` retourne `{ total, validated, pending, oldestPendingAt, recentPropositions[] }`.

### `/dashboard/propositions` — Mes propositions

- Table shadcn avec colonnes : Mot, Catégorie, Statut, Date, Actions
- Filtres au-dessus (passés en searchParams URL) : statut (select), recherche (input)
- Pagination cursor-based (Prev/Next buttons)
- Actions par ligne :
  - Si EN_ATTENTE : "Modifier" (link vers `/proposer` avec prefill — hors scope cette phase, disable), "Supprimer" (dialog confirm)
  - Si VALIDE : "Voir" (link vers `/mots/[slug]`)
  - Si REJETE : afficher motifRejet dans un tooltip/popover

Source : `GET /api/me/propositions?statut=X&search=Y&cursor=Z&limit=20`

### `/dashboard/profil` — Profil & paramètres

Formulaire avec :
- Avatar (read-only, de Google)
- Email (read-only)
- Nom (éditable via `<Input>` + bouton Sauvegarder)
- Badge rôle (read-only)

Source lecture : server component fetch depuis session.
Mutation : `PATCH /api/me/profile` body `{ name }`.

### `/dashboard/moderation` — File de modération

- Header : "File de modération" + count EN_ATTENTE
- 3 stat cards rapides : En attente, Validés ce mois, Rejetés ce mois
- Section filtres : recherche, catégorie (tous les filtres en URL params → endpoint)
- Liste des mots EN_ATTENTE avec boutons inline : "Examiner" (link `/dashboard/moderation/[slug]`), "Valider" (POST direct), "Rejeter" (dialog avec motif)
- Pagination

Source : `GET /api/admin/mots?statut=EN_ATTENTE&search=X&categorie=Y&cursor=Z`
Actions : `POST /api/admin/mots/[slug]/valider`, `POST /api/admin/mots/[slug]/rejeter`

### `/dashboard/moderation/[slug]` — Édition d'un mot

Reprend la page `/admin/mots/[slug]` existante telle quelle. Layout split form + preview + actions + logs.

### `/dashboard/mots` — Tous les mots

Reprend `/admin/mots` existante. Tabs par statut + table + recherche côté endpoint.

### `/dashboard/stats` — Stats globales

- Stat cards : total mots, EN_ATTENTE, VALIDE, REJETE, contributeurs, modérateurs actifs
- Table "Top modérateurs" : classement des modérateurs par nb d'actions cette semaine/ce mois
- Table "Top contributeurs" : classement par nb de mots validés

Source : `GET /api/admin/stats` (déjà existant, enrichi)

### `/dashboard/utilisateurs` — Gestion (ADMIN)

- Header + bouton "Exporter CSV" (télécharge `/api/admin/users/export.csv`)
- Filtres : recherche (nom/email), rôle (select), tri (date d'inscription, nb contributions) — tous via URL params
- Table avec colonnes : Avatar + Nom, Email, Rôle, Contributions, Inscription, Actions
- Actions par ligne :
  - "Changer le rôle" (dropdown USER / MODERATEUR / ADMIN)
  - "Bannir" (dialog confirm — soft delete via flag `banned: true` sur User)

**Modification nécessaire du schéma Prisma** : ajouter `banned Boolean @default(false)` et `bannedAt DateTime?` sur User.

Source : `GET /api/admin/users?search=X&role=Y&sort=Z&cursor=C`
Actions : `PATCH /api/admin/users/[id]` body `{ role?: Role, banned?: boolean }`, `GET /api/admin/users/export.csv`

### `/dashboard/logs` — Logs de modération (ADMIN)

- Table des `LogModeration` triée par date desc
- Filtres : action (select), modérateur (select), période (from/to)
- Colonnes : Date, Modérateur, Action (badge coloré), Mot (link), Motif

Source : `GET /api/admin/logs?action=X&moderateurId=Y&from=Z&to=W&cursor=C`

## API Endpoints

### Nouveaux `/api/me/*`

| Route | Méthode | Accès | Description |
|-------|---------|-------|-------------|
| `/api/me/stats` | GET | USER+ | Stats perso (total, validés, en attente, dernières props) |
| `/api/me/propositions` | GET | USER+ | Liste paginée des mots soumis par l'utilisateur |
| `/api/me/propositions/[slug]` | DELETE | USER (auteur, EN_ATTENTE uniquement) | Supprimer sa propre proposition |
| `/api/me/profile` | PATCH | USER+ | Mettre à jour le nom |

### Nouveaux `/api/admin/*`

| Route | Méthode | Accès | Description |
|-------|---------|-------|-------------|
| `/api/admin/users` | GET | ADMIN | Liste users paginée avec filtres search/role/sort |
| `/api/admin/users/[id]` | PATCH | ADMIN | Update role ou banned |
| `/api/admin/users/export.csv` | GET | ADMIN | Export CSV de tous les users |
| `/api/admin/logs` | GET | ADMIN | Liste logs paginée avec filtres |

### Permissions via CASL

On ajoute des abilities :
- `can("read", "MesPropositions")` — tous les users connectés sur leurs propres propositions
- `can("delete", "Mot", { soumisParId, statut: "EN_ATTENTE" })` — déjà existant dans les abilities
- `can("moderate", "Mot")` — déjà existant (MODERATEUR+)
- `can("manage", "User")` — ADMIN uniquement
- `can("read", "LogModeration")` — ADMIN uniquement

## Données & modèle

### Modification Prisma

Ajouter au modèle `User` :

```prisma
banned    Boolean   @default(false)
bannedAt  DateTime?
```

Migration : `add-user-banned-flag`.

### Query layer

Nouveaux fichiers :
- `src/lib/queries/me.ts` — `getMyStats(userId)`, `listMyPropositions(userId, params)`
- `src/lib/queries/users.ts` — `listUsers(params)`, `getUserById(id)`, `exportUsersCsv()`
- `src/lib/queries/logs.ts` — `listLogs(params)`
- `src/lib/mutations/users.ts` — `updateUser(id, { role?, banned? })`
- `src/lib/mutations/me.ts` — `deleteMyProposition(userId, slug)`, `updateMyProfile(userId, { name })`

## Structure des fichiers (composants)

```
src/app/dashboard/
├── layout.tsx                    Orchestrateur auth + DashboardShell
├── page.tsx                      Vue d'ensemble (USER overview)
├── propositions/
│   └── page.tsx
├── profil/
│   └── page.tsx
├── moderation/
│   ├── page.tsx                  File d'attente
│   └── [slug]/
│       └── page.tsx              Édition mot
├── mots/
│   └── page.tsx                  Liste tous statuts
├── stats/
│   └── page.tsx                  Stats globales
├── utilisateurs/
│   └── page.tsx                  Gestion users (ADMIN)
└── logs/
    └── page.tsx                  Logs modération (ADMIN)

src/components/dashboard/
├── shell.tsx                     DashboardShell (layout Sidebar + main)
├── sidebar-nav.tsx               Navigation sidebar (groupes selon rôle)
├── sidebar-user.tsx              Footer sidebar (user card + logout)
├── stat-card.tsx                 Card stats réutilisable
├── status-chip.tsx               Chip statut (EN_ATTENTE / VALIDE / REJETE)
├── overview/
│   ├── user-overview.tsx         Vue d'ensemble USER
│   └── overview-props-list.tsx   Liste propositions récentes
├── propositions/
│   ├── propositions-table.tsx    Table des propositions
│   └── delete-proposition-dialog.tsx
├── profil/
│   └── profile-form.tsx          Formulaire nom
├── moderation/
│   ├── pending-list.tsx          Liste EN_ATTENTE avec actions inline
│   ├── pending-item.tsx          Une ligne de la liste
│   └── reject-dialog.tsx         Dialog rejet avec motif
├── users/
│   ├── users-table.tsx
│   ├── user-row.tsx
│   ├── role-change-dialog.tsx
│   └── ban-user-dialog.tsx
└── logs/
    └── logs-table.tsx
```

Les pages existantes de `/admin/*` sont supprimées (redirections via proxy ou wrapper qui redirige vers `/dashboard/*`).

## Redirections

- `/admin` → `/dashboard/moderation`
- `/admin/mots` → `/dashboard/mots`
- `/admin/mots/[slug]` → `/dashboard/moderation/[slug]`

Implémentées via `redirect()` dans des pages wrappers sous `/admin/` (ou via `middleware` / `proxy.ts`).

## Testing

Tests unitaires Zod schemas + queries + mutations (mêmes patterns que Phase 2). Pas de tests UI.

Nouveaux tests :
- `src/tests/api/me.test.ts` — getMyStats, listMyPropositions, deleteMyProposition, updateMyProfile
- `src/tests/api/users.test.ts` — listUsers (filtres), updateUser (role + banned)
- `src/tests/api/logs.test.ts` — listLogs (filtres)
- `src/tests/casl/abilities.test.ts` — nouvelles abilities (manage User, read LogModeration)
