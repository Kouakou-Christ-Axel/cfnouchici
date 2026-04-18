# Design : Vote avec modal d'authentification

**Date :** 2026-04-18
**Contexte :** Les boutons de vote sont actuellement désactivés pour les utilisateurs non connectés. L'objectif est de les laisser cliquer, afficher un modal de connexion, puis restaurer leur sélection après login.

---

## Comportement attendu

1. Utilisateur non connecté clique sur n'importe quel bouton de vote (connaissance ou exactitude)
2. La sélection est immédiatement stockée dans `localStorage["pending_vote"]`
3. Le Dialog `VoteAuthModal` s'ouvre
4. L'utilisateur clique "Se connecter avec Google" → `callbackURL: /mots/${slug}`
5. Après OAuth, retour sur la même fiche mot, utilisateur connecté
6. Au montage de `VoteSection` : si `session?.user` + `pending_vote.slug === slug` → la sélection est restaurée dans le state React + localStorage est nettoyé
7. L'utilisateur fait la deuxième sélection → auto-submit déclenché comme actuellement

---

## Structure localStorage

Clé : `"pending_vote"`

```typescript
interface PendingVote {
  slug: string;
  field: "connaissance" | "exactitude";
  value: string; // ConnaissanceOption | ExactitudeOption
}
```

Un seul vote en attente à la fois. Écrasé si l'utilisateur clique un autre bouton avant de se connecter. Nettoyé immédiatement après restauration au montage.

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/components/public/mots/vote-section.tsx` | Modifier — retirer disabled, ajouter handler non-auth, logique localStorage, état modal |
| `src/components/public/mots/vote-auth-modal.tsx` | Créer — Dialog shadcn avec Google sign-in |

L'API `POST /api/mots/[slug]/vote` reste **inchangée** — elle garde son check 401.

---

## `VoteAuthModal`

Composant client minimal :

```typescript
interface VoteAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}
```

Contenu du Dialog :
- Titre : "Connecte-toi pour voter"
- Description : "Ton vote sera enregistré dès que tu seras connecté."
- Bouton Google : `authClient.signIn.social({ provider: "google", callbackURL: `/mots/${slug}` })`
- Bouton "Annuler" : ferme le modal, clear localStorage

---

## Changements dans `VoteSection`

### 1. Retirer `disabled={!isAuthenticated}` sur les boutons

Les boutons sont toujours cliquables.

### 2. Handler `handleUnauthClick`

Appelé à la place de `handleConnaissance`/`handleExactitude` quand `!isAuthenticated` :

```typescript
function handleUnauthClick(field: "connaissance" | "exactitude", value: string) {
  localStorage.setItem("pending_vote", JSON.stringify({ slug, field, value }));
  setIsModalOpen(true);
}
```

### 3. Logique de restauration au montage

```typescript
useEffect(() => {
  if (!session?.user) return;
  const raw = localStorage.getItem("pending_vote");
  if (!raw) return;
  try {
    const pending: PendingVote = JSON.parse(raw);
    if (pending.slug !== slug) return;
    localStorage.removeItem("pending_vote");
    if (pending.field === "connaissance") {
      setPendingConnaissance(pending.value as ConnaissanceOption);
    } else {
      setPendingExactitude(pending.value as ExactitudeOption);
    }
  } catch {
    localStorage.removeItem("pending_vote");
  }
}, [session?.user, slug]);
```

### 4. État modal

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 5. Handlers mis à jour

```typescript
function handleConnaissance(value: ConnaissanceOption) {
  if (!isAuthenticated) {
    handleUnauthClick("connaissance", value);
    return;
  }
  // ... logique existante
}

function handleExactitude(value: ExactitudeOption) {
  if (!isAuthenticated) {
    handleUnauthClick("exactitude", value);
    return;
  }
  // ... logique existante
}
```

---

## Ce qui NE change pas

- L'API route `POST /api/mots/[slug]/vote` — garde son 401
- Le schéma Prisma `VoteMot` — `userId` reste `String` (non nullable)
- La logique d'auto-submit existante (`submitVote` quand les deux sélections sont faites)
- ~~Le prompt "Connecte-toi pour voter" en bas de `VoteSection`~~ — **à supprimer** : le modal remplace ce message

---

## Cas limites

- **Utilisateur ferme le modal sans se connecter** : `onOpenChange(false)` + clear localStorage → sélections effacées, boutons reviennent à leur état neutre
- **`pending_vote` pour un slug différent** : ignoré au montage, nettoyé
- **`pending_vote` malformé** : try/catch → nettoyé silencieusement
- **Utilisateur déjà connecté** : les handlers `handleConnaissance`/`handleExactitude` ignorent la logique non-auth, comportement inchangé
