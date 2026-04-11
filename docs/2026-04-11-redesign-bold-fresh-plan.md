# Homepage Redesign "Bold & Fresh" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete visual overhaul of the Nouchici homepage — new palette, typography (Space Grotesk), navbar, hero, word cards, and SEO — following the "Bold & Fresh" design direction.

**Architecture:** CSS variables updated in globals.css for the new palette. Space Grotesk loaded via next/font/google. Navbar rebuilt with plain HTML/Tailwind (dropping HeroUI Navbar). Hero section split into 4 sub-components (<250 lines each). Old animation components deleted. SEO via Next.js metadata + JSON-LD. All components use shadcn primitives.

**Tech Stack:** Next.js 16, Tailwind CSS 4, shadcn (Button, Card, Badge, Input, Separator, Avatar), Space Grotesk + Inter fonts, lucide-react icons

---

### Task 1: Update design tokens and fonts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace CSS variables in globals.css**

Replace the entire `:root` block with the new "Bold & Fresh" palette. Replace the `.dark` block with a matching dark variant. Key changes:
- `--background`: `#FFFFFF` (was blue-gray)
- `--foreground`: `#111111` (was gray)
- `--card`: `#FAFAFA`
- `--primary`: `#111111` (was orange)
- `--primary-foreground`: `#FFFFFF`
- `--secondary`: `#F5F5F5`
- `--muted`: `#F5F5F5`
- `--muted-foreground`: `#999999`
- `--border`: `#F0F0F0`
- `--input`: `#FAFAFA`
- `--ring`: `#111111`
- `--destructive`: `#EF4444`
- `--font-sans`: `'Space Grotesk', 'Inter', sans-serif`
- `--radius`: `0.75rem`

For dark mode, use:
- `--background`: `#0A0A0A`
- `--foreground`: `#FAFAFA`
- `--card`: `#141414`
- `--border`: `#262626`
- `--muted`: `#1A1A1A`
- `--muted-foreground`: `#888888`
- `--input`: `#1A1A1A`

Keep the `@theme inline`, `@layer base`, `.content-container`, and `.h-screen-nav` blocks as-is. Add a utility class for the gradient accent text:

```css
.text-accent-gradient {
  background: linear-gradient(135deg, #EF4444, #F97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 2: Load Space Grotesk in layout.tsx**

Update `src/app/layout.tsx`:
- Import `Space_Grotesk` from `next/font/google` alongside `Inter`
- Configure both fonts with CSS variables
- Add `--font-heading` CSS variable for Space Grotesk
- Update global metadata to the SEO values from the spec
- Remove `Geist_Mono` import (unused in new design)

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layouts/general/navbar";
import { Providers } from "@/components/Providers";
import Footer from "@/components/layouts/general/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nouchici — Le dictionnaire du nouchi ivoirien",
    template: "%s — Nouchici",
  },
  description:
    "Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. +400 mots documentés par la communauté.",
  openGraph: {
    title: "Nouchici — Le dictionnaire du nouchi ivoirien",
    description:
      "Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire.",
    type: "website",
    locale: "fr_FR",
    siteName: "Nouchici",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nouchici — Le dictionnaire du nouchi ivoirien",
    description:
      "Le street talk ivoirien, expliqué par ceux qui le parlent.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: update design tokens to Bold & Fresh palette with Space Grotesk"
```

---

### Task 2: Update category colors

**Files:**
- Modify: `src/lib/category.ts`

- [ ] **Step 1: Replace category color map with pastel variants**

```ts
export const CATEGORY_COLORS: Record<string, string> = {
  VERBE:      "bg-red-100 text-red-600",
  NOM:        "bg-blue-100 text-blue-600",
  ADJECTIF:   "bg-purple-100 text-purple-600",
  EXPRESSION: "bg-emerald-100 text-emerald-600",
  ADVERBE:    "bg-amber-100 text-amber-600",
};

export const CATEGORY_LABELS: Record<string, string> = {
  VERBE: "Verbe",
  NOM: "Nom",
  ADJECTIF: "Adjectif",
  EXPRESSION: "Expression",
  ADVERBE: "Adverbe",
};

export function categoryColor(cat: string | null) {
  return CATEGORY_COLORS[cat ?? ""] ?? "bg-muted text-muted-foreground";
}

export function categoryLabel(cat: string | null) {
  return CATEGORY_LABELS[cat ?? ""] ?? cat ?? "—";
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/category.ts
git commit -m "feat: update category badge colors to pastel style"
```

