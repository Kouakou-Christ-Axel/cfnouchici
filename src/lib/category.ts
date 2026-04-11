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
