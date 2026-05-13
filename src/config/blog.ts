export type Post = {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	date: string;
	readTime: number;
	author: {
		name: string;
		avatar: string;
	};
	cover: string;
	featured?: boolean;
	body: string;
};

export const posts: Post[] = [
	{
		slug: "origine-mot-gballou",
		title: "L'origine du mot « Gballou » : entre rue et culture",
		excerpt:
			"Plongée dans l'histoire d'un mot emblématique du nouchi qui désigne bien plus qu'un simple repas de rue.",
		category: "Étymologie",
		date: "2026-02-20",
		readTime: 5,
		author: { name: "Konan Djè", avatar: "https://avatar.vercel.sh/konan" },
		cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
		featured: true,
		body: `Le mot **"gballou"** est l'un de ces termes qui résument à eux seuls toute une philosophie de rue. À Abidjan, il désigne un repas populaire vendu au bord des routes, souvent composé de riz, d'attiéké ou de foutou accompagné d'une sauce locale.

## Une étymologie populaire

L'origine exacte reste débattue. Certains linguistes rattachent le mot au dioula, langue véhiculaire du nord de la Côte d'Ivoire, où "gba" évoque l'idée de quelque chose de grand, d'abondant. D'autres y voient une onomatopée issue du bruit que fait la louche dans la marmite.

## Un symbole au-delà du repas

Ce qui est certain, c'est que le gballou est bien plus qu'un plat. C'est un rituel social : on mange ensemble, debout ou assis sur des bancs de fortune, on parle, on rit. Les vendeurs de gballou — souvent des femmes entrepreneurs — sont des figures incontournables du paysage urbain abidjanais.

> "Quand tu manges gballou, tu manges avec tout le quartier." — Proverbe de rue abidjanais

## Dans le nouchi moderne

Le terme s'est progressivement enrichi de sens figurés. Dire d'une situation qu'elle est "comme le gballou" signifie qu'elle est accessible à tous, sans discrimination de classe. Une démocratisation du sens qui reflète les valeurs d'inclusion portées par le nouchi.`,
	},
	{
		slug: "dico-nouchi-histoire",
		title: "Comment le nouchi est devenu une langue à part entière",
		excerpt:
			"Du quartier Adjamé aux réseaux sociaux, retrace l'évolution du nouchi et son ancrage dans la culture ivoirienne moderne.",
		category: "Culture",
		date: "2026-02-14",
		readTime: 7,
		author: { name: "Aminata Koné", avatar: "https://avatar.vercel.sh/aminata" },
		cover: "https://images.unsplash.com/photo-1482859454392-1b5326395032?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80",
		body: `Le nouchi n'est pas né dans une salle de classe ni sous la plume d'un académicien. Il a grandi dans les rues d'Adjamé, de Yopougon, de Koumassi — les quartiers populaires d'Abidjan — au contact d'une jeunesse métissée linguistiquement.

## Les années 80 : l'émergence

C'est dans les années 1980 que le terme "nouchi" commence à circuler. Étymologiquement, il viendrait d'un mot dioula signifiant "jeune délinquant" ou "petit voyou". Mais très vite, la jeunesse s'en empare comme d'un signe d'identité, loin de toute connotation péjorative.

## Un mélange de langues

Le nouchi puise dans un réservoir linguistique exceptionnel : le français, le dioula, le baoulé, le bété, l'anglais, le verlan... C'est un créole urbain vivant, en perpétuelle mutation.

## L'ère des réseaux sociaux

Avec l'arrivée des smartphones et des réseaux sociaux, le nouchi a franchi les frontières d'Abidjan. Twitter, Instagram, TikTok sont devenus des espaces de création lexicale. Un nouveau mot peut s'imposer en quelques heures.`,
	},
	{
		slug: "top-expressions-2025",
		title: "Top 10 des expressions nouchi qui ont marqué 2025",
		excerpt:
			"De « c'est choco » à « tu es gbê », découvre les expressions qui ont envahi nos conversations cette année.",
		category: "Tendances",
		date: "2026-01-31",
		readTime: 4,
		author: { name: "Yves Brou", avatar: "https://avatar.vercel.sh/yves" },
		cover: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
		body: `2025 a été une année riche en inventions linguistiques. Voici les 10 expressions qui ont le plus marqué nos conversations.

## 1. "C'est choco"
Signifie que quelque chose est parfait, impeccable. Vient du chocolat, symbole de douceur et de qualité.

## 2. "Tu es gbê"
Gbê en dioula signifie "propre", "net". Par extension : quelqu'un de bien habillé, de stylé.

## 3. "On est ensemble"
Expression de solidarité et de complicité. Répond à la question "ça va ?" de manière affirmative et chaleureuse.

## 4. "C'est djamal"
Quelque chose de beau, d'élégant. Emprunté à l'arabe via les communautés musulmanes du nord.

## 5. "Gbonhi direct"
Aller droit au but, sans détour. S'utilise pour demander à quelqu'un d'arrêter de tourner autour du pot.

> Ces expressions ne sont pas que des mots : elles sont le reflet d'une culture en mouvement, d'une jeunesse qui s'invente un langage propre.`,
	},
	{
		slug: "nouchi-musique-zouglou",
		title: "Le nouchi dans la musique : du zouglou au coupé-décalé",
		excerpt:
			"Analyse du rôle central du nouchi dans les paroles des artistes ivoiriens, de Douk Saga à Suspect 95.",
		category: "Musique",
		date: "2026-01-18",
		readTime: 6,
		author: { name: "Fatou Diallo", avatar: "https://avatar.vercel.sh/fatou" },
		cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
		body: `La musique ivoirienne et le nouchi entretiennent une relation symbiotique. L'un ne va pas sans l'autre. Des premières chansons [[zouglou]] aux tubes coupé-décalé, la langue de la rue a toujours été au cœur des paroles.

## Le zouglou, berceau du nouchi musical

Né dans les campus universitaires d'Abidjan à la fin des années 80, le zouglou est la première musique à avoir systématiquement intégré le nouchi dans ses textes. Des groupes comme Magic System ont porté cette langue au niveau international.

## Douk Saga et la révolution coupé-décalé

Au début des années 2000, Douk Saga invente le coupé-décalé depuis Paris. Ce mouvement musical et vestimentaire remet le nouchi au centre. Les "travaillos" et autres "billet de banque" entrent dans le vocabulaire mondial de la diaspora.

## Suspect 95 et la génération TikTok

Aujourd'hui, des artistes comme Suspect 95 portent le nouchi sur les plateformes de streaming. Leurs clips cumulent des dizaines de millions de vues, exportant la langue ivoirienne bien au-delà du continent africain.`,
	},
	{
		slug: "contribuer-dictionnaire",
		title: "Comment contribuer au dictionnaire et faire vivre notre langue",
		excerpt:
			"Guide pratique pour ajouter un mot, valider une définition et participer à la communauté nouchi.ci.",
		category: "Guide",
		date: "2026-01-05",
		readTime: 3,
		author: { name: "Konan Djè", avatar: "https://avatar.vercel.sh/konan" },
		cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
		body: `nouchi.ci est un projet communautaire. Chaque mot ajouté, chaque définition validée, chaque exemple proposé enrichit notre patrimoine linguistique commun. Voici comment participer.

## Étape 1 : Créer un compte

Rends-toi sur la page d'inscription et crée ton profil. Un simple email suffit. Ton profil te permettra de soumettre des mots et de voter sur les définitions existantes.

## Étape 2 : Soumettre un mot

Dans le formulaire de soumission, indique :
- Le mot ou l'expression
- Sa catégorie grammaticale (nom, verbe, adjectif, interjection...)
- Une définition claire et concise
- Un ou plusieurs exemples d'utilisation dans une phrase

## Étape 3 : La validation communautaire

Chaque soumission est soumise au vote de la communauté. Si elle obtient suffisamment d'approbations, elle intègre le dictionnaire officiel. En cas de désaccord, une discussion peut s'ouvrir.

> La langue appartient à ceux qui la parlent. Chaque contribution compte.`,
	},
	{
		slug: "nouchi-diaspora",
		title: "Le nouchi dans la diaspora : une identité qui voyage",
		excerpt:
			"Depuis Paris, Montréal ou New York, les Ivoiriens de la diaspora gardent le nouchi vivant et le font évoluer.",
		category: "Diaspora",
		date: "2025-12-22",
		readTime: 5,
		author: { name: "Aminata Koné", avatar: "https://avatar.vercel.sh/aminata" },
		cover: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
		body: `Partir loin d'Abidjan ne signifie pas quitter le nouchi. Pour des milliers d'Ivoiriens de la diaspora, cette langue est un lien invisible mais puissant avec la terre natale.

## Paris, capitale mondiale du coupé-décalé

Dans le 18ème arrondissement de Paris, dans les cafés du quartier de la Goutte d'Or, le nouchi résonne. Les Ivoiriens de France l'ont non seulement conservé mais enrichi, en y mêlant du verlan et des expressions françaises déformées.

## Montréal : un nouchi québécois

Au Québec, communauté ivoirienne en pleine expansion, le nouchi a absorbé des tournures québécoises. "Ostie c'est gbê" ou "câlisse, on est ensemble" sont des exemples de ce métissage savoureux.

## New York et la diaspora anglophone

Aux États-Unis, c'est avec l'anglais que le nouchi se mélange. Des mots comme "tchrep" (de "cheap", mauvais marché) ou "baller" intégrés avec une phonétique ivoirienne créent une variante américaine unique.

## Internet, terrain de jeu commun

Au-delà des frontières géographiques, c'est sur internet que la diaspora fait vivre le nouchi. Les groupes Facebook, les tweets, les vidéos TikTok créent une communauté virtuelle où la langue évolue en temps réel.`,
	},
];

