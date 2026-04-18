---
name: État architecture nouchi.ci
description: Architecture technique et état réel du codebase au 2026-04-17
type: project
---

**Dernière vérification :** 2026-04-17

**Stack :** Next.js 16 App Router, Tailwind CSS 4 oklch, Prisma + PostgreSQL, Better Auth, Docker Dokploy VPS

**Routes publiques existantes :**
- / (homepage avec hero, popular words, recent words)
- /mots (listing alphabétique, force-dynamic)
- /mots/[slug] (fiche détail, ISR 3600s, VoteSection active)
- /mots/lettre/[lettre]
- /blog, /blog/[slug]
- /connexion
- /proposer (auth-gated)
- /a-propos — ABSENT dans le code, mais dans la nav (lien mort)

**Routes dashboard existantes :**
- /dashboard (overview stats)
- /dashboard/mots
- /dashboard/moderation
- /dashboard/moderation/[slug]
- /dashboard/propositions
- /dashboard/stats
- /dashboard/utilisateurs
- /dashboard/profil
- /dashboard/logs

**Données :**
- PLUS de src/config/words.ts — toutes les données viennent de Prisma/PostgreSQL
- src/config/blog.ts — 1 article statique (gballou)
- src/config/navigation.ts — liens nav (dont /a-propos cassé)
- src/config/hero.ts — contenu hero section

**Schéma Prisma (complet V1.5) :**
- User (rôles: USER/MODERATEUR/ADMIN, banned)
- Session, Account, Verification (auth)
- Mot (statut: EN_ATTENTE/VALIDE/REJETE, popularityScore, socialScore)
- Exemple (phrases d'exemple par mot)
- LogModeration
- VoteMot (connaissance + exactitude, unique par user/mot)

**API endpoints :**
- GET/POST /api/mots (list + create)
- GET/POST /api/mots/[slug]/vote
- /api/auth/* (Better Auth)
- /api/me/* (stats, propositions, profile)
- /api/admin/* (logs, mots, stats, users)

**Citabilité manquante :**
- Pas de Schema.org DefinedTerm sur /mots/[slug]
- Pas de OG image dynamique (route opengraph-image absente)
- Pas de bouton "Citer ce mot"
- Share URLs contiennent ?vote=1&utm_source=share — URL non canonique

**Gamification active trop tôt :**
- VoteSection visible sur toutes les fiches publiques
- Score de popularité calculé mais affiché dans le dashboard admin uniquement pour l'instant (OK)
