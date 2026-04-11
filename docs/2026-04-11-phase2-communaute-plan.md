# Phase 2 : Communauté — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add community word proposals, admin moderation dashboard with stats, community voting, and route protection to make Nouchici a fully collaborative dictionary.

**Architecture:** New Prisma models (LogModeration, VoteMot) extend the schema. proxy.ts provides server-side route protection. React Hook Form + Zod power the forms. Admin API endpoints handle moderation workflow. Community votes provide crowd-sourced quality signals displayed on word pages and the admin dashboard.

**Tech Stack:** Next.js 16, Prisma 7, React Hook Form, Zod, Vitest, shadcn components, CASL

---

### Task 1: Extend Prisma schema with LogModeration, VoteMot

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new enums to schema**

Add after the existing `Role` enum:
```prisma
enum ActionModeration {
  VALIDE
  REJETE
  EDITE
}

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
```

- [ ] **Step 2: Add LogModeration model**

Add after the `Exemple` model:
```prisma
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

- [ ] **Step 3: Add VoteMot model**

Add after `LogModeration`:
```prisma
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

- [ ] **Step 4: Add relations to Mot model**

Add to the `Mot` model (after `exemples`):
```prisma
  logsModeration LogModeration[]
  votes          VoteMot[]
```

- [ ] **Step 5: Add relations to User model**

Add to the `User` model (after `motsValides`):
```prisma
  logsModeration LogModeration[] @relation("LogsModeration")
  votesMots      VoteMot[]       @relation("VotesMots")
```

- [ ] **Step 6: Generate and migrate**

```bash
pnpm prisma generate
pnpm prisma migrate dev --name add-log-moderation-vote-mot
```

- [ ] **Step 7: Commit**

```bash
git add prisma/
git commit -m "feat: add LogModeration and VoteMot models to Prisma schema"
```

---

### Task 2: Zod schemas for moderation and votes — tests then implementation

**Files:**
- Create: `src/lib/validators/moderation.ts`
- Create: `src/lib/validators/vote.ts`
- Create: `src/tests/validators/moderation.test.ts`
- Create: `src/tests/validators/vote.test.ts`

- [ ] **Step 1: Write failing tests for moderation schemas**

Create `src/tests/validators/moderation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { rejeterMotSchema, validerMotSchema } from "@/lib/validators/moderation";

describe("rejeterMotSchema", () => {
  it("validates with a motif", () => {
    const result = rejeterMotSchema.safeParse({ motif: "Définition incorrecte" });
    expect(result.success).toBe(true);
  });

  it("rejects empty motif", () => {
    const result = rejeterMotSchema.safeParse({ motif: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing motif", () => {
    const result = rejeterMotSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("validerMotSchema", () => {
  it("accepts empty body", () => {
    const result = validerMotSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Write failing tests for vote schema**

Create `src/tests/validators/vote.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { voteMotSchema } from "@/lib/validators/vote";

