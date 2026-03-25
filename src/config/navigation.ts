export const navLinks: NavLink[] = [
	{
		title: 'Accueil',
		href: '/',
	},
	{
		title: 'Explorer',
		href: '/mots',
	},
	{
		title: 'Blog',
		href: '/blog',
	},
	{
		title: 'A Propos',
		href: '/a-propos',
	}
]

export type NavLink = {
	title: string;
	href: string;
}

export const popularWords: PopularWord[] = [
	{
		label: "goumin",
		href: "/mots/goumin",
		definition: "Se battre, se quereller avec quelqu'un.",
		category: "Verbe",
		likes: 248,
	},
	{
		label: "choco",
		href: "/mots/choco",
		definition: "Ami proche, frère de galère.",
		category: "Nom",
		likes: 192,
	},
	{
		label: "boucantier",
		href: "/mots/boucantier",
		definition: "Personne qui fait beaucoup de bruit, qui perturbe.",
		category: "Nom",
		likes: 174,
	},
	{
		label: "binguiste",
		href: "/mots/binguiste",
		definition: "Conducteur de moto-taxi (binging).",
		category: "Nom",
		likes: 156,
	},
	{
		label: "babi",
		href: "/mots/babi",
		definition: "Abréviation affectueuse d'Abidjan.",
		category: "Nom propre",
		likes: 312,
	},
	{
		label: "gouro",
		href: "/mots/gouro",
		definition: "Argent, monnaie.",
		category: "Nom",
		likes: 201,
	},
]

export type PopularWord = {
	label: string;
	href: string;
	definition?: string;
	category?: string;
	likes?: number;
}

export const recentWords: RecentWord[] = [
	{
		label: "dja",
		href: "/mots/dja",
		definition: "Partir, s'en aller rapidement.",
		category: "Verbe",
		addedAt: "Il y a 2h",
		author: "KouaKouamé",
	},
	{
		label: "zouglou",
		href: "/mots/zouglou",
		definition: "Genre musical ivoirien né dans les cités universitaires.",
		category: "Nom",
		addedAt: "Il y a 5h",
		author: "AbidjanCity",
	},
	{
		label: "tchatcher",
		href: "/mots/tchatcher",
		definition: "Parler avec aisance pour convaincre ou séduire.",
		category: "Verbe",
		addedAt: "Il y a 1j",
		author: "NoFace225",
	},
	{
		label: "garba",
		href: "/mots/garba",
		definition: "Plat populaire à base d'attiéké et de thon frit.",
		category: "Nom",
		addedAt: "Il y a 1j",
		author: "YopCity",
	},
	{
		label: "foutou",
		href: "/mots/foutou",
		definition: "Plat traditionnel à base d'igname ou banane pilée.",
		category: "Nom",
		addedAt: "Il y a 2j",
		author: "Cocody225",
	},
	{
		label: "wari",
		href: "/mots/wari",
		definition: "Jeu de stratégie africain très populaire en Côte d'Ivoire.",
		category: "Nom",
		addedAt: "Il y a 3j",
		author: "GrandBassam",
	},
]

export type RecentWord = {
	label: string;
	href: string;
	definition?: string;
	category?: string;
	addedAt: string;
	author: string;
}
