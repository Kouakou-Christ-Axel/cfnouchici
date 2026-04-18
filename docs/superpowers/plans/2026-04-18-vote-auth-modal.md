# Vote Auth Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre aux visiteurs non connectés de cliquer sur les boutons de vote, afficher un modal de connexion, et restaurer leur sélection après login via localStorage.

**Architecture:** Deux fichiers — un nouveau composant `VoteAuthModal` (Dialog shadcn + Google sign-in) et une mise à jour de `VoteSection` (retrait du disabled, localStorage au montage, handlers redirigés). L'API vote reste inchangée (garde son 401). Le pending vote est stocké dans `localStorage["pending_vote"]` avant la redirection OAuth et restauré au montage si l'utilisateur est authentifié.

**Tech Stack:** Next.js 16 App Router, React (Client Components), Better Auth, shadcn/ui Dialog, localStorage

---

## File Map

| Fichier | Action |
|---|---|
| `src/components/public/mots/vote-auth-modal.tsx` | Créer — Dialog avec Google sign-in |
| `src/components/public/mots/vote-section.tsx` | Modifier — retirer disabled, localStorage, modal |

---

## Task 1 : Créer `VoteAuthModal`

**Files:**
- Create: `src/components/public/mots/vote-auth-modal.tsx`

- [ ] **Step 1 : Créer le composant**

Créer `src/components/public/mots/vote-auth-modal.tsx` avec ce contenu exact :

```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VoteAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  onCancel: () => void;
}

export function VoteAuthModal({ open, onOpenChange, slug, onCancel }: VoteAuthModalProps) {
  function handleGoogleLogin() {
    authClient.signIn.social({
      provider: "google",
      callbackURL: `/mots/${slug}`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onCancel();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Connecte-toi pour voter</DialogTitle>
          <DialogDescription>
            Ton vote sera enregistré dès que tu seras connecté.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full gap-2">
            <svg className="size-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Se connecter avec Google
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 3 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/components/public/mots/vote-auth-modal.tsx && rtk git commit -m "feat: add VoteAuthModal component"
```

---

## Task 2 : Mettre à jour `VoteSection`

**Files:**
- Modify: `src/components/public/mots/vote-section.tsx`

- [ ] **Step 1 : Remplacer le contenu complet de `vote-section.tsx`**

Remplacer l'intégralité de `src/components/public/mots/vote-section.tsx` par :

