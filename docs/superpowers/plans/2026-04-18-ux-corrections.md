# UX Corrections nouchi.ci — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réduire les frictions UX identifiées par l'audit — contribution anonyme, ShareButton fiche mot, homepage ISR, et polish d'irritants.

**Architecture:** 3 phases séquentielles : API (mutation nullable + route anonyme) → pages bloquantes (proposer, fiche mot, homepage) → irritants (navigation, typos, nettoyage). Chaque phase est committable indépendamment.

**Tech Stack:** Next.js 16 App Router, Prisma, Better Auth, Vitest (tests d'intégration sur DB réelle), React Hook Form, shadcn/ui

---

## File Map

| Fichier | Action | Phase |
|---|---|---|
| `src/lib/share.ts` | Modifier — supprimer `?vote=1`, mettre à jour textes | 3 |
| `src/components/public/mots/word-interactions.tsx` | Supprimer | 3 |
| `src/lib/mutations/mots.ts` | Modifier — `userId: string \| null` | 1 |
| `src/app/api/mots/route.ts` | Modifier — POST anonyme | 1 |
| `src/app/(public)/proposer/page.tsx` | Modifier — retirer auth guard | 2 |
| `src/components/public/proposer/proposer-form.tsx` | Modifier — section compte dans succès | 2 |
| `src/app/(public)/mots/[slug]/page.tsx` | Modifier — ajouter ShareButton | 2 |
| `src/app/(public)/page.tsx` | Modifier — ISR + pass props | 2 |
| `src/components/public/accueil/hero-section.tsx` | Modifier — recevoir props + CTA proposer | 2 |
| `src/components/public/accueil/popular-words-section.tsx` | Modifier — recevoir mots en prop | 2 |
| `src/components/public/accueil/hero-search.tsx` | Modifier — masquer ⌘K sur mobile | 3 |
| `src/config/navigation.ts` | Modifier — typo À propos | 3 |
| `src/app/(public)/connexion/page.tsx` | Modifier — callbackURL dynamique | 3 |
| `src/app/(public)/mots/lettre/[lettre]/page.tsx` | Modifier — prev/next lettres | 3 |
| `src/tests/api/mots-create.test.ts` | Modifier — ajouter test null userId | 1 |
| `src/tests/share.test.ts` | Créer — tests unitaires share.ts | 3 |

---

## Phase 1 — API : contribution anonyme

### Task 1 : Mutation `createMot` — userId nullable

**Files:**
- Modify: `src/lib/mutations/mots.ts`
- Modify: `src/tests/api/mots-create.test.ts`

- [ ] **Step 1 : Écrire le test qui vérifie la soumission anonyme**

Ajouter dans `src/tests/api/mots-create.test.ts`, à la suite des tests existants :

```typescript
it("creates a word without a user (anonymous)", async () => {
  const mot = await createMot(
    { mot: "Gogoro", definition: "Quelqu'un de bizarre", exemples: [] },
    null
  );
  expect(mot.statut).toBe("EN_ATTENTE");
  expect(mot.soumisParId).toBeNull();
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk vitest run src/tests/api/mots-create.test.ts
```

Attendu : erreur TypeScript ou FAIL — `userId` attend `string`, pas `null`.

- [ ] **Step 3 : Mettre à jour la mutation**

Dans `src/lib/mutations/mots.ts`, modifier la signature de `createMot` :

```typescript
export async function createMot(input: CreateMotInput, userId: string | null) {
  const slug = generateSlug(input.mot);

  const existing = await db.mot.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("SLUG_EXISTS");
  }

  return db.mot.create({
    data: {
      slug,
      mot: input.mot,
      definition: input.definition,
      categorie: input.categorie ?? null,
      statut: "EN_ATTENTE",
      soumisParId: userId,
      exemples: {
        create: (input.exemples ?? []).map((phrase) => ({ phrase })),
      },
    },
    include: { exemples: true },
  });
}
```

Aucune autre ligne à changer — `soumisParId` est déjà `String?` dans le schema Prisma.

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk vitest run src/tests/api/mots-create.test.ts
```

Attendu : 4 tests PASS.

- [ ] **Step 5 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/lib/mutations/mots.ts src/tests/api/mots-create.test.ts && rtk git commit -m "feat: allow anonymous word submissions (nullable userId)"
```

---

### Task 2 : Route API POST — accepter les soumissions anonymes

**Files:**
- Modify: `src/app/api/mots/route.ts`

- [ ] **Step 1 : Mettre à jour la route POST**

Remplacer le contenu de la fonction `POST` dans `src/app/api/mots/route.ts` :

```typescript
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;

  const body = await request.json();
  const parsed = createMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const mot = await createMot(parsed.data, userId);
    return NextResponse.json(mot, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "SLUG_EXISTS") {
      return NextResponse.json({ error: "Ce mot existe déjà" }, { status: 409 });
    }
    throw e;
  }
}
```

Le bloc `if (!session) return 401` est supprimé. Tout le reste est identique.

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 3 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/app/api/mots/route.ts && rtk git commit -m "feat: allow unauthenticated POST /api/mots"
```

---

## Phase 2 — Pages bloquantes

### Task 3 : Page `/proposer` — retirer l'auth guard

**Files:**
- Modify: `src/app/(public)/proposer/page.tsx`

- [ ] **Step 1 : Retirer `getSessionOrRedirect`**

Remplacer le contenu complet de `src/app/(public)/proposer/page.tsx` :

```typescript
import { ProposerForm } from "@/components/public/proposer/proposer-form";

export default function ProposerPage() {
  return (
    <div className="content-container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
            Proposer un mot
          </h1>
          <p className="text-muted-foreground text-sm">
            Soumets un mot nouchi au dictionnaire. Il sera examiné par un modérateur avant publication.
          </p>
        </header>
        <ProposerForm />
      </div>
    </div>
  );
}
```

La page n'est plus async — plus besoin d'`await`.

- [ ] **Step 2 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 3 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/app/(public)/proposer/page.tsx && rtk git commit -m "feat: open /proposer to unauthenticated users"
```

---

### Task 4 : `ProposerForm` — section "crée un compte" dans l'écran succès

**Files:**
- Modify: `src/components/public/proposer/proposer-form.tsx`

- [ ] **Step 1 : Ajouter l'import `authClient`**

En tête du fichier, ajouter parmi les imports existants :

```typescript
import { authClient } from "@/lib/auth-client";
```

- [ ] **Step 2 : Ajouter la détection de session dans le composant**

Au début du composant `ProposerForm`, après les déclarations `useState` existantes, ajouter :

```typescript
const { data: session } = authClient.useSession();
const isAuthenticated = !!session?.user;
```

- [ ] **Step 3 : Mettre à jour l'écran de succès**

Remplacer le bloc `if (status === "success") { return ( ... ) }` complet par :

```typescript
if (status === "success") {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <CheckCircle className="size-12 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-semibold">Mot soumis avec succès !</h2>
        <p className="text-muted-foreground">
          Ton mot sera examiné par un modérateur avant d&apos;être publié. En attendant, partage-le pour que la communauté puisse voter !
        </p>

        {submittedSlug && submittedMot && (
          <div className="flex justify-center pt-2">
            <ShareButton mot={submittedMot} slug={submittedSlug} variant="default" />
          </div>
        )}

        {!isAuthenticated && (
          <div className="rounded-lg border border-border bg-muted/50 px-5 py-4 space-y-3 text-left">
            <p className="text-sm font-medium">Suis tes contributions</p>
            <p className="text-sm text-muted-foreground">
              Crée un compte pour être notifié quand ton mot est publié.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() =>
                authClient.signIn.social({ provider: "google", callbackURL: "/" })
              }
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Se connecter avec Google
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/mots">Voir le dictionnaire</Link>
          </Button>
          <Button
            onClick={() => {
              form.reset();
              setStatus("idle");
              setSubmittedSlug(null);
              setSubmittedMot(null);
            }}
            className="rounded-full"
          >
            Proposer un autre mot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 5 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/components/public/proposer/proposer-form.tsx && rtk git commit -m "feat: show account creation prompt after anonymous word submission"
```

---

### Task 5 : ShareButton sur la fiche mot

**Files:**
- Modify: `src/app/(public)/mots/[slug]/page.tsx`

- [ ] **Step 1 : Ajouter l'import ShareButton**

Dans les imports de `src/app/(public)/mots/[slug]/page.tsx`, ajouter :

```typescript
import { ShareButton } from "@/components/share/share-button";
```

- [ ] **Step 2 : Mettre à jour le header de la fiche**

Remplacer le bloc `<header className="space-y-4">` par :

```tsx
<header className="space-y-4">
  <div className="flex items-center justify-between gap-3">
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor(mot.categorie)}`}>
      {categoryLabel(mot.categorie)}
    </span>
    <ShareButton mot={mot.mot} slug={slug} size="sm" variant="outline" />
  </div>
  <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight uppercase leading-none">
    {mot.mot}
  </h1>
