---
name: Architecture UI nouchi.ci — état connu
description: Composants, routes et décisions techniques pertinentes pour l'audit UX
type: project
---

# Architecture UI — état au 18 avril 2026

## Routes publiques auditées
- `/` — HeroSection (force-dynamic) + PopularWordsSection + RecentWordsSection
- `/mots` — liste alphabétique avec WordGroup, force-dynamic
- `/mots/[slug]` — fiche mot ISR 3600, VoteSection client, ShareButton ABSENT de la page
- `/mots/lettre/[lettre]` — ISR 3600, grille de cards
- `/blog` — PostList (données statiques src/config/blog.ts)
- `/blog/[slug]` — ISR 3600, renderBody maison (pas de MDX)
- `/proposer` — protégé par getSessionOrRedirect, ProposerForm avec preview live
- `/connexion` — Google SSO uniquement (Better Auth)
- `/a-propos` — page statique, contenu éditorial correct

## Composants clés
- `ShareButton` : src/components/share/share-button.tsx — DropdownMenu avec native/WhatsApp/X/copy
- `VoteSection` : src/components/public/mots/vote-section.tsx — 2 questions (connaissance + exactitude), auth-gated
- `WordInteractions` : src/components/public/mots/word-interactions.tsx — MORT, non utilisé dans les pages
- `HeroSearch` : bouton qui ouvre SearchModal (fumadocs-ui SearchDialog)
- `useSearch` : debounce 250ms, API /api/search?q=, abort controller

## Décisions techniques pertinentes pour UX
- Homepage est `force-dynamic` — pas de cache statique, chaque visite frappe la DB
- Les données blog viennent de src/config/blog.ts (statique), pas de DB
- opengraph-image.tsx existe pour /mots/[slug] mais PAS pour /blog/[slug]
- OG image fond noir, police system-font, branding minimaliste (pas de couleur ivoirienne)
- share.ts injecte ?vote=1 dans les URLs partagées — paramètre non géré côté page

**Why:** Contexte technique nécessaire pour évaluer la faisabilité des recommandations UX.
**How to apply:** Vérifier que les composants existent toujours avant de faire des recommandations sur leur usage.