```typescript
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Eye, HelpCircle, Check, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { VoteAuthModal } from "@/components/public/mots/vote-auth-modal";

/* ─── Types ────────────────────────────────────────────── */

type ConnaissanceOption = "OUI_UTILISE" | "CONNAIS" | "JAMAIS_ENTENDU";
type ExactitudeOption = "EXACTE" | "APPROXIMATIVE" | "FAUSSE";

interface VoteSummary {
  totalVotes: number;
  connaissance: Record<ConnaissanceOption, number>;
  exactitude: Record<ExactitudeOption, number>;
}

interface UserVote {
  connaissance: ConnaissanceOption;
  exactitude: ExactitudeOption;
}

interface PendingVote {
  slug: string;
  field: "connaissance" | "exactitude";
  value: string;
}

/* ─── Option configs ────────────────────────────────────── */

const CONNAISSANCE_OPTIONS: {
  value: ConnaissanceOption;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "OUI_UTILISE", label: "Oui, je l'utilise", icon: ThumbsUp },
  { value: "CONNAIS", label: "Je le connais", icon: Eye },
  { value: "JAMAIS_ENTENDU", label: "Jamais entendu", icon: HelpCircle },
];

const EXACTITUDE_OPTIONS: {
  value: ExactitudeOption;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "EXACTE", label: "Exacte", icon: Check },
  { value: "APPROXIMATIVE", label: "Approximative", icon: AlertTriangle },
  { value: "FAUSSE", label: "Fausse", icon: X },
];

/* ─── Component ─────────────────────────────────────────── */

interface VoteSectionProps {
  slug: string;
}

export function VoteSection({ slug }: VoteSectionProps) {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const [summary, setSummary] = useState<VoteSummary | null>(null);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [pendingConnaissance, setPendingConnaissance] = useState<ConnaissanceOption | null>(null);
  const [pendingExactitude, setPendingExactitude] = useState<ExactitudeOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ── Fetch summary ────────────────────────────────────── */
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/mots/${slug}/vote`);
      if (res.ok) {
        const data: VoteSummary = await res.json();
        setSummary(data);
      }
    } catch {
      // silently ignore network errors
    }
  }, [slug]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* ── Restore pending vote after login ────────────────── */
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

  /* ── Submit vote ──────────────────────────────────────── */
  const submitVote = useCallback(
    async (connaissance: ConnaissanceOption, exactitude: ExactitudeOption) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/mots/${slug}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connaissance, exactitude }),
        });
        if (res.ok) {
          setUserVote({ connaissance, exactitude });
          await fetchSummary();
        }
      } catch {
        // silently ignore network errors
      } finally {
        setIsSubmitting(false);
      }
    },
    [slug, isSubmitting, fetchSummary]
  );

  /* ── Handle unauth click ────────────────────────────── */
  function handleUnauthClick(field: "connaissance" | "exactitude", value: string) {
    localStorage.setItem("pending_vote", JSON.stringify({ slug, field, value }));
    setIsModalOpen(true);
  }

  /* ── Handle modal cancel ────────────────────────────── */
  function handleModalCancel() {
    localStorage.removeItem("pending_vote");
  }

  /* ── Handle selection ─────────────────────────────────── */
  function handleConnaissance(value: ConnaissanceOption) {
    if (!isAuthenticated) {
      handleUnauthClick("connaissance", value);
      return;
    }
    const next = pendingConnaissance === value ? null : value;
    setPendingConnaissance(next);
    if (next && pendingExactitude) {
      submitVote(next, pendingExactitude);
    }
  }

  function handleExactitude(value: ExactitudeOption) {
    if (!isAuthenticated) {
      handleUnauthClick("exactitude", value);
      return;
    }
    const next = pendingExactitude === value ? null : value;
    setPendingExactitude(next);
    if (pendingConnaissance && next) {
      submitVote(pendingConnaissance, next);
    }
  }

  /* ── Resolve active selections (submitted vote takes priority) */
  const activeConnaissance = userVote?.connaissance ?? pendingConnaissance;
  const activeExactitude = userVote?.exactitude ?? pendingExactitude;

  return (
    <>
      <VoteAuthModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        slug={slug}
        onCancel={handleModalCancel}
      />

      <Card className="gap-0 py-0">
        <CardContent className="px-5 py-5 space-y-6">

          {/* ── Question 1 ──────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Tu connais ce mot ?
            </p>
            <div className="flex flex-wrap gap-2">
              {CONNAISSANCE_OPTIONS.map(({ value, label, icon: Icon }) => {
                const count = summary?.connaissance[value] ?? 0;
                const isSelected = activeConnaissance === value;
                return (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleConnaissance(value)}
                    className={cn(
                      "gap-2",
                      isSelected && "border-foreground bg-muted"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                    {summary && (
                      <span className="ml-1 font-semibold text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* ── Question 2 ──────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              La définition est correcte ?
            </p>
            <div className="flex flex-wrap gap-2">
              {EXACTITUDE_OPTIONS.map(({ value, label, icon: Icon }) => {
                const count = summary?.exactitude[value] ?? 0;
                const isSelected = activeExactitude === value;
                return (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleExactitude(value)}
                    className={cn(
                      "gap-2",
                      isSelected && "border-foreground bg-muted"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                    {summary && (
                      <span className="ml-1 font-semibold text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
```

Changements clés vs l'original :
- `disabled={!isAuthenticated || isSubmitting}` → `disabled={isSubmitting}` (boutons toujours cliquables)
- Ajout de `isModalOpen` state
- Ajout de l'`useEffect` de restauration localStorage
- Ajout de `handleUnauthClick` et `handleModalCancel`
- `handleConnaissance`/`handleExactitude` redirigent vers `handleUnauthClick` si non-auth
- Le prompt "Connecte-toi pour voter" en bas est supprimé
- `<VoteAuthModal />` ajouté en dehors du `<Card>`
- L'import `Link` est retiré (plus utilisé)

- [ ] **Step 2 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 3 : Lancer les tests**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && pnpm vitest run
```

Attendu : 149 tests passent (aucune régression).

- [ ] **Step 4 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/components/public/mots/vote-section.tsx && rtk git commit -m "feat: open vote buttons to all users, show auth modal on click"
```

---

## Vérification manuelle

Après les deux commits, vérifier manuellement dans le navigateur :

**Scénario 1 — Utilisateur non connecté :**
1. Aller sur `/mots/[slug]` sans être connecté
2. Cliquer sur "Oui, je l'utilise" → le Dialog s'ouvre
3. Cliquer "Annuler" → le Dialog se ferme, `localStorage["pending_vote"]` est vide
4. Cliquer à nouveau "Oui, je l'utilise" → Dialog s'ouvre
5. Cliquer "Se connecter avec Google" → OAuth redirect vers `/mots/[slug]`
6. Après login : vérifier que "Oui, je l'utilise" est pré-sélectionné
7. Cliquer "Exacte" → le vote est soumis, les compteurs se mettent à jour

**Scénario 2 — Utilisateur déjà connecté :**
1. Aller sur `/mots/[slug]` connecté
2. Cliquer "Je le connais" → sélectionné, pas de modal
3. Cliquer "Approximative" → vote soumis immédiatement, compteurs mis à jour

**Scénario 3 — localStorage pour un autre slug :**
1. Manuellement setter `localStorage["pending_vote"] = JSON.stringify({ slug: "autre-mot", field: "connaissance", value: "OUI_UTILISE" })`
2. Aller sur `/mots/goumin` connecté
3. Vérifier : aucun bouton pré-sélectionné (slug ne correspond pas)
4. Vérifier : `localStorage["pending_vote"]` est vide (nettoyé)
