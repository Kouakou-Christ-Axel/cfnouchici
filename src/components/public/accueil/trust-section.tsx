import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {BookOpen, Shield, Users} from 'lucide-react';

const items = [
	{
		icon: Users,
		title: 'Collaboratif',
		description:
			'La communauté propose. Une modération valide. On garde le nouchi propre et documenté.',
	},
	{
		icon: BookOpen,
		title: 'Pédagogique',
		description:
		`Définitions claires, exemples d'usage, catégories : utile pour élèves, profs, médias et curieux.`,
	},
	{
		icon: Shield,
		title: 'Souverain',
		description:
			'On écrit nos mots nous-mêmes : origine, sens, contexte. Personne ne parle à notre place.',
	},
];

function TrustSection() {
	return (
		<section className="py-16">
			<div className="content-container">
				<div className="grid gap-4 md:grid-cols-3">
					{items.map(({icon: Icon, title, description}) => (
						<Card key={title} className="rounded-2xl border-border bg-card">
							<CardHeader className="pb-2">
								<div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
									<Icon className="size-4 text-muted-foreground"/>
								</div>
								<CardTitle className="text-base font-semibold uppercase tracking-tight">
									{title}
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground leading-relaxed">
								{description}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

export default TrustSection;