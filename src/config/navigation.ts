export const navLinks: NavLink[] = [
	{ title: 'Accueil', href: '/' },
	{ title: 'Explorer', href: '/mots' },
	{ title: 'Blog', href: '/blog' },
	{ title: 'À propos', href: '/a-propos' },
];

export type NavLink = {
	title: string;
	href: string;
};
