# Phase 1 : Fondation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Nouchici's dictionary dynamic with database-backed words, Google OAuth authentication, CASL permissions, and CRUD API — all built TDD with Vitest.

**Architecture:** Prisma schema extended with Mot/Exemple models + Role enum on User. CASL defines abilities per role. Next.js route handlers serve JSON API. Pages refactored from static config to DB queries. Better Auth handles Google OAuth via proxy.ts.

**Tech Stack:** Next.js 16, Prisma 7, PostgreSQL, Better Auth, CASL, Vitest, Zod

---

### Task 1: Setup Vitest + test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `src/tests/setup.ts`
- Modify: `package.json` (add vitest deps + scripts)

- [ ] **Step 1: Install vitest and dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create src/tests/setup.ts**

```ts
import { beforeEach } from "vitest";
import { db } from "@/lib/db";

beforeEach(async () => {
  await db.exemple.deleteMany();
  await db.mot.deleteMany();
});
```

- [ ] **Step 4: Add test scripts to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Create a smoke test to verify the setup**

Create `src/tests/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run smoke test**

Run: `pnpm test`
Expected: PASS — 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/tests/setup.ts src/tests/smoke.test.ts package.json pnpm-lock.yaml
git commit -m "chore: setup vitest with test infrastructure"
```

---

### Task 2: Extend Prisma schema with Mot, Exemple, enums, Role

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add enums to prisma/schema.prisma**

Add before the User model:
```prisma
enum Categorie {
  NOM
  VERBE
  ADJECTIF
  EXPRESSION
  ADVERBE
}

enum Statut {
  EN_ATTENTE
  VALIDE
  REJETE
}

enum Role {
  USER
  MODERATEUR
  ADMIN
}
```

- [ ] **Step 2: Add role field and relations to User model**

Add to the User model (after `accounts`):
```prisma
  role          Role      @default(USER)
  motsSoumis    Mot[]     @relation("SoumisPar")
  motsValides   Mot[]     @relation("ValidePar")
```

- [ ] **Step 3: Add Mot model**

Add after User model:
```prisma
model Mot {
  id            String     @id @default(cuid())
  slug          String     @unique
  mot           String
  definition    String
  categorie     Categorie?
  statut        Statut     @default(EN_ATTENTE)
  motifRejet    String?

  soumisParId   String?
  soumisPar     User?      @relation("SoumisPar", fields: [soumisParId], references: [id])
  valideParId   String?
  validePar     User?      @relation("ValidePar", fields: [valideParId], references: [id])

  exemples      Exemple[]

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@map("mot")
}
```

- [ ] **Step 4: Add Exemple model**

Add after Mot model:
```prisma
model Exemple {
  id        String @id @default(cuid())
  phrase    String
  motId     String
  mot       Mot    @relation(fields: [motId], references: [id], onDelete: Cascade)

  @@map("exemple")
}
```

- [ ] **Step 5: Generate Prisma client and create migration**

```bash
pnpm prisma generate
pnpm prisma migrate dev --name add-mot-exemple-role
```

Expected: Migration created, client regenerated with Mot, Exemple, Categorie, Statut, Role types.

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/generated/prisma/
git commit -m "feat: add Mot, Exemple models and Role enum to Prisma schema"
```

---

### Task 3: CASL abilities — tests then implementation

**Files:**
- Create: `src/lib/casl/types.ts`
- Create: `src/lib/casl/abilities.ts`
- Create: `src/tests/casl/abilities.test.ts`

- [ ] **Step 1: Install CASL**

```bash
pnpm add @casl/ability
```

- [ ] **Step 2: Write the failing tests**

Create `src/tests/casl/abilities.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { defineAbilitiesFor } from "@/lib/casl/abilities";
import type { Role } from "@/generated/prisma";

const makeUser = (role: Role, id = "user-1") => ({ id, role });

