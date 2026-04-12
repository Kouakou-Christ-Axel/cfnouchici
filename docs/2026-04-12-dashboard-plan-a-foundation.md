# Dashboard Plan A — Foundation + USER sections

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the foundation (popularity algorithm + Prisma changes) and the USER-facing dashboard (overview, propositions, profil) with `/api/me/*` endpoints.

**Architecture:** New score module (pure functions + recompute) updates `Mot.popularityScore` synchronously on every vote. Dashboard uses shadcn Sidebar with role-aware sections; USER sections ship in this plan, moderator/admin migration in Plan B. CASL extended with new abilities.

**Tech Stack:** Next.js 16, Prisma 7, Vitest, shadcn (Sidebar, Card, Table, Badge, Input, Select, Dialog, Avatar, Separator, Button), React Hook Form, Zod

---

### Task 1: Extend Prisma schema (popularity + ban flags)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add fields to User model**

Add after `role Role @default(USER)` in the User model:

```prisma
  banned    Boolean   @default(false)
  bannedAt  DateTime?
```

- [ ] **Step 2: Add fields + index to Mot model**

Add before the closing `@@map("mot")` in the Mot model:

```prisma
  popularityScore Float   @default(0)
  socialScore     Int     @default(0)
  socialNotes     String?

  @@index([statut, popularityScore])
```

- [ ] **Step 3: Run migration**

```bash
pnpm prisma migrate dev --name add-popularity-social-and-ban-flags
```

Expected: migration applied successfully, Prisma client regenerated.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add popularityScore, socialScore, banned fields to schema"
```

---

### Task 2: Popularity scoring module (pure + TDD)

**Files:**
- Create: `src/lib/score/popularity.ts`
- Create: `src/tests/score/popularity.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/score/popularity.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  calculatePopularityScore,
  applyTemporalBoost,
  POPULARITY_WEIGHTS,
} from "@/lib/score/popularity";

const emptyInput = {
  ouiUtilise: 0,
  connais: 0,
  jamaisEntendu: 0,
  exacte: 0,
  approximative: 0,
  fausse: 0,
  totalVotes: 0,
  socialScore: 0,
};

describe("calculatePopularityScore", () => {
  it("returns 0 for all-zero input", () => {
    expect(calculatePopularityScore(emptyInput)).toBe(0);
  });

  it("weights OUI_UTILISE at 3x", () => {
    const score = calculatePopularityScore({ ...emptyInput, ouiUtilise: 10, totalVotes: 10 });
    // 3*10 + log(11)*2 ≈ 30 + 4.79
    expect(score).toBeGreaterThan(30);
    expect(score).toBeLessThan(36);
  });

  it("penalizes JAMAIS_ENTENDU at -2x", () => {
    const score = calculatePopularityScore({ ...emptyInput, jamaisEntendu: 5, totalVotes: 5 });
    // -2*5 + log(6)*2 ≈ -10 + 3.58
    expect(score).toBeLessThan(-6);
    expect(score).toBeGreaterThan(-8);
  });

  it("penalizes FAUSSE at -2x", () => {
    const score = calculatePopularityScore({ ...emptyInput, fausse: 3, totalVotes: 3 });
    expect(score).toBeLessThan(-3);
  });

  it("applies social score with high multiplier", () => {
    const score = calculatePopularityScore({ ...emptyInput, socialScore: 5 });
    expect(score).toBe(5 * POPULARITY_WEIGHTS.SOCIAL_MULTIPLIER);
  });

  it("boosts engagement logarithmically", () => {
    const low = calculatePopularityScore({ ...emptyInput, totalVotes: 1 });
    const high = calculatePopularityScore({ ...emptyInput, totalVotes: 100 });
    expect(high).toBeGreaterThan(low);
  });

  it("combines all factors correctly", () => {
    const score = calculatePopularityScore({
      ouiUtilise: 10,
      connais: 5,
      jamaisEntendu: 2,
      exacte: 8,
      approximative: 3,
      fausse: 1,
      totalVotes: 29,
      socialScore: 7,
    });
    // 3*10 + 1*5 - 2*2 + 2*8 + 0*3 - 2*1 + log(30)*2 + 7*3
    // = 30 + 5 - 4 + 16 + 0 - 2 + 6.80 + 21 ≈ 72.80
    expect(score).toBeGreaterThan(72);
    expect(score).toBeLessThan(74);
  });
});

