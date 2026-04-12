# Refonte page /proposer + dropdown profil navbar — Spec

Resserrer la page de proposition et ajouter un dropdown profil propre dans la navbar. Utilise exclusivement les composants shadcn.

## Contraintes

- **shadcn uniquement** : Form, Card, Input, Textarea, Select, Button, DropdownMenu, Avatar, Badge, Separator. Aucun composant custom quand un shadcn existe.
- **Max 250 lignes par fichier**, un composant par fichier.
- Pas de lecture du `.env` — demander les valeurs à l'utilisateur si besoin.

## Page `/proposer`

### Layout

- Container max-width **720px** centré (`max-w-3xl mx-auto`)
- Page header : titre Space Grotesk 32px 800 + sous-titre muted
- Formulaire wrappé dans une `<Card>` shadcn avec `<CardContent>` padding 28px

### Champs

Grid 2 colonnes (desktop, 1 colonne mobile) pour **Mot + Catégorie** :

- **Mot** (requis) : shadcn `<Input>` placeholder "Ex: goumin". Helper text "Le mot tel qu'il se prononce" sous l'input.
- **Catégorie** (optionnel) : shadcn `<Select>` avec SelectTrigger/SelectContent/SelectItem — options NOM, VERBE, ADJECTIF, EXPRESSION, ADVERBE (labels traduits)

Pleine largeur :

- **Définition** (requis) : shadcn `<Textarea>` rows=3, placeholder "Décris le sens du mot en français simple...". Helper "Sois clair et concis. Une phrase suffit."
- **Exemples** (optionnel) : array de champs dynamiques avec `useFieldArray`
  - Chaque ligne : `<Input>` flex-1 + bouton icône poubelle (shadcn `<Button variant="ghost" size="icon">`)
  - Bouton "Ajouter un exemple" en dashed outline pill (`<Button variant="outline" className="rounded-full border-dashed">`)

### Preview live

- Card secondaire `bg-muted/50` sous les champs
- Label "Aperçu" en uppercase muted
- Badge catégorie (avec couleur pastel) si renseignée
- Mot en Space Grotesk 28px 800 uppercase (gros)
- Définition
- Premier exemple en italic avec border-left

Utilise `form.watch()` pour mettre à jour le preview en temps réel.

### Footer actions

- Flex end, séparateur au-dessus (`<Separator />`)
- Bouton "Annuler" ghost variant (retour à `/`)
- Bouton "Soumettre le mot" primary rounded-full

### Success state

Remplace le card par une success card (check icon vert + message + 2 boutons "Voir le dictionnaire" / "Proposer un autre mot"). Déjà en place, garder tel quel.

## Dropdown profil navbar

### Composant trigger

Remplacer les 3 boutons actuels (Shield, Avatar, LogOut) par un seul trigger :

- Container avec `<Avatar>` shadcn (size-8) + ChevronDown icon
- Bordure transparente, hover border-border + bg-muted
- Avatar gradient de fallback : `linear-gradient(135deg, #EF4444, #F97316)` avec initiale

Le CTA "Proposer un mot" reste à côté (pas dans le dropdown).

### Dropdown (shadcn DropdownMenu)

Largeur 280px, aligné right.

**Header section** (DropdownMenuLabel custom) :
- Flex avec avatar 40px + colonne nom/email/role badge
- Nom en font-semibold text-sm
- Email en text-xs muted, truncate
- Badge rôle (shadcn Badge) avec couleur par rôle :
  - USER : "Contributeur" purple soft (`bg-purple-100 text-purple-700`)
  - MODERATEUR : "Modérateur" blue soft
  - ADMIN : "Admin" red soft

Separator.

**Items** (DropdownMenuItem) :
- "Mon dashboard" → `/dashboard` (icon LayoutDashboard)
- "Proposer un mot" → `/proposer` (icon Plus)
- "Mes propositions" → `/dashboard/propositions` (icon FileText) + badge count si propositions EN_ATTENTE
- "Modération" → `/admin` (icon Shield) + badge count mots EN_ATTENTE (uniquement MODERATEUR/ADMIN)
- "Paramètres" → `/dashboard/parametres` (icon Settings)

Separator.

**Déconnexion** (DropdownMenuItem) :
- "Se déconnecter" (icon LogOut, texte rouge via `className="text-destructive"`)
- onClick : `authClient.signOut()` + refresh

### Fetching des badges count

Pour éviter de fetch côté client, le count des propositions de l'utilisateur et le count admin sont fetch côté serveur et passés en props au dropdown via le wrapper `NavAuth`. Comme la navbar est rendue dans un layout client, on peut soit :
- **Option A** : Rendre `NavAuth` comme un server component et le composer dans le layout (Next.js 16 permet server components dans client components via props)
- **Option B** : Fetch côté client avec SWR/fetch + cache

On part sur **A** : la navbar reste client pour la logique mobile menu, mais le dropdown reçoit les counts en props depuis un server component wrapper.

Pour la Phase 2 (pas cette refonte), on laisse les badges à `undefined` — on les ajoute quand le dashboard sera fait.

## Fichiers impactés

**Modifiés :**
- `src/app/proposer/page.tsx` — ajout du wrapper max-width + card
- `src/components/public/proposer/proposer-form.tsx` — restructurer les champs (grid 2 col, preview live), ajouter helpers, utiliser shadcn Card

**Réécrits / créés (navbar) :**
- `src/components/layouts/general/nav-auth.tsx` — remplacer la logique actuelle par un wrapper qui affiche soit `<NavAuthGuest />` soit `<NavAuthUser />`
- `src/components/layouts/general/nav-auth-guest.tsx` — bouton "Se connecter" + "Proposer un mot"
- `src/components/layouts/general/nav-auth-user.tsx` — dropdown profil (shadcn DropdownMenu)
- `src/components/layouts/general/nav-auth-user-trigger.tsx` — le trigger (avatar + chevron)
- `src/components/layouts/general/nav-auth-user-header.tsx` — header du dropdown (avatar + nom + role badge)

**Nouveau composant shadcn à installer :**
- `DropdownMenu` (pnpm dlx shadcn@latest add dropdown-menu)

**Nouveau composant à créer dans `src/components/public/proposer/` :**
- `src/components/public/proposer/proposer-preview.tsx` — card preview live du mot (catégorie + mot + définition + exemple)

## Testing

Pas de tests unitaires pour les composants UI (hors scope dans ce projet). Vérification par build + vérification visuelle.
