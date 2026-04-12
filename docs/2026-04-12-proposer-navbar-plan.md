# Proposer + Navbar Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the `/proposer` form (max-width, grid fields, live preview) and replace navbar auth buttons with a proper shadcn DropdownMenu profile dropdown.

**Architecture:** Install shadcn DropdownMenu. Split the large `nav-auth.tsx` into guest/user variants, and the user variant into trigger + header + menu. Restructure `proposer-form.tsx` to split input block and preview into two files while keeping RHF state in the parent.

**Tech Stack:** Next.js 16, React 19, React Hook Form, shadcn (DropdownMenu, Card, Form, Input, Textarea, Select, Button, Avatar, Badge, Separator), lucide-react

---

### Task 1: Install shadcn DropdownMenu

**Files:**
- Modify: `package.json`
- Create: `src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Add shadcn dropdown-menu component**

Run:
```bash
pnpm dlx shadcn@latest add dropdown-menu
```

If the CLI prompts, accept defaults. If it uses `bun` and fails with EBUSY on Windows, the file is usually still generated — verify `src/components/ui/dropdown-menu.tsx` exists.

- [ ] **Step 2: Restore pnpm state if bun touched the lockfile**

If a `bun.lock` appeared or `pnpm-lock.yaml` was modified unexpectedly:
```bash
rm -f bun.lock
pnpm install
```

- [ ] **Step 3: Verify the component exists**

Read `src/components/ui/dropdown-menu.tsx` — it should export `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, and related primitives from `@radix-ui/react-dropdown-menu`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/dropdown-menu.tsx package.json pnpm-lock.yaml
git commit -m "chore: add shadcn DropdownMenu component"
```

---

### Task 2: Proposer page — tighten layout

**Files:**
- Modify: `src/app/proposer/page.tsx`

- [ ] **Step 1: Update the page to wrap content in a max-w-3xl container with Space Grotesk heading**

Replace the file entirely:

```tsx
import { getSessionOrRedirect } from "@/lib/auth-guard";
import { ProposerForm } from "@/components/public/proposer/proposer-form";