describe("voteMotSchema", () => {
  it("validates correct vote", () => {
    const result = voteMotSchema.safeParse({
      connaissance: "OUI_UTILISE",
      exactitude: "EXACTE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid connaissance", () => {
    const result = voteMotSchema.safeParse({
      connaissance: "INVALID",
      exactitude: "EXACTE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = voteMotSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts all valid connaissance values", () => {
    for (const value of ["OUI_UTILISE", "CONNAIS", "JAMAIS_ENTENDU"]) {
      const result = voteMotSchema.safeParse({ connaissance: value, exactitude: "EXACTE" });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid exactitude values", () => {
    for (const value of ["EXACTE", "APPROXIMATIVE", "FAUSSE"]) {
      const result = voteMotSchema.safeParse({ connaissance: "OUI_UTILISE", exactitude: value });
      expect(result.success).toBe(true);
    }
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm test src/tests/validators/moderation.test.ts src/tests/validators/vote.test.ts
```
Expected: FAIL — modules not found.

- [ ] **Step 4: Create `src/lib/validators/moderation.ts`**

```ts
import { z } from "zod";

export const rejeterMotSchema = z.object({
  motif: z.string().min(1),
});

export const validerMotSchema = z.object({});

export type RejeterMotInput = z.infer<typeof rejeterMotSchema>;
```

- [ ] **Step 5: Create `src/lib/validators/vote.ts`**

```ts
import { z } from "zod";

export const voteMotSchema = z.object({
  connaissance: z.enum(["OUI_UTILISE", "CONNAIS", "JAMAIS_ENTENDU"]),
  exactitude: z.enum(["EXACTE", "APPROXIMATIVE", "FAUSSE"]),
});

export type VoteMotInput = z.infer<typeof voteMotSchema>;
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test src/tests/validators/moderation.test.ts src/tests/validators/vote.test.ts
```
Expected: PASS — all tests green.

- [ ] **Step 7: Commit**

```bash
git add src/lib/validators/ src/tests/validators/
git commit -m "feat: add Zod schemas for moderation and community votes"
```

---

### Task 3: Route protection helper (proxy.ts) — tests then implementation

**Files:**
- Create: `src/proxy.ts`
- Create: `src/tests/proxy.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/proxy.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { checkRouteAccess } from "@/proxy";

describe("checkRouteAccess", () => {
  it("allows authenticated user on /proposer", () => {
    const result = checkRouteAccess("/proposer", { id: "u1", role: "USER" });
    expect(result.allowed).toBe(true);
  });

  it("denies unauthenticated user on /proposer", () => {
    const result = checkRouteAccess("/proposer", null);
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe("/connexion?callbackUrl=/proposer");
  });

  it("allows MODERATEUR on /admin", () => {
    const result = checkRouteAccess("/admin", { id: "u1", role: "MODERATEUR" });
    expect(result.allowed).toBe(true);
  });

  it("allows ADMIN on /admin/mots", () => {
    const result = checkRouteAccess("/admin/mots", { id: "u1", role: "ADMIN" });
    expect(result.allowed).toBe(true);
  });

  it("denies USER on /admin", () => {
    const result = checkRouteAccess("/admin", { id: "u1", role: "USER" });
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe("/");
  });

  it("denies unauthenticated on /admin", () => {
    const result = checkRouteAccess("/admin", null);
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe("/connexion?callbackUrl=/admin");
  });

  it("allows anyone on public routes", () => {
    const result = checkRouteAccess("/mots", null);
    expect(result.allowed).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test src/tests/proxy.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/proxy.ts`**

```ts
type UserInfo = { id: string; role: string } | null;

type AccessResult =
  | { allowed: true }
  | { allowed: false; redirect: string };

export function checkRouteAccess(pathname: string, user: UserInfo): AccessResult {
  const isProtected = pathname === "/proposer" || pathname.startsWith("/proposer/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isProtected && !isAdmin) {
    return { allowed: true };
  }

  if (!user) {
    return { allowed: false, redirect: `/connexion?callbackUrl=${pathname}` };
  }

  if (isAdmin && user.role !== "MODERATEUR" && user.role !== "ADMIN") {
    return { allowed: false, redirect: "/" };
  }

  return { allowed: true };
}
```

- [ ] **Step 4: Create server-side helper for use in pages**

Add to `src/proxy.ts`:
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSessionOrRedirect(pathname: string, requireRole?: "MODERATEUR" | "ADMIN") {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/connexion?callbackUrl=${pathname}`);
  }

  if (requireRole) {
    const role = (session.user as { role?: string }).role ?? "USER";
    if (role !== "MODERATEUR" && role !== "ADMIN") {
      redirect("/");
    }
  }

  return session;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/tests/proxy.test.ts
```
Expected: PASS — all tests green.

- [ ] **Step 6: Commit**

```bash
git add src/proxy.ts src/tests/proxy.test.ts
git commit -m "feat: add route protection helper (proxy.ts)"
```

---

### Task 4: Admin queries and mutations — tests then implementation

**Files:**
- Create: `src/lib/queries/admin.ts`
- Create: `src/lib/mutations/moderation.ts`
- Create: `src/tests/api/admin.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/api/admin.test.ts`:
```ts
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { listAllMots, getMotStats, getAdminStats } from "@/lib/queries/admin";
import { validerMot, rejeterMot, editerMotAdmin } from "@/lib/mutations/moderation";

const modId = "test-moderateur";
const userId = "test-user-admin";

describe("admin queries and mutations", () => {
  beforeAll(async () => {
    await db.user.upsert({
      where: { id: modId },
      update: {},
      create: { id: modId, name: "Mod", email: "mod@test.com", emailVerified: false, role: "MODERATEUR" },
    });
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "User", email: "user-admin@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.logModeration.deleteMany();
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  describe("listAllMots", () => {
    it("returns all mots regardless of statut", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", definition: "def", statut: "VALIDE" },
          { slug: "b", mot: "B", definition: "def", statut: "EN_ATTENTE" },
          { slug: "c", mot: "C", definition: "def", statut: "REJETE" },
        ],
      });
      const result = await listAllMots({});
      expect(result.data).toHaveLength(3);
    });

    it("filters by statut", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", definition: "def", statut: "EN_ATTENTE" },
          { slug: "b", mot: "B", definition: "def", statut: "VALIDE" },
        ],
      });
      const result = await listAllMots({ statut: "EN_ATTENTE" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe("a");
    });

    it("supports pagination", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", definition: "def", statut: "EN_ATTENTE" },
          { slug: "b", mot: "B", definition: "def", statut: "EN_ATTENTE" },
        ],
      });
      const first = await listAllMots({ limit: 1 });
      expect(first.data).toHaveLength(1);
      expect(first.nextCursor).not.toBeNull();
    });
  });

  describe("validerMot", () => {
    it("changes statut to VALIDE and creates log", async () => {
      await db.mot.create({ data: { slug: "test", mot: "Test", definition: "def", statut: "EN_ATTENTE" } });
      const result = await validerMot("test", modId);
      expect(result.statut).toBe("VALIDE");
      expect(result.valideParId).toBe(modId);

      const logs = await db.logModeration.findMany({ where: { motId: result.id } });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("VALIDE");
      expect(logs[0].moderateurId).toBe(modId);
    });
  });

  describe("rejeterMot", () => {
    it("changes statut to REJETE with motif and creates log", async () => {
      await db.mot.create({ data: { slug: "rej", mot: "Rej", definition: "def", statut: "EN_ATTENTE" } });
      const result = await rejeterMot("rej", modId, "Définition incorrecte");
      expect(result.statut).toBe("REJETE");
      expect(result.motifRejet).toBe("Définition incorrecte");

      const logs = await db.logModeration.findMany({ where: { motId: result.id } });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("REJETE");
      expect(logs[0].motif).toBe("Définition incorrecte");
    });
  });

  describe("editerMotAdmin", () => {
    it("updates fields and creates EDITE log", async () => {
      await db.mot.create({ data: { slug: "edit", mot: "Edit", definition: "old", statut: "EN_ATTENTE" } });
      const result = await editerMotAdmin("edit", { definition: "new definition" }, modId);
      expect(result!.definition).toBe("new definition");

      const logs = await db.logModeration.findMany({ where: { motId: result!.id } });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("EDITE");
    });
  });

  describe("getMotStats", () => {
    it("returns vote aggregation for a mot", async () => {
      const mot = await db.mot.create({ data: { slug: "stats", mot: "Stats", definition: "def", statut: "VALIDE" } });
      await db.voteMot.createMany({
        data: [
          { motId: mot.id, userId: userId, connaissance: "OUI_UTILISE", exactitude: "EXACTE" },
          { motId: mot.id, userId: modId, connaissance: "CONNAIS", exactitude: "APPROXIMATIVE" },
        ],
      });
      const stats = await getMotStats(mot.id);
      expect(stats.totalVotes).toBe(2);
      expect(stats.connaissance.OUI_UTILISE).toBe(1);
      expect(stats.connaissance.CONNAIS).toBe(1);
      expect(stats.exactitude.EXACTE).toBe(1);
    });
  });

  describe("getAdminStats", () => {
    it("returns counts by statut", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", definition: "def", statut: "EN_ATTENTE" },
          { slug: "b", mot: "B", definition: "def", statut: "EN_ATTENTE" },
          { slug: "c", mot: "C", definition: "def", statut: "VALIDE" },
        ],
      });
      const stats = await getAdminStats();
      expect(stats.parStatut.EN_ATTENTE).toBe(2);
      expect(stats.parStatut.VALIDE).toBe(1);
      expect(stats.parStatut.REJETE).toBe(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test src/tests/api/admin.test.ts
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `src/lib/queries/admin.ts`**

```ts
import { db } from "@/lib/db";
import type { Statut, Categorie } from "@/generated/prisma";

interface ListAllMotsParams {
  cursor?: string;
  limit?: number;
  statut?: Statut;
  categorie?: Categorie;
  search?: string;
}

export async function listAllMots({
  cursor,
  limit = 20,
  statut,
  categorie,
  search,
}: ListAllMotsParams = {}) {
  const where: Record<string, unknown> = {};

  if (statut) where.statut = statut;
  if (categorie) where.categorie = categorie;
  if (search) {
    where.OR = [
      { mot: { contains: search, mode: "insensitive" } },
      { definition: { contains: search, mode: "insensitive" } },
    ];
  }

  const mots = await db.mot.findMany({
    where,
    include: {
      exemples: true,
      soumisPar: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = mots.length > limit;
  const data = hasMore ? mots.slice(0, limit) : mots;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}

export async function getMotStats(motId: string) {
  const votes = await db.voteMot.findMany({ where: { motId } });

  const connaissance = { OUI_UTILISE: 0, CONNAIS: 0, JAMAIS_ENTENDU: 0 };
  const exactitude = { EXACTE: 0, APPROXIMATIVE: 0, FAUSSE: 0 };

  for (const vote of votes) {
    connaissance[vote.connaissance]++;
    exactitude[vote.exactitude]++;
  }

  return { totalVotes: votes.length, connaissance, exactitude };
}

export async function getAdminStats() {
  const [enAttente, valide, rejete, totalContributions, logsThisWeek] = await Promise.all([
    db.mot.count({ where: { statut: "EN_ATTENTE" } }),
    db.mot.count({ where: { statut: "VALIDE" } }),
    db.mot.count({ where: { statut: "REJETE" } }),
    db.mot.count(),
    db.logModeration.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: { moderateur: { select: { id: true, name: true } } },
    }),
  ]);

  const moderateursActifs = new Set(logsThisWeek.map((l) => l.moderateurId)).size;

  const parModerateur: Record<string, { name: string; count: number }> = {};
  for (const log of logsThisWeek) {
    if (!parModerateur[log.moderateurId]) {
      parModerateur[log.moderateurId] = { name: log.moderateur.name, count: 0 };
    }
    parModerateur[log.moderateurId].count++;
  }

  return {
    parStatut: { EN_ATTENTE: enAttente, VALIDE: valide, REJETE: rejete },
    totalContributions,
    moderateursActifs,
    parModerateur,
    actionsThisWeek: logsThisWeek.length,
  };
}
```

- [ ] **Step 4: Create `src/lib/mutations/moderation.ts`**

```ts
import { db } from "@/lib/db";
import { updateMot } from "@/lib/mutations/mots";
import type { UpdateMotInput } from "@/lib/validators/mot";

export async function validerMot(slug: string, moderateurId: string) {
  const mot = await db.mot.update({
    where: { slug },
    data: { statut: "VALIDE", valideParId: moderateurId },
  });

  await db.logModeration.create({
    data: { action: "VALIDE", motId: mot.id, moderateurId },
  });

  return mot;
}

export async function rejeterMot(slug: string, moderateurId: string, motif: string) {
  const mot = await db.mot.update({
    where: { slug },
    data: { statut: "REJETE", motifRejet: motif },
  });

  await db.logModeration.create({
    data: { action: "REJETE", motif, motId: mot.id, moderateurId },
  });

  return mot;
}

export async function editerMotAdmin(slug: string, input: UpdateMotInput, moderateurId: string) {
  const result = await updateMot(slug, input);

  if (result) {
    await db.logModeration.create({
      data: { action: "EDITE", motId: result.id, moderateurId },
    });
  }

  return result;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/tests/api/admin.test.ts
```
Expected: PASS — all tests green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/admin.ts src/lib/mutations/moderation.ts src/tests/api/admin.test.ts
git commit -m "feat: add admin queries and moderation mutations with logs"
```

---

### Task 5: Vote queries and mutations — tests then implementation

**Files:**
- Create: `src/lib/mutations/votes.ts`
- Create: `src/lib/queries/votes.ts`
- Create: `src/tests/api/votes.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/api/votes.test.ts`:
```ts
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { upsertVote } from "@/lib/mutations/votes";
import { getVoteSummary } from "@/lib/queries/votes";

const userId1 = "test-voter-1";
const userId2 = "test-voter-2";

describe("votes", () => {
  let motId: string;

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId1 },
      update: {},
      create: { id: userId1, name: "Voter1", email: "voter1@test.com", emailVerified: false },
    });
    await db.user.upsert({
      where: { id: userId2 },
      update: {},
      create: { id: userId2, name: "Voter2", email: "voter2@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    const mot = await db.mot.create({
      data: { slug: "votetest", mot: "VoteTest", definition: "def", statut: "VALIDE" },
    });
    motId = mot.id;
  });

  describe("upsertVote", () => {
    it("creates a new vote", async () => {
      const vote = await upsertVote(motId, userId1, {
        connaissance: "OUI_UTILISE",
        exactitude: "EXACTE",
      });
      expect(vote.connaissance).toBe("OUI_UTILISE");
      expect(vote.exactitude).toBe("EXACTE");
    });

    it("upserts on re-vote", async () => {
      await upsertVote(motId, userId1, { connaissance: "OUI_UTILISE", exactitude: "EXACTE" });
      const updated = await upsertVote(motId, userId1, { connaissance: "CONNAIS", exactitude: "APPROXIMATIVE" });
      expect(updated.connaissance).toBe("CONNAIS");

      const count = await db.voteMot.count({ where: { motId, userId: userId1 } });
      expect(count).toBe(1);
    });
  });

  describe("getVoteSummary", () => {
    it("returns aggregated counts", async () => {
      await upsertVote(motId, userId1, { connaissance: "OUI_UTILISE", exactitude: "EXACTE" });
      await upsertVote(motId, userId2, { connaissance: "CONNAIS", exactitude: "APPROXIMATIVE" });

      const summary = await getVoteSummary(motId);
      expect(summary.totalVotes).toBe(2);
      expect(summary.connaissance.OUI_UTILISE).toBe(1);
      expect(summary.connaissance.CONNAIS).toBe(1);
      expect(summary.exactitude.EXACTE).toBe(1);
      expect(summary.exactitude.APPROXIMATIVE).toBe(1);
    });

    it("returns zeros when no votes", async () => {
      const summary = await getVoteSummary(motId);
      expect(summary.totalVotes).toBe(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test src/tests/api/votes.test.ts
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `src/lib/mutations/votes.ts`**

```ts
import { db } from "@/lib/db";
import type { VoteMotInput } from "@/lib/validators/vote";

export async function upsertVote(motId: string, userId: string, input: VoteMotInput) {
  return db.voteMot.upsert({
    where: { motId_userId: { motId, userId } },
    create: {
      motId,
      userId,
      connaissance: input.connaissance,
      exactitude: input.exactitude,
    },
    update: {
      connaissance: input.connaissance,
      exactitude: input.exactitude,
    },
  });
}
```

- [ ] **Step 4: Create `src/lib/queries/votes.ts`**

```ts
import { db } from "@/lib/db";

export async function getVoteSummary(motId: string) {
  const votes = await db.voteMot.findMany({ where: { motId } });

  const connaissance = { OUI_UTILISE: 0, CONNAIS: 0, JAMAIS_ENTENDU: 0 };
  const exactitude = { EXACTE: 0, APPROXIMATIVE: 0, FAUSSE: 0 };

  for (const vote of votes) {
    connaissance[vote.connaissance]++;
    exactitude[vote.exactitude]++;
  }

  return { totalVotes: votes.length, connaissance, exactitude };
}

export async function getUserVote(motId: string, userId: string) {
  return db.voteMot.findUnique({
    where: { motId_userId: { motId, userId } },
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/tests/api/votes.test.ts
```
Expected: PASS — all tests green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/mutations/votes.ts src/lib/queries/votes.ts src/tests/api/votes.test.ts
git commit -m "feat: add vote upsert and summary queries"
```

---

### Task 6: Admin API route handlers

**Files:**
- Create: `src/app/api/admin/mots/route.ts`
- Create: `src/app/api/admin/mots/[slug]/route.ts`
- Create: `src/app/api/admin/mots/[slug]/valider/route.ts`
- Create: `src/app/api/admin/mots/[slug]/rejeter/route.ts`
- Create: `src/app/api/admin/stats/route.ts`

- [ ] **Step 1: Create helper for admin auth check**

Create `src/lib/auth-helpers.ts`:
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }), session: null };
  }

  const role = (session.user as { role?: string }).role ?? "USER";
  if (role !== "MODERATEUR" && role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}
```

- [ ] **Step 2: Create `src/app/api/admin/mots/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { listAllMots } from "@/lib/queries/admin";
import { getAdminSession } from "@/lib/auth-helpers";
import type { Statut, Categorie } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await getAdminSession();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const statut = (searchParams.get("statut") as Statut) ?? undefined;
  const categorie = (searchParams.get("categorie") as Categorie) ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const result = await listAllMots({ cursor, limit, statut, categorie, search });
  return NextResponse.json(result);
}
```

- [ ] **Step 3: Create `src/app/api/admin/mots/[slug]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { getMotBySlug } from "@/lib/queries/mots";
import { updateMotSchema } from "@/lib/validators/mot";
import { editerMotAdmin } from "@/lib/mutations/moderation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });

  return NextResponse.json(mot);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const body = await request.json();
  const parsed = updateMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await editerMotAdmin(slug, parsed.data, session!.user.id);
  return NextResponse.json(result);
}
```

- [ ] **Step 4: Create `src/app/api/admin/mots/[slug]/valider/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { validerMot } from "@/lib/mutations/moderation";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const result = await validerMot(slug, session!.user.id);
  return NextResponse.json(result);
}
```

- [ ] **Step 5: Create `src/app/api/admin/mots/[slug]/rejeter/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { rejeterMot } from "@/lib/mutations/moderation";
import { rejeterMotSchema } from "@/lib/validators/moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  const { slug } = await params;
  const body = await request.json();
  const parsed = rejeterMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await rejeterMot(slug, session!.user.id, parsed.data.motif);
  return NextResponse.json(result);
}
```

- [ ] **Step 6: Create `src/app/api/admin/stats/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-helpers";
import { getAdminStats } from "@/lib/queries/admin";

export async function GET() {
  const { error } = await getAdminSession();
  if (error) return error;

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth-helpers.ts src/app/api/admin/
git commit -m "feat: add admin API routes for moderation workflow"
```

---

### Task 7: Vote API route handlers

**Files:**
- Create: `src/app/api/mots/[slug]/vote/route.ts`

- [ ] **Step 1: Create `src/app/api/mots/[slug]/vote/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMotBySlug } from "@/lib/queries/mots";
import { voteMotSchema } from "@/lib/validators/vote";
import { upsertVote } from "@/lib/mutations/votes";
import { getVoteSummary } from "@/lib/queries/votes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });

  const summary = await getVoteSummary(mot.id);
  return NextResponse.json(summary);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });

  const body = await request.json();
  const parsed = voteMotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vote = await upsertVote(mot.id, session.user.id, parsed.data);
  return NextResponse.json(vote, { status: 201 });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/mots/[slug]/vote/
git commit -m "feat: add vote API routes (GET summary, POST upsert)"
```

---

### Task 8: Install React Hook Form + add shadcn form components

**Files:**
- Modify: `package.json`
- Create: shadcn components (form, textarea, select, label)

- [ ] **Step 1: Install dependencies**

```bash
pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Add shadcn components**

```bash
pnpm dlx shadcn@latest add form textarea select label
```

If the CLI prompts for config, accept defaults. This creates/updates files in `src/components/ui/`.

- [ ] **Step 3: Verify the components were created**

Check that these files exist:
- `src/components/ui/form.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/label.tsx`

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/ui/
git commit -m "chore: add React Hook Form and shadcn form components"
```

---

### Task 9: Page `/proposer` — word submission form

**Files:**
- Create: `src/app/proposer/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/proposer/page.tsx`:
```tsx
import { getSessionOrRedirect } from "@/proxy";
import { ProposerForm } from "@/components/public/proposer/proposer-form";

export default async function ProposerPage() {
  await getSessionOrRedirect("/proposer");

  return (
    <div className="content-container py-12 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Proposer un mot</h1>
        <p className="text-muted-foreground">
          Soumets un mot nouchi au dictionnaire. Il sera examiné par un modérateur avant publication.
        </p>
      </div>
      <ProposerForm />
    </div>
  );
}
```

- [ ] **Step 2: Create the form component**

Create `src/components/public/proposer/proposer-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMotSchema, type CreateMotInput } from "@/lib/validators/mot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

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

  const form = useForm<CreateMotInput>({
    resolver: zodResolver(createMotSchema),
    defaultValues: {
      mot: "",
      definition: "",
      exemples: [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exemples" as never,
  });

  async function onSubmit(data: CreateMotInput) {
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
          <CheckCircle className="size-12 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold">Mot soumis avec succès !</h2>
          <p className="text-muted-foreground">
            Ton mot sera examiné par un modérateur avant d'être publié.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/mots">Voir le dictionnaire</Link>
            </Button>
            <Button onClick={() => { form.reset(); setStatus("idle"); }}>
              Proposer un autre mot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: goumin, enjailler..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="definition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Définition *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décris le sens du mot..."
                  rows={3}
                  {...field}
                />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <div className="space-y-3">
          <FormLabel>Exemples</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder={`Exemple ${index + 1}...`}
                {...form.register(`exemples.${index}` as const)}
              />
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => append("" as never)}
          >
            <Plus className="size-3.5" />
            Ajouter un exemple
          </Button>
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Envoi en cours...
            </>
          ) : (
            "Soumettre le mot"
          )}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/proposer/ src/components/public/proposer/
git commit -m "feat: add word proposal page with React Hook Form"
```

---

### Task 10: Admin dashboard pages

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/mots/page.tsx`
- Create: `src/app/admin/mots/[slug]/page.tsx`
- Create: `src/components/admin/stats-cards.tsx`
- Create: `src/components/admin/mots-table.tsx`
- Create: `src/components/admin/mot-edit-form.tsx`
- Create: `src/components/admin/mot-preview.tsx`
- Create: `src/components/admin/moderation-logs.tsx`

- [ ] **Step 1: Create admin layout with protection**

Create `src/app/admin/layout.tsx`:
```tsx
import { getSessionOrRedirect } from "@/proxy";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getSessionOrRedirect("/admin", "MODERATEUR");

  return (
    <div className="content-container py-8 space-y-8">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create stats cards component**

Create `src/components/admin/stats-cards.tsx`:
```tsx
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    parStatut: { EN_ATTENTE: number; VALIDE: number; REJETE: number };
    totalContributions: number;
    moderateursActifs: number;
    actionsThisWeek: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    { label: "En attente", value: stats.parStatut.EN_ATTENTE, color: "text-amber-500" },
    { label: "Validés", value: stats.parStatut.VALIDE, color: "text-green-500" },
    { label: "Rejetés", value: stats.parStatut.REJETE, color: "text-red-500" },
    { label: "Total contributions", value: stats.totalContributions },
    { label: "Modérateurs actifs", value: stats.moderateursActifs },
    { label: "Actions cette semaine", value: stats.actionsThisWeek },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="py-4">
          <CardContent className="flex flex-col items-center text-center px-4 py-0 gap-0.5">
            <span className={`text-2xl font-semibold tracking-tight ${item.color ?? ""}`}>
              {item.value}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              {item.label}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create admin dashboard page**

Create `src/app/admin/page.tsx`:
```tsx
import { getAdminStats } from "@/lib/queries/admin";
import { listAllMots } from "@/lib/queries/admin";
import { StatsCards } from "@/components/admin/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { categoryLabel, categoryColor } from "@/lib/category";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, pending] = await Promise.all([
    getAdminStats(),
    listAllMots({ statut: "EN_ATTENTE", limit: 10 }),
  ]);

  return (
    <>
      <div className="flex items-center gap-3">
        <Shield className="size-5" />
        <h1 className="text-2xl font-semibold tracking-tight">Modération</h1>
      </div>

      <StatsCards stats={stats} />

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mots en attente</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/mots">Voir tout <ArrowRight className="size-3.5 ml-1" /></Link>
          </Button>
        </div>

        {pending.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun mot en attente de modération.</p>
        ) : (
          <div className="space-y-2">
            {pending.data.map((mot) => (
              <Link key={mot.id} href={`/admin/mots/${mot.slug}`} className="block">
                <Card className="py-0 hover:border-foreground/30 transition-colors">
                  <CardContent className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold uppercase">{mot.mot}</span>
                      {mot.categorie && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor(mot.categorie)}`}>
                          {categoryLabel(mot.categorie)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>par {mot.soumisPar?.name ?? "Anonyme"}</span>
                      <span>{formatDistanceToNow(mot.createdAt, { addSuffix: true, locale: fr })}</span>
                      <Badge variant="secondary">{mot._count.votes} votes</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Create mots table component**

Create `src/components/admin/mots-table.tsx` — a client component with tabs for statut filtering, search, and pagination. Fetches from `/api/admin/mots` with query params. Displays mot, categorie, author, date, statut badge, vote count, and link to edit page.

This is a `"use client"` component that manages its own state (active tab, search, cursor) and fetches data client-side via `fetch()`.

- [ ] **Step 5: Create admin mots list page**

Create `src/app/admin/mots/page.tsx`:
```tsx
import { MotsTable } from "@/components/admin/mots-table";

export const dynamic = "force-dynamic";

export default function AdminMotsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Tous les mots</h1>
      <MotsTable />
    </>
  );
}
```

- [ ] **Step 6: Create mot preview component**

Create `src/components/admin/mot-preview.tsx` — a component that renders the word detail card (category badge, word title, definition, examples) using the same visual style as `/mots/[slug]`. Accepts the form values as props and updates in real time.

- [ ] **Step 7: Create moderation logs component**

Create `src/components/admin/moderation-logs.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Log {
  id: string;
  action: string;
  motif: string | null;
  createdAt: string;
  moderateur: { name: string };
}

export function ModerationLogs({ logs }: { logs: Log[] }) {
  if (logs.length === 0) return null;

  const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    VALIDE: { label: "Validé", variant: "default" },
    REJETE: { label: "Rejeté", variant: "destructive" },
    EDITE: { label: "Édité", variant: "secondary" },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        Historique de modération
      </h3>
      <div className="space-y-2">
        {logs.map((log) => {
          const config = actionLabels[log.action] ?? { label: log.action, variant: "secondary" as const };
          return (
            <div key={log.id} className="flex items-center gap-3 text-sm">
              <Badge variant={config.variant}>{config.label}</Badge>
              <span className="text-muted-foreground">par {log.moderateur.name}</span>
              {log.motif && <span className="text-muted-foreground italic">— {log.motif}</span>}
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: fr })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create mot edit form component**

Create `src/components/admin/mot-edit-form.tsx` — a `"use client"` component with React Hook Form. Split layout: form on left, `MotPreview` on right using `form.watch()` for live updates. Buttons: "Valider" (POST to valider), "Rejeter" (opens motif field, POST to rejeter), "Sauvegarder" (PUT to edit). Shows vote summary and moderation logs.

- [ ] **Step 9: Create admin mot detail page**

Create `src/app/admin/mots/[slug]/page.tsx`:
```tsx
import { getMotBySlug } from "@/lib/queries/mots";
import { getVoteSummary } from "@/lib/queries/votes";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MotEditForm } from "@/components/admin/mot-edit-form";

export const dynamic = "force-dynamic";

export default async function AdminMotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mot = await getMotBySlug(slug);
  if (!mot) notFound();

  const [voteSummary, logs] = await Promise.all([
    getVoteSummary(mot.id),
    db.logModeration.findMany({
      where: { motId: mot.id },
      include: { moderateur: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        Modérer : <span className="uppercase">{mot.mot}</span>
      </h1>
      <MotEditForm
        mot={JSON.parse(JSON.stringify(mot))}
        voteSummary={voteSummary}
        logs={JSON.parse(JSON.stringify(logs))}
      />
    </>
  );
}
```

- [ ] **Step 10: Verify build**

```bash
pnpm build
```

- [ ] **Step 11: Commit**

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat: add admin dashboard with stats, mots list, and moderation pages"
```

---

### Task 11: Community vote UI on `/mots/[slug]`

**Files:**
- Create: `src/components/public/mots/vote-section.tsx`
- Modify: `src/app/mots/[slug]/page.tsx`

- [ ] **Step 1: Create vote section component**

Create `src/components/public/mots/vote-section.tsx` — a `"use client"` component that:
- Fetches current vote summary from `GET /api/mots/[slug]/vote` on mount
- Displays two questions with button groups (connaissance: 3 options, exactitude: 3 options)
- On click, POSTs to `/api/mots/[slug]/vote` and refreshes the summary
- Shows aggregated results as counts next to each option
- If not authenticated, disables vote buttons with a "Connecte-toi pour voter" message
- Accepts `slug` and `isAuthenticated` as props

- [ ] **Step 2: Wire vote section into word detail page**

Modify `src/app/mots/[slug]/page.tsx`: replace the existing `<WordInteractions>` component with the new `<VoteSection>` component. Pass `slug` and authentication status.

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/public/mots/vote-section.tsx src/app/mots/[slug]/page.tsx
git commit -m "feat: add community vote UI on word detail pages"
```

---

### Task 12: Run all tests and verify build

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
Expected: Build succeeds.

- [ ] **Step 3: Verify Docker build**

```bash
docker compose build app
```
Expected: Docker image builds successfully.

- [ ] **Step 4: Final commit if cleanup needed**

```bash
git add -A
git commit -m "chore: phase 2 complete — community proposals, moderation, votes"
```
