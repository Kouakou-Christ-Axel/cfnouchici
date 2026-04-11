import type { Actions, Subjects, AppAbility, UserForAbilities, SubjectConditions } from "./types";

type Rule = {
  action: Actions | "manage";
  subject: Subjects | "all";
  conditions?: SubjectConditions;
  inverted?: boolean;
};

class SimpleAbility implements AppAbility {
  private rules: Rule[];

  constructor(rules: Rule[]) {
    this.rules = rules;
  }

  can(action: Actions, subject: Subjects, conditions?: SubjectConditions): boolean {
    const matchingRules = this.rules.filter((rule) => {
      const actionMatches = rule.action === action || rule.action === "manage";
      const subjectMatches = rule.subject === subject || rule.subject === "all";
      return actionMatches && subjectMatches && !rule.inverted;
    });

    if (matchingRules.length === 0) return false;

    if (!conditions) {
      return matchingRules.some((rule) => !rule.conditions);
    }

    return matchingRules.some((rule) => {
      if (!rule.conditions) return true;
      return Object.entries(rule.conditions).every(
        ([key, value]) => conditions[key] === value
      );
    });
  }

  cannot(action: Actions, subject: Subjects, conditions?: SubjectConditions): boolean {
    return !this.can(action, subject, conditions);
  }
}

export function defineAbilitiesFor(user: UserForAbilities): AppAbility {
  const rules: Rule[] = [];

  // Everyone can read VALIDE words
  rules.push({ action: "read", subject: "Mot", conditions: { statut: "VALIDE" } });

  if (!user) return new SimpleAbility(rules);

  // All authenticated users can create
  rules.push({ action: "create", subject: "Mot" });

  if (user.role === "USER") {
    rules.push({
      action: "read",
      subject: "Mot",
      conditions: { soumisParId: user.id, statut: "EN_ATTENTE" },
    });
    rules.push({
      action: "update",
      subject: "Mot",
      conditions: { soumisParId: user.id, statut: "EN_ATTENTE" },
    });
  }

  if (user.role === "MODERATEUR") {
    rules.push({ action: "read", subject: "Mot" });
    rules.push({ action: "moderate", subject: "Mot" });
  }

  if (user.role === "ADMIN") {
    rules.push({ action: "manage", subject: "all" });
  }

  return new SimpleAbility(rules);
}