describe("CASL abilities", () => {
  describe("USER", () => {
    const abilities = defineAbilitiesFor(makeUser("USER"));

    it("can read VALIDE words", () => {
      expect(abilities.can("read", "Mot", { statut: "VALIDE" })).toBe(true);
    });

    it("cannot read EN_ATTENTE words from others", () => {
      expect(abilities.can("read", "Mot", { statut: "EN_ATTENTE", soumisParId: "other" })).toBe(false);
    });

    it("can create a word", () => {
      expect(abilities.can("create", "Mot")).toBe(true);
    });

    it("can update own EN_ATTENTE word", () => {
      expect(abilities.can("update", "Mot", { soumisParId: "user-1", statut: "EN_ATTENTE" })).toBe(true);
    });

    it("cannot update someone else's word", () => {
      expect(abilities.can("update", "Mot", { soumisParId: "other", statut: "EN_ATTENTE" })).toBe(false);
    });

    it("cannot update a VALIDE word", () => {
      expect(abilities.can("update", "Mot", { soumisParId: "user-1", statut: "VALIDE" })).toBe(false);
    });

    it("cannot moderate", () => {
      expect(abilities.can("moderate", "Mot")).toBe(false);
    });
  });

  describe("MODERATEUR", () => {
    const abilities = defineAbilitiesFor(makeUser("MODERATEUR"));

    it("can read all words regardless of statut", () => {
      expect(abilities.can("read", "Mot", { statut: "EN_ATTENTE" })).toBe(true);
      expect(abilities.can("read", "Mot", { statut: "VALIDE" })).toBe(true);
      expect(abilities.can("read", "Mot", { statut: "REJETE" })).toBe(true);
    });

    it("can moderate words", () => {
      expect(abilities.can("moderate", "Mot")).toBe(true);
    });

    it("can create a word", () => {
      expect(abilities.can("create", "Mot")).toBe(true);
    });
  });

  describe("ADMIN", () => {
    const abilities = defineAbilitiesFor(makeUser("ADMIN"));

    it("can manage everything", () => {
      expect(abilities.can("manage", "all")).toBe(true);
    });
  });

  describe("unauthenticated (null user)", () => {
    const abilities = defineAbilitiesFor(null);

    it("can read VALIDE words", () => {
      expect(abilities.can("read", "Mot", { statut: "VALIDE" })).toBe(true);
    });

    it("cannot create", () => {
      expect(abilities.can("create", "Mot")).toBe(false);
    });

    it("cannot moderate", () => {
      expect(abilities.can("moderate", "Mot")).toBe(false);
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test src/tests/casl/abilities.test.ts`
Expected: FAIL — `Cannot find module '@/lib/casl/abilities'`

- [ ] **Step 4: Create src/lib/casl/types.ts**

```ts
import type { AbilityBuilder } from "@casl/ability";
import { PureAbility } from "@casl/ability";

export type Actions = "read" | "create" | "update" | "delete" | "moderate" | "manage";
export type Subjects = "Mot" | "all";
export type AppAbility = PureAbility<[Actions, Subjects]>;

export type UserForAbilities = {
  id: string;
  role: "USER" | "MODERATEUR" | "ADMIN";
} | null;
```

- [ ] **Step 5: Create src/lib/casl/abilities.ts**

```ts
import { AbilityBuilder, PureAbility } from "@casl/ability";
import type { Actions, Subjects, AppAbility, UserForAbilities } from "./types";

export function defineAbilitiesFor(user: UserForAbilities): AppAbility {
  const { can, build } = new AbilityBuilder<PureAbility<[Actions, Subjects]>>(PureAbility);

  // Everyone can read VALIDE words
  can("read", "Mot", { statut: "VALIDE" });

  if (!user) return build();

  // All authenticated users can create
  can("create", "Mot");

  if (user.role === "USER") {
    // Users can read and update their own EN_ATTENTE words
    can("read", "Mot", { soumisParId: user.id, statut: "EN_ATTENTE" });
    can("update", "Mot", { soumisParId: user.id, statut: "EN_ATTENTE" });
  }

  if (user.role === "MODERATEUR") {
    can("read", "Mot");
    can("moderate", "Mot");
  }

  if (user.role === "ADMIN") {
    can("manage", "all");
  }

  return build();
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test src/tests/casl/abilities.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 7: Commit**

```bash
git add src/lib/casl/ src/tests/casl/ package.json pnpm-lock.yaml
git commit -m "feat: add CASL abilities with role-based permissions"
```

---

### Task 4: Zod validation schemas — tests then implementation

**Files:**
- Create: `src/lib/validators/mot.ts`
- Create: `src/tests/validators/mot.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/validators/mot.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { createMotSchema, updateMotSchema } from "@/lib/validators/mot";

describe("createMotSchema", () => {
  it("validates a correct payload", () => {
    const result = createMotSchema.safeParse({
      mot: "goumin",
      definition: "Se battre, se quereller.",
      categorie: "VERBE",
      exemples: ["Les deux gars ont commencé à goumin."],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty mot", () => {
    const result = createMotSchema.safeParse({
      mot: "",
      definition: "Définition",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty definition", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts without categorie (optional)", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "Définition test",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid categorie", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "Définition",
      categorie: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty exemples array", () => {
    const result = createMotSchema.safeParse({
      mot: "test",
      definition: "Définition",
      exemples: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("updateMotSchema", () => {
  it("accepts partial update (only definition)", () => {
    const result = updateMotSchema.safeParse({
      definition: "Nouvelle définition",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (only categorie)", () => {
    const result = updateMotSchema.safeParse({
      categorie: "NOM",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateMotSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/tests/validators/mot.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validators/mot'`

- [ ] **Step 3: Create src/lib/validators/mot.ts**

```ts
import { z } from "zod";

const categorieEnum = z.enum(["NOM", "VERBE", "ADJECTIF", "EXPRESSION", "ADVERBE"]);

export const createMotSchema = z.object({
  mot: z.string().min(1),
  definition: z.string().min(1),
  categorie: categorieEnum.optional(),
  exemples: z.array(z.string().min(1)).optional().default([]),
});

export const updateMotSchema = z
  .object({
    mot: z.string().min(1).optional(),
    definition: z.string().min(1).optional(),
    categorie: categorieEnum.optional(),
    exemples: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateMotInput = z.infer<typeof createMotSchema>;
export type UpdateMotInput = z.infer<typeof updateMotSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/tests/validators/mot.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validators/ src/tests/validators/
git commit -m "feat: add Zod validation schemas for Mot CRUD"
```

---

### Task 5: Slug utility — tests then implementation

**Files:**
- Create: `src/lib/slug.ts`
- Create: `src/tests/slug.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/slug.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("lowercases the input", () => {
    expect(generateSlug("Goumin")).toBe("goumin");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("c'est la vie")).toBe("cest-la-vie");
  });

  it("removes accents", () => {
    expect(generateSlug("éléphant")).toBe("elephant");
  });

  it("removes special characters", () => {
    expect(generateSlug("hello!@#world")).toBe("helloworld");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug(" test ")).toBe("test");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a   b")).toBe("a-b");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/tests/slug.test.ts`
Expected: FAIL — `Cannot find module '@/lib/slug'`

- [ ] **Step 3: Create src/lib/slug.ts**

```ts
export function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/tests/slug.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/slug.ts src/tests/slug.test.ts
git commit -m "feat: add slug generation utility"
```

---

### Task 6: API GET /api/mots — tests then implementation

**Files:**
- Create: `src/app/api/mots/route.ts`
- Create: `src/tests/api/mots.test.ts`
- Create: `src/lib/queries/mots.ts`

- [ ] **Step 1: Create the query layer (src/lib/queries/mots.ts)**

This is a thin data-access layer so API routes stay lean and queries are testable:

```ts
import { db } from "@/lib/db";
import type { Categorie } from "@/generated/prisma";

interface ListMotsParams {
  cursor?: string;
  limit?: number;
  search?: string;
  lettre?: string;
  categorie?: Categorie;
}

export async function listMotsValides({
  cursor,
  limit = 20,
  search,
  lettre,
  categorie,
}: ListMotsParams = {}) {
  const where: Record<string, unknown> = { statut: "VALIDE" };

  if (lettre) {
    where.mot = { startsWith: lettre, mode: "insensitive" };
  }

  if (categorie) {
    where.categorie = categorie;
  }

  if (search) {
    where.OR = [
      { mot: { search } },
      { definition: { search } },
    ];
  }

  const mots = await db.mot.findMany({
    where,
    include: { exemples: true, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { mot: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = mots.length > limit;
  const data = hasMore ? mots.slice(0, limit) : mots;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}

export async function getMotBySlug(slug: string) {
  return db.mot.findUnique({
    where: { slug },
    include: { exemples: true, soumisPar: { select: { id: true, name: true, image: true } } },
  });
}
```

- [ ] **Step 2: Write the failing tests**

Create `src/tests/api/mots.test.ts`:
```ts
import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { listMotsValides, getMotBySlug } from "@/lib/queries/mots";

describe("listMotsValides", () => {
  beforeAll(async () => {
    await db.mot.createMany({
      data: [
        { slug: "goumin", mot: "Goumin", definition: "Se battre", statut: "VALIDE", categorie: "VERBE" },
        { slug: "choco", mot: "Choco", definition: "Ami proche", statut: "VALIDE", categorie: "NOM" },
        { slug: "brouteur", mot: "Brouteur", definition: "Arnaqueur", statut: "EN_ATTENTE", categorie: "NOM" },
      ],
    });
  });

  it("returns only VALIDE words", async () => {
    const result = await listMotsValides();
    expect(result.data).toHaveLength(2);
    expect(result.data.every((m) => m.statut === "VALIDE")).toBe(true);
  });

  it("filters by lettre", async () => {
    const result = await listMotsValides({ lettre: "g" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe("goumin");
  });

  it("filters by categorie", async () => {
    const result = await listMotsValides({ categorie: "NOM" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe("choco");
  });

  it("supports pagination with cursor", async () => {
    const first = await listMotsValides({ limit: 1 });
    expect(first.data).toHaveLength(1);
    expect(first.nextCursor).not.toBeNull();

    const second = await listMotsValides({ limit: 1, cursor: first.nextCursor! });
    expect(second.data).toHaveLength(1);
    expect(second.data[0].slug).not.toBe(first.data[0].slug);
  });
});

describe("getMotBySlug", () => {
  it("returns a word with exemples", async () => {
    await db.exemple.create({ data: { phrase: "On va goumin!", motId: (await db.mot.findUnique({ where: { slug: "goumin" } }))!.id } });
    const mot = await getMotBySlug("goumin");
    expect(mot).not.toBeNull();
    expect(mot!.exemples).toHaveLength(1);
    expect(mot!.exemples[0].phrase).toBe("On va goumin!");
  });

  it("returns null for unknown slug", async () => {
    const mot = await getMotBySlug("not-existing");
    expect(mot).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test src/tests/api/mots.test.ts`
Expected: FAIL — `Cannot find module '@/lib/queries/mots'`

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/tests/api/mots.test.ts`
Expected: PASS — all tests green. (The query layer was already created in Step 1.)

- [ ] **Step 5: Create the API route handler (src/app/api/mots/route.ts)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { listMotsValides } from "@/lib/queries/mots";
import { createMotSchema } from "@/lib/validators/mot";
import { generateSlug } from "@/lib/slug";
import { db } from "@/lib/db";
import type { Categorie } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const search = searchParams.get("search") ?? undefined;
  const lettre = searchParams.get("lettre") ?? undefined;
  const categorie = (searchParams.get("categorie") as Categorie) ?? undefined;

  const result = await listMotsValides({ cursor, limit, search, lettre, categorie });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  // Auth will be wired in Task 8 — for now return 401
  return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}
```

- [ ] **Step 6: Create the slug detail route (src/app/api/mots/[slug]/route.ts)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getMotBySlug } from "@/lib/queries/mots";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const mot = await getMotBySlug(slug);

  if (!mot || mot.statut !== "VALIDE") {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  return NextResponse.json(mot);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/queries/mots.ts src/app/api/mots/ src/tests/api/mots.test.ts
git commit -m "feat: add GET /api/mots and /api/mots/[slug] endpoints"
```

---

### Task 7: API POST /api/mots — tests then implementation

**Files:**
- Modify: `src/app/api/mots/route.ts`
- Create: `src/tests/api/mots-create.test.ts`
- Create: `src/lib/mutations/mots.ts`

- [ ] **Step 1: Create the mutation layer (src/lib/mutations/mots.ts)**

```ts
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import type { CreateMotInput, UpdateMotInput } from "@/lib/validators/mot";

export async function createMot(input: CreateMotInput, userId: string) {
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

export async function updateMot(slug: string, input: UpdateMotInput) {
  const data: Record<string, unknown> = {};
  if (input.mot !== undefined) {
    data.mot = input.mot;
    data.slug = generateSlug(input.mot);
  }
  if (input.definition !== undefined) data.definition = input.definition;
  if (input.categorie !== undefined) data.categorie = input.categorie;

  const mot = await db.mot.update({
    where: { slug },
    data,
    include: { exemples: true },
  });

  if (input.exemples !== undefined) {
    await db.exemple.deleteMany({ where: { motId: mot.id } });
    await db.exemple.createMany({
      data: input.exemples.map((phrase) => ({ phrase, motId: mot.id })),
    });
  }

  return db.mot.findUnique({ where: { id: mot.id }, include: { exemples: true } });
}

export async function deleteMot(slug: string) {
  return db.mot.delete({ where: { slug } });
}
```

- [ ] **Step 2: Write the failing tests**

Create `src/tests/api/mots-create.test.ts`:
```ts
import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { createMot } from "@/lib/mutations/mots";

describe("createMot", () => {
  const userId = "test-user-1";

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
      },
    });
  });

  it("creates a word with EN_ATTENTE status", async () => {
    const mot = await createMot(
      { mot: "Dja", definition: "Partir rapidement", categorie: "VERBE", exemples: ["Il a dja du maquis."] },
      userId
    );
    expect(mot.statut).toBe("EN_ATTENTE");
    expect(mot.slug).toBe("dja");
    expect(mot.soumisParId).toBe(userId);
    expect(mot.exemples).toHaveLength(1);
  });

  it("generates a slug automatically", async () => {
    const mot = await createMot(
      { mot: "C'est comment", definition: "Salutation", exemples: [] },
      userId
    );
    expect(mot.slug).toBe("cest-comment");
  });

  it("throws on duplicate slug", async () => {
    await createMot({ mot: "unique", definition: "Test", exemples: [] }, userId);
    await expect(
      createMot({ mot: "unique", definition: "Autre", exemples: [] }, userId)
    ).rejects.toThrow("SLUG_EXISTS");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test src/tests/api/mots-create.test.ts`
Expected: FAIL — `Cannot find module '@/lib/mutations/mots'`

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/tests/api/mots-create.test.ts`
Expected: PASS — all tests green. (The mutation layer was already created in Step 1.)

- [ ] **Step 5: Wire POST into the API route**

Update `src/app/api/mots/route.ts`, replace the POST handler:
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createMot } from "@/lib/mutations/mots";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const mot = await createMot(parsed.data, session.user.id);
    return NextResponse.json(mot, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "SLUG_EXISTS") {
      return NextResponse.json({ error: "Ce mot existe déjà" }, { status: 409 });
    }
    throw e;
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/mutations/mots.ts src/app/api/mots/route.ts src/tests/api/mots-create.test.ts
git commit -m "feat: add POST /api/mots with word creation and validation"
```

---

### Task 8: API PUT/DELETE /api/mots/[slug] — tests then implementation

**Files:**
- Modify: `src/app/api/mots/[slug]/route.ts`
- Create: `src/tests/api/mots-update.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/api/mots-update.test.ts`:
```ts
import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { updateMot, deleteMot } from "@/lib/mutations/mots";
import { createMot } from "@/lib/mutations/mots";

describe("updateMot", () => {
  const userId = "test-user-update";

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "Updater", email: "updater@test.com", emailVerified: false },
    });
  });

  it("updates definition", async () => {
    const created = await createMot({ mot: "updatetest", definition: "Old", exemples: [] }, userId);
    const updated = await updateMot(created.slug, { definition: "New definition" });
    expect(updated!.definition).toBe("New definition");
  });

  it("updates exemples by replacing them", async () => {
    const created = await createMot(
      { mot: "exempletest", definition: "Def", exemples: ["Old example"] },
      userId
    );
    const updated = await updateMot(created.slug, { exemples: ["New example 1", "New example 2"] });
    expect(updated!.exemples).toHaveLength(2);
    expect(updated!.exemples[0].phrase).toBe("New example 1");
  });

  it("updates slug when mot changes", async () => {
    const created = await createMot({ mot: "oldname", definition: "Def", exemples: [] }, userId);
    const updated = await updateMot(created.slug, { mot: "newname" });
    expect(updated!.slug).toBe("newname");
  });
});

describe("deleteMot", () => {
  const userId = "test-user-delete";

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "Deleter", email: "deleter@test.com", emailVerified: false },
    });
  });

  it("deletes a word", async () => {
    const created = await createMot({ mot: "tobedeleted", definition: "Def", exemples: [] }, userId);
    await deleteMot(created.slug);
    const found = await db.mot.findUnique({ where: { slug: "tobedeleted" } });
    expect(found).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm test src/tests/api/mots-update.test.ts`
Expected: PASS — mutations were already created in Task 7.

- [ ] **Step 3: Wire PUT and DELETE into the slug route**

Update `src/app/api/mots/[slug]/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getMotBySlug } from "@/lib/queries/mots";
import { updateMotSchema } from "@/lib/validators/mot";
import { updateMot, deleteMot } from "@/lib/mutations/mots";
import { defineAbilitiesFor } from "@/lib/casl/abilities";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const mot = await getMotBySlug(slug);

  if (!mot || mot.statut !== "VALIDE") {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  return NextResponse.json(mot);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  const abilities = defineAbilitiesFor({ id: session.user.id, role: (session.user as { role: string }).role as "USER" | "MODERATEUR" | "ADMIN" });
  if (!abilities.can("update", "Mot", { soumisParId: mot.soumisParId, statut: mot.statut })) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateMot(slug, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) {
    return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
  }

  const abilities = defineAbilitiesFor({ id: session.user.id, role: (session.user as { role: string }).role as "USER" | "MODERATEUR" | "ADMIN" });
  if (!abilities.can("update", "Mot", { soumisParId: mot.soumisParId, statut: mot.statut })) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await deleteMot(slug);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/mots/[slug]/route.ts src/tests/api/mots-update.test.ts
git commit -m "feat: add PUT/DELETE /api/mots/[slug] with CASL authorization"
```

---

### Task 9: Better Auth — Google OAuth setup

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Modify: `src/app/env.ts`

- [ ] **Step 1: Update src/lib/auth.ts with Google provider**

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

- [ ] **Step 2: Create the auth route handler**

Create `src/app/api/auth/[...all]/route.ts`:
```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 3: Update src/app/env.ts**

```ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  onValidationError: (issues) => {
    console.error("❌ Invalid environment variables:", issues);
    process.exit(1);
  },
});
```

- [ ] **Step 4: Create the auth client for frontend**

Create `src/lib/auth-client.ts`:
```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

- [ ] **Step 5: Add placeholder env vars to .env**

Add to `.env` (user will fill in real values):
```
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/auth/ src/app/env.ts
git commit -m "feat: setup Better Auth with Google OAuth provider"
```

---

### Task 10: Login page + Navbar auth integration

**Files:**
- Create: `src/app/connexion/page.tsx`
- Modify: `src/components/layouts/general/navbar.tsx`

- [ ] **Step 1: Create the login page**

Create `src/app/connexion/page.tsx`:
```tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConnexionPage() {
  const handleGoogleLogin = () => {
    authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

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
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full gap-2">
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Se connecter avec Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update navbar with auth state**

Replace `src/components/layouts/general/navbar.tsx`:
```tsx
"use client";
import React from "react";
import {
  Link,
  Navbar as UINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
} from "@heroui/react";
import { navLinks } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/layouts/theme-switcher";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Shield } from "lucide-react";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const isStaff = session?.user && ["MODERATEUR", "ADMIN"].includes((session.user as { role?: string }).role ?? "");

  return (
    <UINavbar
      isBordered
      classNames={{ wrapper: "content-container" }}
      position="static"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="text-xl font-bold">
            nouchi.ci
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <NavbarItem key={link.href}>
              <Link
                href={link.href}
                className="w-full"
                color={!active ? "foreground" : "primary"}
                onPress={() => setIsMenuOpen(false)}
              >
                {link.title}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>
      <NavbarMenu>
        {navLinks.map((link) => (
          <NavbarItem key={link.href}>
            <Link href={link.href}>{link.title}</Link>
          </NavbarItem>
        ))}
      </NavbarMenu>
      <NavbarContent justify="end">
        <ThemeSwitcher />
        {session ? (
          <div className="flex items-center gap-3">
            {isStaff && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin">
                  <Shield className="size-4" />
                </a>
              </Button>
            )}
            <Button asChild size="sm">
              <a href="/proposer">Proposer un mot</a>
            </Button>
            <Avatar className="size-8">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback>{session.user.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/connexion">Se connecter</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/proposer">Proposer un mot</a>
            </Button>
          </div>
        )}
      </NavbarContent>
    </UINavbar>
  );
}

export default Navbar;
```

- [ ] **Step 3: Verify build passes**

Run: `pnpm build`
Expected: Build succeeds with the new pages.

- [ ] **Step 4: Commit**

```bash
git add src/app/connexion/ src/components/layouts/general/navbar.tsx
git commit -m "feat: add login page and auth-aware navbar"
```

---

### Task 11: Seed dev data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: Create prisma/seed.ts**

```ts
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@nouchici.dev" },
    update: {},
    create: {
      id: "seed-admin",
      name: "Admin Dev",
      email: "admin@nouchici.dev",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  const words = [
    { mot: "Goumin", definition: "Se battre, se quereller avec quelqu'un.", categorie: "VERBE" as const, exemples: ["Les deux gars ont commencé à goumin devant le maquis."] },
    { mot: "Choco", definition: "Ami proche, frère de galère.", categorie: "NOM" as const, exemples: ["Mon choco m'a aidé quand j'étais dans la galère."] },
    { mot: "Boucantier", definition: "Personne qui fait beaucoup de bruit.", categorie: "NOM" as const, exemples: ["Ce boucantier-là, il va nous faire expulser du quartier."] },
    { mot: "Binguiste", definition: "Conducteur de moto-taxi.", categorie: "NOM" as const, exemples: ["J'ai pris un binguiste pour éviter les embouteillages."] },
    { mot: "Babi", definition: "Abréviation affectueuse d'Abidjan.", categorie: "NOM" as const, exemples: ["Je suis à Babi depuis 10 ans."] },
    { mot: "Gouro", definition: "Argent, monnaie.", categorie: "NOM" as const, exemples: ["J'ai pas de gouro aujourd'hui."] },
    { mot: "Dja", definition: "Partir, s'en aller rapidement.", categorie: "VERBE" as const, exemples: ["Il a dja du maquis sans payer."] },
    { mot: "Zouglou", definition: "Genre musical ivoirien né dans les cités universitaires.", categorie: "NOM" as const, exemples: ["Le zouglou, c'est la musique du peuple."] },
    { mot: "Tchatcher", definition: "Parler avec aisance pour convaincre ou séduire.", categorie: "VERBE" as const, exemples: ["Ce gars-là sait tchatcher les go."] },
    { mot: "Garba", definition: "Plat populaire à base d'attiéké et de thon frit.", categorie: "NOM" as const, exemples: ["On va manger garba au bord de la route."] },
    { mot: "Gbê", definition: "La vie, le destin, la force.", categorie: "NOM" as const, exemples: ["C'est le gbê qui est comme ça."] },
    { mot: "Enjailler", definition: "S'amuser, profiter intensément.", categorie: "VERBE" as const, exemples: ["On va s'enjailler ce weekend!"] },
  ];

  for (const word of words) {
    const slug = word.mot
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    await prisma.mot.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        mot: word.mot,
        definition: word.definition,
        categorie: word.categorie,
        statut: "VALIDE",
        soumisParId: admin.id,
        exemples: {
          create: word.exemples.map((phrase) => ({ phrase })),
        },
      },
    });
  }

  console.log(`Seeded ${words.length} words + admin user`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Add seed script to package.json**

Add to `scripts`:
```json
"db:seed": "tsx prisma/seed.ts"
```

- [ ] **Step 3: Install tsx for running TypeScript seeds**

```bash
pnpm add -D tsx
```

- [ ] **Step 4: Run seed against dev database**

```bash
pnpm db:seed
```

Expected: `Seeded 12 words + admin user`

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json pnpm-lock.yaml
git commit -m "feat: add dev seed with 12 Nouchi words and admin user"
```

---

### Task 12: Refactor pages to read from database

**Files:**
- Modify: `src/app/mots/page.tsx`
- Modify: `src/app/mots/[slug]/page.tsx`
- Modify: `src/app/mots/lettre/[lettre]/page.tsx`
- Modify: `src/components/public/accueil/popular-words-section.tsx`
- Modify: `src/components/public/accueil/recent-words-section.tsx`
- Modify: `src/components/public/mots/word-group.tsx`
- Modify: `src/lib/category.ts`
- Delete: `src/config/words.ts`
- Modify: `src/config/navigation.ts`

- [ ] **Step 1: Update src/lib/category.ts to use enum values**

```ts
export const CATEGORY_COLORS: Record<string, string> = {
  VERBE:      "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  NOM:        "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ADJECTIF:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  EXPRESSION: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  ADVERBE:    "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
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

- [ ] **Step 2: Add database queries for pages**

Add to `src/lib/queries/mots.ts`:
```ts
export async function listAllMotsValides() {
  return db.mot.findMany({
    where: { statut: "VALIDE" },
    include: { exemples: true, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { mot: "asc" },
  });
}

export async function listMotsValidesByLettre(lettre: string) {
  return db.mot.findMany({
    where: {
      statut: "VALIDE",
      mot: { startsWith: lettre, mode: "insensitive" },
    },
    include: { exemples: true, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { mot: "asc" },
  });
}

export async function getPopularMots(limit = 6) {
  return db.mot.findMany({
    where: { statut: "VALIDE" },
    include: { exemples: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function getRecentMots(limit = 6) {
  return db.mot.findMany({
    where: { statut: "VALIDE" },
    include: { exemples: true, soumisPar: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
```

- [ ] **Step 3: Refactor src/app/mots/page.tsx**

Replace the page — it becomes a server component that reads from DB:
```tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { WordGroup } from "@/components/public/mots/word-group";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { listAllMotsValides } from "@/lib/queries/mots";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tous les mots — Nouchici",
  description: "Explore le dictionnaire complet du nouchi ivoirien.",
};

export default async function MotsListPage() {
  const mots = await listAllMotsValides();

  const grouped = mots.reduce<Record<string, typeof mots>>((acc, mot) => {
    const letter = mot.mot[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(mot);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <>
      <div className="content-container py-12 space-y-12">
        <header className="space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1 flex items-center gap-1.5 w-fit">
            <BookOpen className="size-3.5" />
            Dictionnaire
          </Badge>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
                Tous les mots<br />
                <span className="text-muted-foreground">du nouchi</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-lg">
                {mots.length} mots documentés par la communauté ivoirienne.
              </p>
            </div>
            <Button asChild className="gap-2 shrink-0">
              <Link href="/proposer">
                <Plus className="size-4" />
                Proposer un mot
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Mots", value: mots.length },
              { label: "Catégories", value: new Set(mots.map((m) => m.categorie).filter(Boolean)).size },
              { label: "Contributeurs", value: new Set(mots.map((m) => m.soumisParId).filter(Boolean)).size },
            ].map(({ label, value }) => (
              <Card key={label} className="py-4">
                <CardContent className="flex flex-col items-center text-center px-4 py-0 gap-0.5">
                  <span className="text-2xl font-semibold tracking-tight">{value}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </header>
        <Separator />
        <nav className="flex flex-wrap gap-2" aria-label="Index alphabétique">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="size-8 flex items-center justify-center rounded-md text-sm font-medium border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {letter}
            </a>
          ))}
        </nav>
        <Separator />
        <div className="space-y-14">
          {letters.map((letter) => (
            <WordGroup key={letter} letter={letter} mots={grouped[letter]} />
          ))}
        </div>
        <Separator />
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <p className="text-muted-foreground text-sm max-w-md">
            Tu connais un mot qui manque ? La communauté t'attend pour l'ajouter au dictionnaire.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/proposer">
              <Plus className="size-4" />
              Proposer un mot
            </Link>
          </Button>
        </div>
      </div>
      <ScrollToTop />
    </>
  );
}
```

- [ ] **Step 4: Update WordGroup component to use DB types**

Replace `src/components/public/mots/word-group.tsx` — change prop type from `Word[]` to the Prisma Mot type with includes. Key changes:
- Props: `mots` instead of `words`, typed from Prisma
- Use `mot.mot` instead of `word.label`
- Use `mot.categorie` with `categoryLabel()` and `categoryColor()`
- Use `mot.exemples[0]?.phrase` instead of `word.example`
- Use `mot.soumisPar?.name` instead of `word.author`
- Remove the `import type { Word } from "@/config/words"` import

- [ ] **Step 5: Refactor src/app/mots/[slug]/page.tsx**

Same pattern — replace `words.find()` with `getMotBySlug()`. Key changes:
- Import `getMotBySlug` and `listMotsValidesByLettre` from `@/lib/queries/mots`
- Remove `import { words } from "@/config/words"`
- Use `mot.mot` instead of `word.label`
- Use `mot.exemples` array instead of single `word.example`
- Use `mot.soumisPar?.name` instead of `word.author`
- Use `mot.createdAt` with date-fns instead of `word.addedAt`

- [ ] **Step 6: Refactor src/app/mots/lettre/[lettre]/page.tsx**

Same pattern — replace static filter with `listMotsValidesByLettre()`. Key changes:
- Import from `@/lib/queries/mots` instead of `@/config/words`
- Use database fields instead of static Word type fields

- [ ] **Step 7: Refactor homepage sections to server components**

Convert `popular-words-section.tsx` and `recent-words-section.tsx`:
- Remove `"use client"` directive
- Import from `@/lib/queries/mots` instead of `@/config/navigation`
- Make component `async` and call DB queries directly
- Update field references to match Prisma Mot type

- [ ] **Step 8: Clean up navigation.ts**

Remove `popularWords`, `recentWords` and their types from `src/config/navigation.ts`. Keep only `navLinks`.

- [ ] **Step 9: Delete src/config/words.ts**

```bash
rm src/config/words.ts
```

- [ ] **Step 10: Verify build passes**

```bash
pnpm build
```

Expected: Build succeeds. All pages render from database.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: refactor all pages to read from database instead of static config"
```

---

### Task 13: Verify build and run all tests

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 2: Run production build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Verify Docker build**

```bash
docker compose build app
```

Expected: Docker image builds successfully.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: phase 1 complete — dynamic words, auth, CASL, API"
```
