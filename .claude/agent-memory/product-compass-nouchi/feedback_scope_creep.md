---
name: Patterns de scope creep nouchi.ci
description: Dérives récurrentes observées sur le projet à surveiller lors des prochains audits
type: feedback
---

**Pattern observé au 2026-04-17 :**

1. **Activation prématurée de la gamification** — VoteSection rendue publique avant que le seed éditorial existe. Résultat : compteurs à 0 visibles publiquement sur chaque fiche.

   **Why:** La mécanique de vote est excitante à coder et visible immédiatement. Mais sans masse critique, c'est un signal de mort sociale pour le produit.

   **How to apply:** À chaque feature communautaire, poser la question : "Est-ce que ça paraît crédible avec 0 utilisateurs ?". Si non, l'implémenter mais la masquer jusqu'au seuil.

2. **Dashboard complet avant contenu** — 8+ pages dashboard livrées (modération, stats, logs, users, propositions, profil) alors que la base de données n'a aucun mot validé.

   **Why:** Le dashboard est un travail d'ingénierie satisfaisant. Mais sans contenu, il n'a rien à modérer.

   **How to apply:** Rappeler qu'un outil de modération sans contenu à modérer est une dette d'UI, pas une avance.

3. **Metadata mensongère** — Homepage affiche "+400 mots documentés" dans la description metadata alors que la base est vide.

   **Why:** Probablement copié d'une version antérieure ou projection optimiste. Mais c'est un mensonge indexé par Google.

   **How to apply:** Toujours vérifier la cohérence metadata/réalité avant chaque commit sur les pages publiques.