---

### Task 3: Rebuild Navbar

**Files:**
- Rewrite: `src/components/layouts/general/navbar.tsx`
- Create: `src/components/layouts/general/nav-links.tsx`
- Create: `src/components/layouts/general/nav-auth.tsx`

The navbar currently uses HeroUI components (`UINavbar`, `NavbarBrand`, etc.). Replace with plain HTML + Tailwind + shadcn Button. Drop the HeroUI dependency from the navbar entirely.

- [ ] **Step 1: Create `src/components/layouts/general/nav-links.tsx`**

A `"use client"` component that renders the navigation links. Uses `usePathname()` for active state detection. Accepts `navLinks` array as prop. Active link is `text-foreground font-semibold`, inactive is `text-muted-foreground hover:text-foreground transition-colors`. Uses shadcn `cn()` for conditional classes. Also handles mobile menu (list items in a sheet or simply visible/hidden via state).

Props: `links: { title: string; href: string }[]`, `className?: string`

- [ ] **Step 2: Create `src/components/layouts/general/nav-auth.tsx`**

A `"use client"` component for the auth section. Uses `authClient.useSession()`. Shows:
- Not logged in: "Se connecter" text link + "Proposer un mot" pill button (shadcn Button with `className="rounded-full"`)
- Logged in: Shield icon link to `/admin` (if MODERATEUR/ADMIN), Avatar, LogOut button, "Proposer un mot" pill button

Uses shadcn `Button`, `Avatar`, `AvatarFallback`, `AvatarImage`. All from existing `@/components/ui/`.

- [ ] **Step 3: Rewrite `src/components/layouts/general/navbar.tsx`**

The orchestrator. A `"use client"` component:

```tsx
"use client";

import Link from "next/link";
import { NavLinks } from "@/components/layouts/general/nav-links";
import { NavAuth } from "@/components/layouts/general/nav-auth";
import { navLinks } from "@/config/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="content-container flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-xl font-extrabold tracking-tight"
        >
          nouchi<span className="text-red-500">.</span>ci
        </Link>

        <NavLinks links={navLinks} className="hidden md:flex" />

        <div className="hidden md:flex">
          <NavAuth />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <NavLinks links={navLinks} className="flex flex-col gap-2 py-4" />
          <NavAuth />
        </div>
      )}
    </header>
  );
}
```

No HeroUI imports. Max 80 lines.

- [ ] **Step 4: Remove ThemeSwitcher import from navbar** (dark mode deferred)

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layouts/general/
git commit -m "feat: rebuild navbar with plain Tailwind + shadcn (drop HeroUI)"
```

---

### Task 4: Hero section — title + search + tags + stats

**Files:**
- Rewrite: `src/components/public/accueil/hero-section.tsx`
- Create: `src/components/public/accueil/hero-title.tsx`
- Create: `src/components/public/accueil/hero-search.tsx`
- Create: `src/components/public/accueil/hero-tags.tsx`
- Create: `src/components/public/accueil/hero-stats.tsx`

- [ ] **Step 1: Create `src/components/public/accueil/hero-title.tsx`**

Server component. Props: `wordCount: number`. Renders:
- Pill badge: `🇨🇮 +{wordCount} mots documentés par la communauté` — `bg-muted text-muted-foreground border border-border rounded-full px-4 py-1.5 text-sm`
- h1: `font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95]` — "C'est quoi / ce **mot** là ?" with "mot" using `.text-accent-gradient` class
- Subtitle p: `text-muted-foreground text-base md:text-lg mt-4`

- [ ] **Step 2: Create `src/components/public/accueil/hero-search.tsx`**

`"use client"` component. A search form with:
- Wrapper: `flex items-center max-w-xl mx-auto bg-card border border-border rounded-full overflow-hidden mt-8`
- Search icon (lucide `Search`) on the left, padding
- Input: `flex-1 bg-transparent border-0 outline-none px-3 py-4 text-base placeholder:text-muted-foreground`
- Button: shadcn `Button` with `className="rounded-full m-1.5"` — text "Chercher"
- On submit: navigate to `/mots?search={query}` using `useRouter`

- [ ] **Step 3: Create `src/components/public/accueil/hero-tags.tsx`**

Server component. Props: `mots: { slug: string; mot: string }[]`. Renders:
- Container: `flex items-center justify-center gap-2 flex-wrap mt-6`
- Label: `text-sm text-muted-foreground` — "Populaires :"
- First tag: shadcn `Badge` with `className="rounded-full bg-foreground text-background hover:bg-foreground/80"` — "🔥 {mot}"
- Other tags: shadcn `Badge variant="secondary"` with `className="rounded-full"` — each a `Link` to `/mots/{slug}`

- [ ] **Step 4: Create `src/components/public/accueil/hero-stats.tsx`**

Server component. Props: `stats: { mots: number; contributeurs: number; votes: number }`. Renders:
- Container: `flex justify-center gap-10 md:gap-16 mt-12 pt-8 border-t border-border`
- Each stat: value in `font-[family-name:var(--font-heading)] text-3xl font-extrabold` + label in `text-xs text-muted-foreground uppercase tracking-widest mt-1`

- [ ] **Step 5: Rewrite `src/components/public/accueil/hero-section.tsx`**

Server component orchestrator. Fetches data and composes sub-components:

```tsx
import { db } from "@/lib/db";
import { HeroTitle } from "@/components/public/accueil/hero-title";
import { HeroSearch } from "@/components/public/accueil/hero-search";
import { HeroTags } from "@/components/public/accueil/hero-tags";
import { HeroStats } from "@/components/public/accueil/hero-stats";
import { getPopularMots } from "@/lib/queries/mots";

