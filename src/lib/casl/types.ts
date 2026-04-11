export type Actions = "read" | "create" | "update" | "delete" | "moderate" | "manage";
export type Subjects = "Mot" | "all";

export type UserForAbilities = {
  id: string;
  role: "USER" | "MODERATEUR" | "ADMIN";
} | null;

export type SubjectConditions = Record<string, unknown>;

export interface AppAbility {
  can(action: Actions, subject: Subjects, conditions?: SubjectConditions): boolean;
  cannot(action: Actions, subject: Subjects, conditions?: SubjectConditions): boolean;
}