describe("applyTemporalBoost", () => {
  it("returns stored score when createdAt is now", () => {
    const now = new Date("2026-04-12T12:00:00Z");
    expect(applyTemporalBoost(10, now, now)).toBe(10);
  });

  it("boosts score by days pending", () => {
    const now = new Date("2026-04-12T12:00:00Z");
    const tenDaysAgo = new Date("2026-04-02T12:00:00Z");
    // 10 days × 0.5 = 5 boost
    expect(applyTemporalBoost(10, tenDaysAgo, now)).toBeCloseTo(15, 1);
  });

  it("never decreases the score", () => {
    const now = new Date("2026-04-12T12:00:00Z");
    const past = new Date("2026-01-01T12:00:00Z");
    const boosted = applyTemporalBoost(10, past, now);
    expect(boosted).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
pnpm test src/tests/score/popularity.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/score/popularity.ts`**

```ts
export interface PopularityInput {
  ouiUtilise: number;
  connais: number;
  jamaisEntendu: number;
  exacte: number;
  approximative: number;
  fausse: number;
  totalVotes: number;
  socialScore: number;
}

export const POPULARITY_WEIGHTS = {
  OUI_UTILISE: 3,
  CONNAIS: 1,
  JAMAIS_ENTENDU: -2,
  EXACTE: 2,
  APPROXIMATIVE: 0,
  FAUSSE: -2,
  ENGAGEMENT_MULTIPLIER: 2,
  SOCIAL_MULTIPLIER: 3,
  TEMPORAL_BOOST_PER_DAY: 0.5,
};

export function calculatePopularityScore(input: PopularityInput): number {
  return (
    POPULARITY_WEIGHTS.OUI_UTILISE * input.ouiUtilise +
    POPULARITY_WEIGHTS.CONNAIS * input.connais +
    POPULARITY_WEIGHTS.JAMAIS_ENTENDU * input.jamaisEntendu +
    POPULARITY_WEIGHTS.EXACTE * input.exacte +
    POPULARITY_WEIGHTS.APPROXIMATIVE * input.approximative +
    POPULARITY_WEIGHTS.FAUSSE * input.fausse +
    Math.log(1 + input.totalVotes) * POPULARITY_WEIGHTS.ENGAGEMENT_MULTIPLIER +
    input.socialScore * POPULARITY_WEIGHTS.SOCIAL_MULTIPLIER
  );
}

export function applyTemporalBoost(
  storedScore: number,
  createdAt: Date,
  now: Date = new Date(),
): number {
  const daysPending = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return storedScore + daysPending * POPULARITY_WEIGHTS.TEMPORAL_BOOST_PER_DAY;
}
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
pnpm test src/tests/score/popularity.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/score/ src/tests/score/
git commit -m "feat: add popularity scoring module"
```

---

### Task 3: Recompute mot score function (TDD)

**Files:**
- Create: `src/lib/score/recompute-mot-score.ts`
- Create: `src/tests/score/recompute.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/score/recompute.test.ts`:

```ts
import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { recomputeMotScore } from "@/lib/score/recompute-mot-score";

const voter1 = "test-voter-score-1";
const voter2 = "test-voter-score-2";

describe("recomputeMotScore", () => {
  let motId: string;

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: voter1 },
      update: {},
      create: { id: voter1, name: "V1", email: "v1@test.com", emailVerified: false },
    });
    await db.user.upsert({
      where: { id: voter2 },
      update: {},
      create: { id: voter2, name: "V2", email: "v2@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.voteMot.deleteMany();
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
    const mot = await db.mot.create({
      data: { slug: "score-test", mot: "ScoreTest", definition: "def", statut: "VALIDE" },
    });
    motId = mot.id;
  });

  it("sets score to 0 when there are no votes", async () => {
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    expect(mot!.popularityScore).toBe(0);
  });

  it("computes score from positive votes", async () => {
    await db.voteMot.create({
      data: { motId, userId: voter1, connaissance: "OUI_UTILISE", exactitude: "EXACTE" },
    });
    await db.voteMot.create({
      data: { motId, userId: voter2, connaissance: "OUI_UTILISE", exactitude: "EXACTE" },
    });
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    // 2×3 (OUI) + 2×2 (EXACTE) + log(3)×2 = 6 + 4 + 2.2 ≈ 12.2
    expect(mot!.popularityScore).toBeGreaterThan(12);
    expect(mot!.popularityScore).toBeLessThan(13);
  });

  it("factors in socialScore from the mot", async () => {
    await db.mot.update({ where: { id: motId }, data: { socialScore: 5 } });
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    // 5 × 3 = 15
    expect(mot!.popularityScore).toBe(15);
  });

  it("handles negative votes", async () => {
    await db.voteMot.create({
      data: { motId, userId: voter1, connaissance: "JAMAIS_ENTENDU", exactitude: "FAUSSE" },
    });
    await recomputeMotScore(motId);
    const mot = await db.mot.findUnique({ where: { id: motId } });
    // -2 - 2 + log(2)×2 ≈ -4 + 1.39 ≈ -2.61
    expect(mot!.popularityScore).toBeLessThan(-2);
    expect(mot!.popularityScore).toBeGreaterThan(-3);
  });
});
```

- [ ] **Step 2: Run tests — verify they FAIL**

```bash
pnpm test src/tests/score/recompute.test.ts
```

- [ ] **Step 3: Create `src/lib/score/recompute-mot-score.ts`**

```ts
import { db } from "@/lib/db";
import { calculatePopularityScore, type PopularityInput } from "@/lib/score/popularity";

export async function recomputeMotScore(motId: string): Promise<void> {
  const [votes, mot] = await Promise.all([
    db.voteMot.findMany({
      where: { motId },
      select: { connaissance: true, exactitude: true },
    }),
    db.mot.findUnique({
      where: { id: motId },
      select: { socialScore: true },
    }),
  ]);

  const counts: PopularityInput = {
    ouiUtilise: 0,
    connais: 0,
    jamaisEntendu: 0,
    exacte: 0,
    approximative: 0,
    fausse: 0,
    totalVotes: votes.length,
    socialScore: mot?.socialScore ?? 0,
  };

  for (const vote of votes) {
    if (vote.connaissance === "OUI_UTILISE") counts.ouiUtilise++;
    else if (vote.connaissance === "CONNAIS") counts.connais++;
    else if (vote.connaissance === "JAMAIS_ENTENDU") counts.jamaisEntendu++;

    if (vote.exactitude === "EXACTE") counts.exacte++;
    else if (vote.exactitude === "APPROXIMATIVE") counts.approximative++;
    else if (vote.exactitude === "FAUSSE") counts.fausse++;
  }

  const score = calculatePopularityScore(counts);

  await db.mot.update({
    where: { id: motId },
    data: { popularityScore: score },
  });
}
```

- [ ] **Step 4: Run tests — verify they PASS**

```bash
pnpm test src/tests/score/recompute.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/score/recompute-mot-score.ts src/tests/score/recompute.test.ts
git commit -m "feat: add recomputeMotScore function"
```

---

### Task 4: Wire recompute into upsertVote

**Files:**
- Modify: `src/lib/mutations/votes.ts`
- Modify: `src/tests/api/votes.test.ts`

- [ ] **Step 1: Update `src/lib/mutations/votes.ts`**

Replace the file:

```ts
import { db } from "@/lib/db";
import { recomputeMotScore } from "@/lib/score/recompute-mot-score";
import type { VoteMotInput } from "@/lib/validators/vote";

export async function upsertVote(motId: string, userId: string, input: VoteMotInput) {
  const vote = await db.voteMot.upsert({
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

  await recomputeMotScore(motId);

  return vote;
}
```

- [ ] **Step 2: Add a test for score recompute on vote**

Open `src/tests/api/votes.test.ts` and add this test inside the `describe("upsertVote", ...)` block:

```ts
it("recomputes the popularity score after voting", async () => {
  await upsertVote(motId, userId1, { connaissance: "OUI_UTILISE", exactitude: "EXACTE" });
  const motAfter = await db.mot.findUnique({ where: { id: motId } });
  expect(motAfter!.popularityScore).toBeGreaterThan(0);
});
```

- [ ] **Step 3: Run all vote tests**

```bash
pnpm test src/tests/api/votes.test.ts
```

Expected: PASS (all existing tests + new one).

- [ ] **Step 4: Commit**

```bash
git add src/lib/mutations/votes.ts src/tests/api/votes.test.ts
git commit -m "feat: recompute popularity score on every vote"
```

---

### Task 5: CASL — new abilities for User and LogModeration

**Files:**
- Modify: `src/lib/casl/types.ts`
- Modify: `src/lib/casl/abilities.ts`
- Modify: `src/tests/casl/abilities.test.ts`

- [ ] **Step 1: Extend Subjects type**

Edit `src/lib/casl/types.ts`, update the `Subjects` type:

```ts
export type Subjects = "Mot" | "User" | "LogModeration" | "all";
```

- [ ] **Step 2: Add abilities in `src/lib/casl/abilities.ts`**

In the ADMIN branch (`if (user.role === "ADMIN")`), BEFORE `can("manage", "all")`, add (it's already manage all so no change needed). But to make the check explicit and testable, add rules BEFORE the admin manage:

In the MODERATEUR branch, after existing rules, no changes.

The ADMIN `manage: all` already covers everything. We just need tests to prove it. No code changes to `abilities.ts` needed — verify the current implementation already handles `User` and `LogModeration` subjects through `manage`/`all`.

Read the file to confirm. If the SimpleAbility class handles wildcards correctly, proceed to tests.

- [ ] **Step 3: Add tests in `src/tests/casl/abilities.test.ts`**

Add at the end of the file, inside the top-level `describe("CASL abilities", ...)`:

```ts
  describe("ADMIN manages User and LogModeration", () => {
    const abilities = defineAbilitiesFor(makeUser("ADMIN"));

    it("can manage User", () => {
      expect(abilities.can("manage", "User" as never)).toBe(true);
    });

    it("can read LogModeration", () => {
      expect(abilities.can("read", "LogModeration" as never)).toBe(true);
    });
  });

  describe("MODERATEUR cannot manage User", () => {
    const abilities = defineAbilitiesFor(makeUser("MODERATEUR"));

    it("cannot manage User", () => {
      expect(abilities.can("manage", "User" as never)).toBe(false);
    });
  });
```

- [ ] **Step 4: Run tests**

```bash
pnpm test src/tests/casl/abilities.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/casl/ src/tests/casl/
git commit -m "feat: extend CASL subjects with User and LogModeration"
```

---

### Task 6: Install shadcn Sidebar + needed components

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `src/components/ui/sidebar.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/skeleton.tsx`, `src/components/ui/tooltip.tsx`, `src/components/ui/table.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/slider.tsx`, `src/components/ui/tabs.tsx`

- [ ] **Step 1: Install shadcn sidebar + dependencies**

```bash
pnpm dlx shadcn@latest add sidebar sheet skeleton tooltip table dialog slider tabs
```

- [ ] **Step 2: Fix pnpm state if bun touched the lockfile**

```bash
ls bun.lock 2>&1
```

If it exists:
```bash
rm -f bun.lock
pnpm install
```

- [ ] **Step 3: Verify all components exist**

Check these files exist:
- `src/components/ui/sidebar.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/slider.tsx`
- `src/components/ui/tabs.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ package.json pnpm-lock.yaml
git commit -m "chore: add shadcn Sidebar, Table, Dialog, Tabs and related components"
```

---

### Task 7: Query layer — me queries and mutations

**Files:**
- Create: `src/lib/queries/me.ts`
- Create: `src/lib/mutations/me.ts`
- Create: `src/lib/validators/me.ts`
- Create: `src/tests/api/me.test.ts`

- [ ] **Step 1: Create `src/lib/validators/me.ts`**

```ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

- [ ] **Step 2: Write failing tests**

Create `src/tests/api/me.test.ts`:

```ts
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { getMyStats, listMyPropositions } from "@/lib/queries/me";
import { deleteMyProposition, updateMyProfile } from "@/lib/mutations/me";

const userId = "test-me-user";

describe("me queries/mutations", () => {
  beforeAll(async () => {
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, name: "Me", email: "me@test.com", emailVerified: false },
    });
  });

  beforeEach(async () => {
    await db.exemple.deleteMany();
    await db.mot.deleteMany();
  });

  describe("getMyStats", () => {
    it("returns zero stats for a user with no propositions", async () => {
      const stats = await getMyStats(userId);
      expect(stats.total).toBe(0);
      expect(stats.validated).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.rejected).toBe(0);
      expect(stats.recentPropositions).toHaveLength(0);
    });

    it("counts propositions by status", async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", definition: "def", statut: "VALIDE", soumisParId: userId },
          { slug: "b", mot: "B", definition: "def", statut: "VALIDE", soumisParId: userId },
          { slug: "c", mot: "C", definition: "def", statut: "EN_ATTENTE", soumisParId: userId },
          { slug: "d", mot: "D", definition: "def", statut: "REJETE", soumisParId: userId },
        ],
      });
      const stats = await getMyStats(userId);
      expect(stats.total).toBe(4);
      expect(stats.validated).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.rejected).toBe(1);
    });

    it("returns 5 most recent propositions", async () => {
      await db.mot.createMany({
        data: Array.from({ length: 7 }).map((_, i) => ({
          slug: `slug-${i}`,
          mot: `Mot${i}`,
          definition: "def",
          statut: "EN_ATTENTE" as const,
          soumisParId: userId,
        })),
      });
      const stats = await getMyStats(userId);
      expect(stats.recentPropositions).toHaveLength(5);
    });
  });

  describe("listMyPropositions", () => {
    beforeEach(async () => {
      await db.mot.createMany({
        data: [
          { slug: "a", mot: "A", definition: "def", statut: "VALIDE", soumisParId: userId },
          { slug: "b", mot: "B", definition: "def", statut: "EN_ATTENTE", soumisParId: userId },
          { slug: "c", mot: "C", definition: "def", statut: "REJETE", soumisParId: userId },
        ],
      });
    });

    it("returns only propositions of the given user", async () => {
      const result = await listMyPropositions(userId, {});
      expect(result.data).toHaveLength(3);
    });

    it("filters by statut", async () => {
      const result = await listMyPropositions(userId, { statut: "VALIDE" });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe("a");
    });

    it("supports search", async () => {
      const result = await listMyPropositions(userId, { search: "A" });
      expect(result.data.some((m) => m.mot === "A")).toBe(true);
    });
  });

  describe("deleteMyProposition", () => {
    it("deletes the user's own EN_ATTENTE word", async () => {
      await db.mot.create({
        data: { slug: "tokill", mot: "ToKill", definition: "def", statut: "EN_ATTENTE", soumisParId: userId },
      });
      await deleteMyProposition(userId, "tokill");
      const found = await db.mot.findUnique({ where: { slug: "tokill" } });
      expect(found).toBeNull();
    });

    it("throws if the mot does not belong to the user", async () => {
      await db.mot.create({
        data: { slug: "notmine", mot: "NotMine", definition: "def", statut: "EN_ATTENTE" },
      });
      await expect(deleteMyProposition(userId, "notmine")).rejects.toThrow();
    });

    it("throws if the mot is already validated", async () => {
      await db.mot.create({
        data: { slug: "valid", mot: "Valid", definition: "def", statut: "VALIDE", soumisParId: userId },
      });
      await expect(deleteMyProposition(userId, "valid")).rejects.toThrow();
    });
  });

  describe("updateMyProfile", () => {
    it("updates the user name", async () => {
      await updateMyProfile(userId, { name: "New Name" });
      const user = await db.user.findUnique({ where: { id: userId } });
      expect(user!.name).toBe("New Name");
    });
  });
});
```

- [ ] **Step 3: Run tests — verify they FAIL**

```bash
pnpm test src/tests/api/me.test.ts
```

- [ ] **Step 4: Create `src/lib/queries/me.ts`**

```ts
import { db } from "@/lib/db";
import type { Statut } from "@/generated/prisma";

interface ListMyPropositionsParams {
  statut?: Statut;
  search?: string;
  cursor?: string;
  limit?: number;
}

export async function getMyStats(userId: string) {
  const [total, validated, pending, rejected, oldestPending, recentPropositions] = await Promise.all([
    db.mot.count({ where: { soumisParId: userId } }),
    db.mot.count({ where: { soumisParId: userId, statut: "VALIDE" } }),
    db.mot.count({ where: { soumisParId: userId, statut: "EN_ATTENTE" } }),
    db.mot.count({ where: { soumisParId: userId, statut: "REJETE" } }),
    db.mot.findFirst({
      where: { soumisParId: userId, statut: "EN_ATTENTE" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    db.mot.findMany({
      where: { soumisParId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        mot: true,
        definition: true,
        categorie: true,
        statut: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    total,
    validated,
    pending,
    rejected,
    oldestPendingAt: oldestPending?.createdAt ?? null,
    recentPropositions,
  };
}

export async function listMyPropositions(userId: string, params: ListMyPropositionsParams = {}) {
  const { statut, search, cursor, limit = 20 } = params;
  const where: Record<string, unknown> = { soumisParId: userId };

  if (statut) where.statut = statut;
  if (search) {
    where.OR = [
      { mot: { contains: search, mode: "insensitive" } },
      { definition: { contains: search, mode: "insensitive" } },
    ];
  }

  const mots = await db.mot.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = mots.length > limit;
  const data = hasMore ? mots.slice(0, limit) : mots;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor };
}
```

- [ ] **Step 5: Create `src/lib/mutations/me.ts`**

```ts
import { db } from "@/lib/db";
import type { UpdateProfileInput } from "@/lib/validators/me";

export async function deleteMyProposition(userId: string, slug: string) {
  const mot = await db.mot.findUnique({ where: { slug } });
  if (!mot) throw new Error("NOT_FOUND");
  if (mot.soumisParId !== userId) throw new Error("FORBIDDEN");
  if (mot.statut !== "EN_ATTENTE") throw new Error("NOT_PENDING");

  return db.mot.delete({ where: { slug } });
}

export async function updateMyProfile(userId: string, input: UpdateProfileInput) {
  return db.user.update({
    where: { id: userId },
    data: { name: input.name },
  });
}
```

- [ ] **Step 6: Run tests — verify they PASS**

```bash
pnpm test src/tests/api/me.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/queries/me.ts src/lib/mutations/me.ts src/lib/validators/me.ts src/tests/api/me.test.ts
git commit -m "feat: add me queries and mutations (stats, propositions, profile)"
```

---

### Task 8: API endpoints `/api/me/*`

**Files:**
- Create: `src/app/api/me/stats/route.ts`
- Create: `src/app/api/me/propositions/route.ts`
- Create: `src/app/api/me/propositions/[slug]/route.ts`
- Create: `src/app/api/me/profile/route.ts`

- [ ] **Step 1: Create `src/app/api/me/stats/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyStats } from "@/lib/queries/me";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const stats = await getMyStats(session.user.id);
  return NextResponse.json(stats);
}
```

- [ ] **Step 2: Create `src/app/api/me/propositions/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { listMyPropositions } from "@/lib/queries/me";
import type { Statut } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const statut = (searchParams.get("statut") as Statut) ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const result = await listMyPropositions(session.user.id, { statut, search, cursor, limit });
  return NextResponse.json(result);
}
```

- [ ] **Step 3: Create `src/app/api/me/propositions/[slug]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteMyProposition } from "@/lib/mutations/me";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { slug } = await params;
  try {
    await deleteMyProposition(session.user.id, slug);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "NOT_FOUND") return NextResponse.json({ error: "Mot non trouvé" }, { status: 404 });
      if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      if (e.message === "NOT_PENDING") return NextResponse.json({ error: "Mot déjà traité" }, { status: 409 });
    }
    throw e;
  }
}
```

- [ ] **Step 4: Create `src/app/api/me/profile/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateMyProfile } from "@/lib/mutations/me";
import { updateProfileSchema } from "@/lib/validators/me";

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await updateMyProfile(session.user.id, parsed.data);
  return NextResponse.json(user);
}
```

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/me/
git commit -m "feat: add /api/me/* endpoints (stats, propositions, profile)"
```

---

### Task 9: Dashboard shell — layout + sidebar structure

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/components/dashboard/shell.tsx`
- Create: `src/components/dashboard/sidebar-nav.tsx`
- Create: `src/components/dashboard/sidebar-user.tsx`

- [ ] **Step 1: Create the layout (`src/app/dashboard/layout.tsx`)**

```tsx
import { getSessionOrRedirect } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionOrRedirect("/dashboard");
  const user = session.user as {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
```

- [ ] **Step 2: Create the sidebar user card (`src/components/dashboard/sidebar-user.tsx`)**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SidebarUserProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const ROLE_META: Record<string, { label: string; className: string }> = {
  USER: { label: "Contributeur", className: "bg-purple-100 text-purple-700" },
  MODERATEUR: { label: "Modérateur", className: "bg-blue-100 text-blue-700" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
};

export function SidebarUser({ user }: SidebarUserProps) {
  const router = useRouter();
  const role = user.role ?? "USER";
  const meta = ROLE_META[role] ?? ROLE_META.USER;
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 p-3 border-t border-sidebar-border">
      <Avatar className="size-9">
        <AvatarImage src={user.image ?? undefined} alt={user.name} />
        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-semibold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{user.name}</p>
        <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase", meta.className)}>
          {meta.label}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        aria-label="Se déconnecter"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create the sidebar nav (`src/components/dashboard/sidebar-nav.tsx`)**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User,
  Shield,
  MessageSquare,
  BarChart,
  Users,
  FileClock,
} from "lucide-react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  role: string;
}

const USER_ITEMS = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/propositions", label: "Mes propositions", icon: FileText },
  { href: "/dashboard/profil", label: "Profil & paramètres", icon: User },
];

const MOD_ITEMS = [
  { href: "/dashboard/moderation", label: "File d'attente", icon: Shield },
  { href: "/dashboard/mots", label: "Tous les mots", icon: MessageSquare },
  { href: "/dashboard/stats", label: "Stats globales", icon: BarChart },
];

const ADMIN_ITEMS = [
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/dashboard/logs", label: "Logs de modération", icon: FileClock },
];

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const isStaff = role === "MODERATEUR" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Mon espace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {USER_ITEMS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isStaff && (
        <SidebarGroup>
          <SidebarGroupLabel>Modération</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MOD_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}
```

- [ ] **Step 4: Create the shell (`src/components/dashboard/shell.tsx`)**

```tsx
"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SidebarUser } from "@/components/dashboard/sidebar-user";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link
            href="/"
            className="font-(family-name:--font-heading) font-extrabold text-lg tracking-tight"
          >
            nouchi<span className="text-red-500">.</span>ci
          </Link>
        </SidebarHeader>
        <SidebarNav role={user.role ?? "USER"} />
        <SidebarUser user={user} />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center h-14 border-b border-border px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

Note: Since `/dashboard/page.tsx` does not exist yet, the route will 404. That's expected — Task 10 will add it.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/layout.tsx src/components/dashboard/
git commit -m "feat: add dashboard shell with shadcn Sidebar"
```

---

### Task 10: `/dashboard` overview page (USER view)

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/stat-card.tsx`
- Create: `src/components/dashboard/status-chip.tsx`
- Create: `src/components/dashboard/overview/user-overview.tsx`
- Create: `src/components/dashboard/overview/overview-props-list.tsx`

- [ ] **Step 1: Create `src/components/dashboard/stat-card.tsx`**

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const TONE_CLASSES: Record<string, string> = {
  default: "",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export function StatCard({ label, value, helper, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight mt-1",
            TONE_CLASSES[tone],
          )}
        >
          {value}
        </p>
        {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create `src/components/dashboard/status-chip.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
}

const CONFIG: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  VALIDE: { label: "Validé", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  REJETE: { label: "Rejeté", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function StatusChip({ statut }: StatusChipProps) {
  const config = CONFIG[statut];
  return (
    <Badge variant="secondary" className={cn("text-[10px] font-semibold uppercase", config.className)}>
      {config.label}
    </Badge>
  );
}
```

- [ ] **Step 3: Create `src/components/dashboard/overview/overview-props-list.tsx`**

```tsx
import Link from "next/link";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Proposition {
  id: string;
  slug: string;
  mot: string;
  definition: string;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
}

interface OverviewPropsListProps {
  propositions: Proposition[];
}

export function OverviewPropsList({ propositions }: OverviewPropsListProps) {
  if (propositions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Tu n&apos;as encore proposé aucun mot.{" "}
          <Link href="/proposer" className="text-foreground font-semibold hover:underline">
            Commence maintenant →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {propositions.map((prop, i) => (
          <div key={prop.id}>
            {i > 0 && <Separator />}
            <Link
              href={`/mots/${prop.slug}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-(family-name:--font-heading) font-bold uppercase text-sm">
                  {prop.mot}
                </p>
                <p className="text-xs text-muted-foreground truncate">{prop.definition}</p>
              </div>
              <StatusChip statut={prop.statut} />
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create `src/components/dashboard/overview/user-overview.tsx`**

```tsx
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewPropsList } from "@/components/dashboard/overview/overview-props-list";

interface UserOverviewProps {
  name: string;
  stats: {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
    oldestPendingAt: Date | null;
    recentPropositions: {
      id: string;
      slug: string;
      mot: string;
      definition: string;
      statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
    }[];
  };
}

export function UserOverview({ name, stats }: UserOverviewProps) {
  const acceptanceRate =
    stats.validated + stats.rejected > 0
      ? Math.round((stats.validated / (stats.validated + stats.rejected)) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Bonjour {name} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Voici un aperçu de ton activité sur Nouchici.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Propositions" value={stats.total} />
        <StatCard
          label="Validées"
          value={stats.validated}
          helper={stats.validated + stats.rejected > 0 ? `${acceptanceRate}% de réussite` : undefined}
          tone="success"
        />
        <StatCard
          label="En attente"
          value={stats.pending}
          helper={stats.oldestPendingAt ? `depuis ${new Date(stats.oldestPendingAt).toLocaleDateString("fr-FR")}` : undefined}
          tone="warning"
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-(family-name:--font-heading) text-lg font-bold tracking-tight">
            Dernières propositions
          </h2>
          <Link href="/dashboard/propositions" className="text-sm text-muted-foreground hover:text-foreground">
            Voir tout →
          </Link>
        </div>
        <OverviewPropsList propositions={stats.recentPropositions} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/app/dashboard/page.tsx`**

```tsx
import { getSessionOrRedirect } from "@/lib/auth-guard";
import { getMyStats } from "@/lib/queries/me";
import { UserOverview } from "@/components/dashboard/overview/user-overview";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSessionOrRedirect("/dashboard");
  const stats = await getMyStats(session.user.id);

  return <UserOverview name={session.user.name ?? ""} stats={stats} />;
}
```

- [ ] **Step 6: Verify build**

```bash
pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/dashboard/
git commit -m "feat: add dashboard overview page with stat cards"
```

---

### Task 11: `/dashboard/propositions` + delete dialog

**Files:**
- Create: `src/app/dashboard/propositions/page.tsx`
- Create: `src/components/dashboard/propositions/propositions-table.tsx`
- Create: `src/components/dashboard/propositions/delete-proposition-dialog.tsx`

- [ ] **Step 1: Create the delete dialog (`src/components/dashboard/propositions/delete-proposition-dialog.tsx`)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeletePropositionDialogProps {
  slug: string;
  mot: string;
}

export function DeletePropositionDialog({ slug, mot }: DeletePropositionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/me/propositions/${slug}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Supprimer">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer cette proposition ?</DialogTitle>
          <DialogDescription>
            Tu vas supprimer <strong className="uppercase">{mot}</strong>. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Create the table component (`src/components/dashboard/propositions/propositions-table.tsx`)**

```tsx
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusChip } from "@/components/dashboard/status-chip";
import { DeletePropositionDialog } from "@/components/dashboard/propositions/delete-proposition-dialog";
import { categoryLabel } from "@/lib/category";

interface Proposition {
  id: string;
  slug: string;
  mot: string;
  categorie: string | null;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
  motifRejet: string | null;
  createdAt: Date;
}

interface PropositionsTableProps {
  propositions: Proposition[];
}

export function PropositionsTable({ propositions }: PropositionsTableProps) {
  if (propositions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Aucune proposition trouvée.
      </p>
    );
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mot</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propositions.map((prop) => (
            <TableRow key={prop.id}>
              <TableCell className="font-(family-name:--font-heading) font-bold uppercase">
                {prop.mot}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {categoryLabel(prop.categorie)}
              </TableCell>
              <TableCell>
                {prop.statut === "REJETE" && prop.motifRejet ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <StatusChip statut={prop.statut} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Motif : {prop.motifRejet}</TooltipContent>
                  </Tooltip>
                ) : (
                  <StatusChip statut={prop.statut} />
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(prop.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="text-right">
                {prop.statut === "VALIDE" && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/mots/${prop.slug}`} aria-label="Voir">
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                )}
                {prop.statut === "EN_ATTENTE" && (
                  <DeletePropositionDialog slug={prop.slug} mot={prop.mot} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
```

- [ ] **Step 3: Create the page (`src/app/dashboard/propositions/page.tsx`)**

```tsx
import { getSessionOrRedirect } from "@/lib/auth-guard";
import { listMyPropositions } from "@/lib/queries/me";
import { PropositionsTable } from "@/components/dashboard/propositions/propositions-table";
import type { Statut } from "@/generated/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ statut?: string; search?: string; cursor?: string }>;
}

export default async function PropositionsPage({ searchParams }: PageProps) {
  const session = await getSessionOrRedirect("/dashboard/propositions");
  const params = await searchParams;
  const statut = (params.statut as Statut) || undefined;
  const search = params.search || undefined;
  const cursor = params.cursor || undefined;

  const { data } = await listMyPropositions(session.user.id, { statut, search, cursor, limit: 20 });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Mes propositions
        </h1>
        <p className="text-muted-foreground text-sm">
          Gère tes mots soumis au dictionnaire.
        </p>
      </header>
      <PropositionsTable propositions={data} />
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/propositions/ src/components/dashboard/propositions/
git commit -m "feat: add /dashboard/propositions page with delete action"
```

---

### Task 12: `/dashboard/profil` page

**Files:**
- Create: `src/app/dashboard/profil/page.tsx`
- Create: `src/components/dashboard/profil/profile-form.tsx`

- [ ] **Step 1: Create the form (`src/components/dashboard/profil/profile-form.tsx`)**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const ROLE_META: Record<string, { label: string; className: string }> = {
  USER: { label: "Contributeur", className: "bg-purple-100 text-purple-700" },
  MODERATEUR: { label: "Modérateur", className: "bg-blue-100 text-blue-700" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const meta = ROLE_META[user.role ?? "USER"] ?? ROLE_META.USER;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage({ type: "success", text: "Profil mis à jour." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour." });
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.email}</p>
            <Badge variant="secondary" className={cn("mt-1 text-[10px] uppercase", meta.className)}>
              {meta.label}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom d&apos;affichage</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={60}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ce nom sera visible par les autres utilisateurs sur tes propositions.
            </p>
          </div>

          {message && (
            <p className={cn("text-sm", message.type === "success" ? "text-emerald-600" : "text-destructive")}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={loading || name === user.name} className="rounded-full">
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create the page (`src/app/dashboard/profil/page.tsx`)**

```tsx
import { getSessionOrRedirect } from "@/lib/auth-guard";
import { ProfileForm } from "@/components/dashboard/profil/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await getSessionOrRedirect("/dashboard/profil");
  const user = session.user as {
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="space-y-1">
        <h1 className="font-(family-name:--font-heading) text-3xl font-extrabold tracking-tight">
          Profil & paramètres
        </h1>
        <p className="text-muted-foreground text-sm">
          Gère les informations de ton compte.
        </p>
      </header>
      <ProfileForm user={user} />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/profil/ src/components/dashboard/profil/
git commit -m "feat: add /dashboard/profil page with name edit"
```

---

### Task 13: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all tests pass (73 existing + new popularity/recompute/me tests ≈ 85+).

- [ ] **Step 2: Run production build**

```bash
pnpm build
```

Expected: build succeeds, `/dashboard`, `/dashboard/propositions`, `/dashboard/profil` appear as dynamic routes.

- [ ] **Step 3: Visual check (dev mode)**

```bash
pnpm dev
```

Navigate to `/dashboard` while logged in:
- Sidebar shows "Mon espace" group with 3 items
- USER role: no Modération or Administration groups
- Overview displays 3 stat cards + recent propositions list
- `/dashboard/propositions` shows the table
- `/dashboard/profil` shows the form with editable name

- [ ] **Step 4: Cleanup commit if needed**

```bash
git status
```

Commit nothing if clean.
