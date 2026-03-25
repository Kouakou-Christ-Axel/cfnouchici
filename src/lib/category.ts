export const CATEGORY_COLORS: Record<string, string> = {
	"Verbe":      "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
	"Nom":        "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
	"Nom propre": "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
	"Adjectif":   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function categoryColor(cat: string) {
	return CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground";
}