</header>
```

- [ ] **Step 3 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 4 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/app/(public)/mots/\[slug\]/page.tsx && rtk git commit -m "feat: add ShareButton to word detail page"
```

---

### Task 6 : Homepage ISR + déduplication `getPopularMots`

**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/components/public/accueil/hero-section.tsx`
- Modify: `src/components/public/accueil/popular-words-section.tsx`

- [ ] **Step 1 : Mettre à jour `PopularWordsSection` pour accepter `mots` en prop**

Remplacer le contenu complet de `src/components/public/accueil/popular-words-section.tsx` :

```typescript
import Link from "next/link";
import type { Categorie } from "@/generated/prisma";
import { WordCard } from "@/components/public/accueil/word-card";

interface MotSummary {
  slug: string;
  mot: string;
  definition: string | null;
  categorie: Categorie | null;
  soumisPar: { name: string } | null;
}

interface PopularWordsSectionProps {
  mots: MotSummary[];
}

function PopularWordsSection({ mots }: PopularWordsSectionProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="content-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-(family-name:--font-heading) text-2xl font-extrabold tracking-tight">
            Mots du moment
          </h2>
          <Link
            href="/mots"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mots.map((mot) => (
            <WordCard
              key={mot.slug}
              slug={mot.slug}
              mot={mot.mot}
              definition={mot.definition ?? ""}
              categorie={mot.categorie}
              authorName={mot.soumisPar?.name ?? null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularWordsSection;
```

- [ ] **Step 2 : Mettre à jour `HeroSection` pour recevoir les données en props**

Remplacer le contenu complet de `src/components/public/accueil/hero-section.tsx` :

```typescript
import type { Categorie } from "@/generated/prisma";
import { HeroTitle } from "@/components/public/accueil/hero-title";
import { HeroSearch } from "@/components/public/accueil/hero-search";
import { HeroTags } from "@/components/public/accueil/hero-tags";
import { HeroStats } from "@/components/public/accueil/hero-stats";
import Link from "next/link";
import { PenLine } from "lucide-react";

interface HeroSectionProps {
  mots: { slug: string; mot: string }[];
  wordCount: number;
  contributorCount: number;
  voteCount: number;
}

export default function HeroSection({ mots, wordCount, contributorCount, voteCount }: HeroSectionProps) {
  const tags = mots.map((m) => ({ slug: m.slug, mot: m.mot }));

  return (
    <section className="py-16 md:py-24 text-center">
      <div className="content-container">
        <HeroTitle wordCount={wordCount} />
        <HeroSearch />
        <div className="flex justify-center mt-4">
          <Link
            href="/proposer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-2 hover:border-foreground/30 transition-all"
          >
            <PenLine className="size-3.5" />
            Proposer un mot
          </Link>
        </div>
        <HeroTags mots={tags} />
        <HeroStats stats={{ mots: wordCount, contributeurs: contributorCount, votes: voteCount }} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : Mettre à jour la homepage — ISR + fetch unique**

Remplacer le contenu complet de `src/app/(public)/page.tsx` :

```typescript
import type { Metadata } from "next";
import HeroSection from "@/components/public/accueil/hero-section";
import PopularWordsSection from "@/components/public/accueil/popular-words-section";
import RecentWordsSection from "@/components/public/accueil/recent-words-section";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { getPopularMots } from "@/lib/queries/mots";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const count = await db.mot.count({ where: { statut: "VALIDE" } });
  return {
    title: "Nouchici — Le dictionnaire du nouchi ivoirien",
    description: `Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. ${count > 0 ? `+${count}` : "Des"} mots documentés par la communauté.`,
  };
}

export default async function Home() {
  const [mots, wordCount, contributorCount, voteCount] = await Promise.all([
    getPopularMots(6),
    db.mot.count({ where: { statut: "VALIDE" } }),
    db.user.count(),
    db.voteMot.count(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nouchici",
    url: process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci",
    description: "Le dictionnaire collaboratif du nouchi, l'argot urbain ivoirien.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci"}/mots?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection
        mots={mots}
        wordCount={wordCount}
        contributorCount={contributorCount}
        voteCount={voteCount}
      />
      <Separator />
      <PopularWordsSection mots={mots} />
      <Separator />
      <RecentWordsSection />
    </>
  );
}
```

- [ ] **Step 4 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 5 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/app/\(public\)/page.tsx src/components/public/accueil/hero-section.tsx src/components/public/accueil/popular-words-section.tsx && rtk git commit -m "perf: homepage ISR + deduplicate getPopularMots, add propose CTA in hero"
```

---

## Phase 3 — Irritants

### Task 7 : Nettoyage `share.ts` — supprimer `?vote=1`

**Files:**
- Modify: `src/lib/share.ts`
- Create: `src/tests/share.test.ts`

- [ ] **Step 1 : Écrire les tests unitaires**

Créer `src/tests/share.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { getShareUrl, getWhatsAppShareUrl, getTwitterShareUrl } from "@/lib/share";

describe("share utilities", () => {
  it("getShareUrl does not include vote=1", () => {
    const url = getShareUrl({ slug: "goumin", baseUrl: "https://nouchi.ci" });
    expect(url).not.toContain("vote=1");
    expect(url).toBe("https://nouchi.ci/mots/goumin?utm_source=share&utm_medium=link");
  });

  it("getWhatsAppShareUrl contains the word and link", () => {
    const url = getWhatsAppShareUrl({ mot: "Goumin", slug: "goumin", baseUrl: "https://nouchi.ci" });
    expect(url).toContain("wa.me");
    expect(url).toContain("Goumin");
    expect(url).not.toContain("vote=1");
  });

  it("getTwitterShareUrl contains the word and flag", () => {
    const url = getTwitterShareUrl({ mot: "Goumin", slug: "goumin", baseUrl: "https://nouchi.ci" });
    expect(url).toContain("x.com/intent/tweet");
    expect(url).toContain("Goumin");
  });
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk vitest run src/tests/share.test.ts
```

Attendu : FAIL — l'URL contient encore `vote=1`.

- [ ] **Step 3 : Mettre à jour `share.ts`**

Remplacer le contenu complet de `src/lib/share.ts` :

```typescript
interface ShareParams {
  mot: string;
  slug: string;
  baseUrl?: string;
}

export function getShareUrl({ slug, baseUrl }: Pick<ShareParams, "slug" | "baseUrl">): string {
  const base = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "https://nouchi.ci");
  return `${base}/mots/${slug}?utm_source=share&utm_medium=link`;
}

export function getWhatsAppShareUrl({ mot, slug, baseUrl }: ShareParams): string {
  const url = getShareUrl({ slug, baseUrl });
  const text = `Tu connais "${mot}" ? Découvres-le → ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl({ mot, slug, baseUrl }: ShareParams): string {
  const url = getShareUrl({ slug, baseUrl });
  const text = `"${mot}" en Nouchi 🇨🇮 → ${url}`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export async function nativeShare({ mot, slug }: ShareParams): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const url = getShareUrl({ slug });
  try {
    await navigator.share({
      title: `Tu connais "${mot}" en Nouchi ?`,
      text: `Découvre la définition de "${mot}" — le dictionnaire du Nouchi`,
      url,
    });
    return true;
  } catch {
    return false;
  }
}

export async function copyShareLink({ slug }: Pick<ShareParams, "slug">): Promise<boolean> {
  const url = getShareUrl({ slug });
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk vitest run src/tests/share.test.ts
```

Attendu : 3 tests PASS.

- [ ] **Step 5 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/lib/share.ts src/tests/share.test.ts && rtk git commit -m "fix: remove ?vote=1 from share URLs, update share texts"
```

---

### Task 8 : Supprimer le composant mort `word-interactions.tsx`

**Files:**
- Delete: `src/components/public/mots/word-interactions.tsx`

- [ ] **Step 1 : Vérifier qu'aucun fichier n'importe ce composant**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk grep "word-interactions" src/
```

Attendu : aucun résultat (seul le fichier lui-même).

- [ ] **Step 2 : Supprimer le fichier**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rm src/components/public/mots/word-interactions.tsx
```

- [ ] **Step 3 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 4 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add -A && rtk git commit -m "chore: remove unused word-interactions component"
```

---

### Task 9 : Masquer `⌘K` sur mobile

**Files:**
- Modify: `src/components/public/accueil/hero-search.tsx`

- [ ] **Step 1 : Ajouter `hidden md:flex` sur le `<kbd>`**

Dans `src/components/public/accueil/hero-search.tsx`, remplacer :

```tsx
<kbd className="flex items-center gap-1 text-xs text-muted-foreground border rounded px-1.5 py-0.5 font-mono mr-4 shrink-0">
  ⌘K
</kbd>
```

par :

```tsx
<kbd className="hidden md:flex items-center gap-1 text-xs text-muted-foreground border rounded px-1.5 py-0.5 font-mono mr-4 shrink-0">
  ⌘K
</kbd>
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 3 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/components/public/accueil/hero-search.tsx && rtk git commit -m "fix: hide ⌘K shortcut hint on mobile"
```

---

### Task 10 : Corriger la typo "À propos" dans la navigation

**Files:**
- Modify: `src/config/navigation.ts`

- [ ] **Step 1 : Corriger le titre**

Dans `src/config/navigation.ts`, remplacer :

```typescript
{ title: 'A Propos', href: '/a-propos' },
```

par :

```typescript
{ title: 'À propos', href: '/a-propos' },
```

- [ ] **Step 2 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/config/navigation.ts && rtk git commit -m "fix: correct accented À propos in navigation"
```

---

### Task 11 : Connexion — `callbackURL` dynamique

**Files:**
- Modify: `src/app/(public)/connexion/page.tsx`

- [ ] **Step 1 : Transformer en Server Component avec Client child**

La page de connexion est actuellement un Client Component (`"use client"`). Pour lire les `searchParams` côté serveur, on va extraire la logique du bouton dans un composant client séparé.

Créer `src/components/public/connexion/connexion-form.tsx` :

```typescript
"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface ConnexionFormProps {
  callbackURL: string;
}

export function ConnexionForm({ callbackURL }: ConnexionFormProps) {
  const handleGoogleLogin = () => {
    authClient.signIn.social({ provider: "google", callbackURL });
  };

  return (
    <Button onClick={handleGoogleLogin} variant="outline" className="w-full gap-2">
      <svg className="size-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Se connecter avec Google
    </Button>
  );
}
```

- [ ] **Step 2 : Mettre à jour `connexion/page.tsx`**

Remplacer le contenu complet de `src/app/(public)/connexion/page.tsx` :

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { ConnexionForm } from "@/components/public/connexion/connexion-form";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const callbackURL = callbackUrl ?? "/";

  return (
    <div className="content-container py-20 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground">
              Connecte-toi pour proposer des mots au dictionnaire.
            </p>
          </div>
          <ConnexionForm callbackURL={callbackURL} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 4 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/app/\(public\)/connexion/page.tsx src/components/public/connexion/connexion-form.tsx && rtk git commit -m "feat: dynamic callbackURL on connexion page"
```

---

### Task 12 : Navigation prev/next entre lettres

**Files:**
- Modify: `src/app/(public)/mots/lettre/[lettre]/page.tsx`

- [ ] **Step 1 : Mettre à jour la page**

Remplacer le bloc de navigation en bas de page (le `<div className="flex items-center justify-between gap-4">`) ET ajouter la logique de calcul prev/next. Voici les changements à apporter à `src/app/(public)/mots/lettre/[lettre]/page.tsx` :

Après `const mots = await listMotsValidesByLettre(letter);`, ajouter :

```typescript
const allMots = await listAllMotsValides();
const availableLetters = [...new Set(allMots.map((m) => m.mot[0].toUpperCase()))].sort();
const currentIndex = availableLetters.indexOf(letter);
const prevLetter = currentIndex > 0 ? availableLetters[currentIndex - 1] : null;
const nextLetter = currentIndex < availableLetters.length - 1 ? availableLetters[currentIndex + 1] : null;
```

Puis remplacer le bloc navigation en bas de page :

```tsx
{/* Navigation entre lettres */}
<Separator />
<div className="flex items-center justify-between gap-4">
  <div>
    {prevLetter ? (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/mots/lettre/${prevLetter.toLowerCase()}`}>
          <ArrowLeft className="size-3.5 mr-1" />
          Lettre {prevLetter}
        </Link>
      </Button>
    ) : (
      <div />
    )}
  </div>
  <Button variant="ghost" size="sm" asChild>
    <Link href="/mots">Toutes les lettres</Link>
  </Button>
  <div>
    {nextLetter ? (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/mots/lettre/${nextLetter.toLowerCase()}`}>
          Lettre {nextLetter}
          <ArrowRight className="size-3.5 ml-1" />
        </Link>
      </Button>
    ) : (
      <div />
    )}
  </div>
</div>
```

Vérifier que `ArrowRight` est importé — il l'est déjà dans ce fichier.

- [ ] **Step 2 : Vérifier la compilation**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs.

- [ ] **Step 3 : Lancer la suite de tests complète**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk vitest run
```

Attendu : tous les tests passent.

- [ ] **Step 4 : Committer**

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk git add src/app/\(public\)/mots/lettre/\[lettre\]/page.tsx && rtk git commit -m "feat: add prev/next letter navigation on lettre pages"
```

---

## Vérification finale

- [ ] Lancer la suite de tests complète une dernière fois

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk vitest run
```

Attendu : tous les tests passent (inclut les nouveaux tests `mots-create` et `share`).

- [ ] Vérifier la compilation TypeScript globale

```bash
cd C:/Users/kouax/WebstormProjects/cfnouchici && rtk tsc
```

Attendu : 0 erreurs, 0 warnings.