export default async function ProposerPage() {
  await getSessionOrRedirect("/proposer");

  return (
    <div className="content-container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
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

- [ ] **Step 2: Commit**

```bash
git add src/app/proposer/page.tsx
git commit -m "feat: tighten proposer page layout with max-w-3xl and Space Grotesk heading"
```

---

### Task 3: Proposer form — live preview component

**Files:**
- Create: `src/components/public/proposer/proposer-preview.tsx`

- [ ] **Step 1: Create the preview component**

```tsx
import { Quote } from "lucide-react";
import { categoryColor, categoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";

interface ProposerPreviewProps {
  mot: string;
  definition: string;
  categorie: string | null | undefined;
  exemples: string[];
}

export function ProposerPreview({ mot, definition, categorie, exemples }: ProposerPreviewProps) {
  const firstExample = exemples.find((e) => e.trim().length > 0);

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Aperçu
      </p>

      {categorie && (
        <span
          className={cn(
            "inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md",
            categoryColor(categorie),
          )}
        >
          {categoryLabel(categorie)}
        </span>
      )}

      <h3 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold uppercase tracking-[-0.02em]">
        {mot.trim() || "Ton mot"}
      </h3>

      <p className="text-sm text-foreground/80 leading-relaxed">
        {definition.trim() || "La définition apparaîtra ici au fur et à mesure."}
      </p>

      {firstExample && (
        <blockquote className="flex items-start gap-2 border-l-2 border-border pl-3 mt-2">
          <Quote className="size-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
          <p className="text-sm italic text-muted-foreground">{firstExample}</p>
        </blockquote>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/public/proposer/proposer-preview.tsx
git commit -m "feat: add proposer live preview component"
```

---

### Task 4: Proposer form — restructured layout with grid + Card wrapper

**Files:**
- Rewrite: `src/components/public/proposer/proposer-form.tsx`

- [ ] **Step 1: Rewrite the form**

The new form:
- Wraps everything in a shadcn `<Card>` with `<CardContent className="p-6 sm:p-8">`
- Mot + Catégorie on a 2-column grid on `sm:` screens (1 col mobile)
- Textarea for définition uses `rows={3}` and has a helper
- Exemples use flex row with delete icon button
- "Ajouter un exemple" is an outline button with dashed border and pill radius
- Renders `<ProposerPreview>` inside the card below the fields using `form.watch()`
- Footer actions: "Annuler" ghost + "Soumettre" primary, separated by `<Separator />`

Replace the file:

```tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMotSchema } from "@/lib/validators/mot";
import { z } from "zod";
import Link from "next/link";
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProposerPreview } from "@/components/public/proposer/proposer-preview";

type FormValues = z.output<typeof createMotSchema>;

const CATEGORIES = [
  { value: "NOM", label: "Nom" },
  { value: "VERBE", label: "Verbe" },
  { value: "ADJECTIF", label: "Adjectif" },
  { value: "EXPRESSION", label: "Expression" },
  { value: "ADVERBE", label: "Adverbe" },
];

export function ProposerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createMotSchema) as any,
    defaultValues: { mot: "", definition: "", exemples: [""] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exemples" as never,
  });

  const watched = form.watch();

  async function onSubmit(data: FormValues) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/mots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 409) {
        setStatus("error");
        setErrorMessage("Ce mot existe déjà dans le dictionnaire.");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Une erreur est survenue. Réessaie plus tard.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Erreur de connexion. Vérifie ta connexion internet.");
    }
  }

  if (status === "success") {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="size-12 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-semibold">Mot soumis avec succès !</h2>
          <p className="text-muted-foreground">
            Ton mot sera examiné par un modérateur avant d&apos;être publié.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" asChild className="rounded-full">
              <Link href="/mots">Voir le dictionnaire</Link>
            </Button>
            <Button
              onClick={() => { form.reset(); setStatus("idle"); }}
              className="rounded-full"
            >
              Proposer un autre mot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: goumin" {...field} />
                    </FormControl>
                    <FormDescription>Le mot tel qu&apos;il se prononce.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionne une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Définition *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décris le sens du mot en français simple..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Sois clair et concis. Une phrase suffit.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Exemples d&apos;utilisation</FormLabel>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder={
                        index === 0
                          ? "Écris une phrase où ce mot est utilisé..."
                          : "Un autre exemple (facultatif)..."
                      }
                      {...form.register(`exemples.${index}` as const)}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label="Supprimer cet exemple"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-dashed gap-1 mt-1"
                onClick={() => append("" as never)}
              >
                <Plus className="size-3.5" />
                Ajouter un exemple
              </Button>
            </div>

            <ProposerPreview
              mot={watched.mot ?? ""}
              definition={watched.definition ?? ""}
              categorie={watched.categorie}
              exemples={(watched.exemples as string[] | undefined) ?? []}
            />

            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Separator />

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" asChild className="rounded-full">
                <Link href="/">Annuler</Link>
              </Button>
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  "Soumettre le mot"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

If the build complains that the file is over 250 lines, extract the success state into a separate `proposer-success.tsx` component. Otherwise it's fine.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/proposer/proposer-form.tsx
git commit -m "feat: restructure proposer form with grid layout and live preview"
```

---

### Task 5: Nav auth — split into guest and user variants

**Files:**
- Rewrite: `src/components/layouts/general/nav-auth.tsx`
- Create: `src/components/layouts/general/nav-auth-guest.tsx`
- Create: `src/components/layouts/general/nav-auth-user.tsx`

- [ ] **Step 1: Create `src/components/layouts/general/nav-auth-guest.tsx`**

Pure presentational component for unauthenticated state. No session dependency.

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavAuthGuest() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/connexion"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Se connecter
      </Link>
      <Button asChild className="rounded-full text-sm">
        <Link href="/connexion">Proposer un mot</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/layouts/general/nav-auth-user.tsx`**

Full dropdown with shadcn DropdownMenu. Props: `{ user: { id: string; name: string; email: string; image?: string | null; role?: string } }`.

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavAuthUserProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  USER: { label: "Contributeur", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  MODERATEUR: { label: "Modérateur", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function NavAuthUser({ user }: NavAuthUserProps) {
  const router = useRouter();
  const role = user.role ?? "USER";
  const isStaff = role === "MODERATEUR" || role === "ADMIN";
  const roleConfig = ROLE_LABELS[role] ?? ROLE_LABELS.USER;
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild className="rounded-full text-sm">
        <Link href="/proposer">Proposer un mot</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full border border-transparent p-1 pr-2",
              "hover:bg-muted hover:border-border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Menu profil"
          >
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Utilisateur"} />
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Utilisateur"} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Badge variant="secondary" className={cn("mt-1 text-[10px] font-semibold uppercase", roleConfig.className)}>
                  {roleConfig.label}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              <span>Mon dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/proposer">
              <Plus className="size-4" />
              <span>Proposer un mot</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/propositions">
              <FileText className="size-4" />
              <span>Mes propositions</span>
            </Link>
          </DropdownMenuItem>
          {isStaff && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="size-4" />
                <span>Modération</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/parametres">
              <Settings className="size-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="size-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/components/layouts/general/nav-auth.tsx` as a thin dispatcher**

```tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { NavAuthGuest } from "@/components/layouts/general/nav-auth-guest";
import { NavAuthUser } from "@/components/layouts/general/nav-auth-user";

export function NavAuth() {
  const { data: session } = authClient.useSession();
  const user = session?.user as
    | { id: string; name: string; email: string; image?: string | null; role?: string }
    | undefined;

  if (!user) return <NavAuthGuest />;
  return <NavAuthUser user={user} />;
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layouts/general/nav-auth.tsx src/components/layouts/general/nav-auth-guest.tsx src/components/layouts/general/nav-auth-user.tsx
git commit -m "feat: replace navbar auth buttons with shadcn DropdownMenu profile"
```

---

### Task 6: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```
Expected: All 73 tests pass.

- [ ] **Step 2: Run production build**

```bash
pnpm build
```
Expected: Build succeeds with no errors.

- [ ] **Step 3: Visual check (optional)**

Start dev server:
```bash
pnpm dev
```

Visit `/proposer` while logged in — verify form is centered, Mot + Catégorie on same row, preview updates live.
Check navbar — logged-in user sees avatar + chevron trigger, dropdown shows name/email/role badge and all menu items. Modérateur/Admin sees additional "Modération" item.

- [ ] **Step 4: Commit if cleanup needed**

```bash
git status
# if nothing to commit, skip
```
