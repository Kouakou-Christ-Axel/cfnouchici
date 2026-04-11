export const CATEGORY_COLORS: Record<string, string> = {
	VERBE:      "bg-red-100 text-red-600",
	NOM:        "bg-blue-100 text-blue-600",
	ADJECTIF:   "bg-purple-100 text-purple-600",
	EXPRESSION: "bg-emerald-100 text-emerald-600",
	ADVERBE:    "bg-amber-100 text-amber-600",
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