export default async function HeroSection() {
  const [mots, wordCount, contributorCount, voteCount] = await Promise.all([
    getPopularMots(6),
    db.mot.count({ where: { statut: "VALIDE" } }),
    db.user.count(),
    db.voteMot.count(),
  ]);

  const tags = mots.map((m) => ({ slug: m.slug, mot: m.mot }));

  return (
    <section className="py-16 md:py-24 text-center">
      <div className="content-container">
        <HeroTitle wordCount={wordCount} />
        <HeroSearch />
        <HeroTags mots={tags} />
        <HeroStats stats={{ mots: wordCount, contributeurs: contributorCount, votes: voteCount }} />
      </div>
    </section>
  );
}
```

Under 30 lines.

- [ ] **Step 6: Verify build**

```bash
pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/public/accueil/hero-section.tsx src/components/public/accueil/hero-title.tsx src/components/public/accueil/hero-search.tsx src/components/public/accueil/hero-tags.tsx src/components/public/accueil/hero-stats.tsx
git commit -m "feat: rebuild hero section with Bold & Fresh design"
```

---

### Task 5: Popular words section with word cards

**Files:**
- Rewrite: `src/components/public/accueil/popular-words-section.tsx`
- Create: `src/components/public/accueil/word-card.tsx`

- [ ] **Step 1: Create `src/components/public/accueil/word-card.tsx`**

Server component. A reusable word card matching the mockup. Props type:

```ts
interface WordCardProps {
  slug: string;
  mot: string;
  definition: string;
  categorie: string | null;
  authorName: string | null;
  voteCount?: number;
}
```

Renders a `Link` wrapping a shadcn-style card:
- Outer: `group block bg-card border border-border rounded-2xl p-5 hover:border-border/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150`
- Category badge: `categoryColor(categorie)` classes + `text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-md inline-block`
- Word name: `font-[family-name:var(--font-heading)] text-xl font-extrabold uppercase tracking-tight mt-2.5`
- Definition: `text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed`
- Meta row: `flex items-center justify-between mt-4 pt-3 border-t border-border` — author `text-xs text-muted-foreground` + votes `text-xs text-muted-foreground flex items-center gap-1`

- [ ] **Step 2: Rewrite `src/components/public/accueil/popular-words-section.tsx`**

Server component. Fetches `getPopularMots(6)`, renders section header + 3-column grid of `WordCard`. Section header: title with `font-[family-name:var(--font-heading)]` + "Voir tout →" link. Uses shadcn `Button` for the CTA.

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/public/accueil/word-card.tsx src/components/public/accueil/popular-words-section.tsx
git commit -m "feat: rebuild popular words section with word cards"
```

---

### Task 6: Recent words section

**Files:**
- Rewrite: `src/components/public/accueil/recent-words-section.tsx`
- Create: `src/components/public/accueil/recent-word-row.tsx`

- [ ] **Step 1: Create `src/components/public/accueil/recent-word-row.tsx`**

Server component. Props:

```ts
interface RecentWordRowProps {
  slug: string;
  mot: string;
  definition: string | null;
  categorie: string | null;
  authorName: string | null;
  createdAt: Date;
  index: number;
}
```

Renders a `Link` row:
- Outer: `group flex items-center justify-between gap-4 py-4 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors`
- Left: index number (`text-xs font-mono text-muted-foreground w-6 text-right shrink-0`) + word name (bold uppercase) + category pill (`rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5`) + definition truncated
- Right: relative date + author + ArrowRight icon (hidden, shown on group-hover)

Uses `formatDistanceToNow` from date-fns with `{ addSuffix: true, locale: fr }`.

- [ ] **Step 2: Rewrite `src/components/public/accueil/recent-words-section.tsx`**

Server component. Fetches `getRecentMots(6)`, renders section header (title + "Proposer un mot" CTA pill button) + list of `RecentWordRow` with `Separator` between items + "Voir tous les ajouts" bottom CTA.

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/public/accueil/recent-word-row.tsx src/components/public/accueil/recent-words-section.tsx
git commit -m "feat: rebuild recent words section"
```

---

### Task 7: Homepage page.tsx with SEO + JSON-LD

**Files:**
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

```tsx
import type { Metadata } from "next";
import HeroSection from "@/components/public/accueil/hero-section";
import PopularWordsSection from "@/components/public/accueil/popular-words-section";
import RecentWordsSection from "@/components/public/accueil/recent-words-section";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouchici — Le dictionnaire du nouchi ivoirien",
  description:
    "Découvre et contribue au dictionnaire collaboratif du nouchi, l'argot urbain de Côte d'Ivoire. +400 mots documentés par la communauté.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nouchici",
    url: process.env.NEXT_PUBLIC_API_URL ?? "https://nouchi.ci",
    description:
      "Le dictionnaire collaboratif du nouchi, l'argot urbain ivoirien.",
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
      <HeroSection />
      <Separator />
      <PopularWordsSection />
      <Separator />
      <RecentWordsSection />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add SEO metadata and JSON-LD to homepage"
```

---

### Task 8: Delete old animation/decoration components

**Files:**
- Delete: `src/components/ui/highlighter.tsx`
- Delete: `src/components/ui/light-rays.tsx`
- Delete: `src/components/animate-ui/` (entire directory)
- Delete: `src/components/public/accueil/popular-word-badge.tsx`
- Delete: `src/components/public/accueil/trust-section.tsx`
- Delete: `src/components/ui/input-group.tsx` (if no longer imported)

- [ ] **Step 1: Verify no remaining imports of deleted files**

Search for imports of the files to be deleted:
```bash
grep -r "highlighter\|light-rays\|gravity-stars\|shimmering\|popular-word-badge\|trust-section\|input-group" src/ --include="*.tsx" --include="*.ts" -l
```

If any file still imports them, remove the import and the usage first.

- [ ] **Step 2: Delete the files**

```bash
rm src/components/ui/highlighter.tsx
rm src/components/ui/light-rays.tsx
rm -rf src/components/animate-ui/
rm src/components/public/accueil/popular-word-badge.tsx
rm src/components/public/accueil/trust-section.tsx
```

Also delete `src/components/ui/input-group.tsx` if it's no longer imported anywhere.

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old animation and decoration components"
```

---

### Task 9: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```
Expected: All tests pass (no UI tests, but data layer tests should still work).

- [ ] **Step 2: Run production build**

```bash
pnpm build
```
Expected: Build succeeds.

- [ ] **Step 3: Visual check**

Start dev server and verify:
```bash
pnpm dev
```

Check:
- Homepage loads with new design
- Navbar: logo with red dot, pill CTA, auth state
- Hero: pill badge, gradient title, search bar, tags, stats
- Word cards: pastel category badges, Space Grotesk titles
- Recent words: numbered list with separators
- No old animations (no gravity stars, light rays, shimmer)

- [ ] **Step 4: Commit if cleanup needed**

```bash
git add -A
git commit -m "chore: homepage redesign complete"
```
