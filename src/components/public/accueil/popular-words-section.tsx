import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { getPopularMots } from '@/lib/queries/mots';
import { categoryLabel } from '@/lib/category';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function PopularWordsSection() {
	const mots = await getPopularMots();

	return (
		<section className="py-20">
			<div className="content-container">
				{/* Header */}
				<div className="flex flex-col items-center text-center mb-14 space-y-4">
					<Badge variant="secondary" className="text-sm px-4 py-1 flex items-center gap-1.5">
						<TrendingUp className="size-3.5" />
						Tendances du moment
					</Badge>
					<h2 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
						Les mots du moment
					</h2>
					<p className="max-w-xl text-base text-muted-foreground">
						Découvre les expressions les plus recherchées et aimées par la communauté nouchi.
					</p>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{mots.map((mot, index) => (
						<Link
							key={mot.slug}
							href={`/mots/${mot.slug}`}
							className={cn(
								"group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6",
								"hover:border-foreground/30 hover:shadow-sm transition-all duration-200",
								index === 0 && "sm:col-span-2 lg:col-span-1"
							)}
						>
							{/* Top row */}
							<div className="flex items-start justify-between gap-4 mb-4">
								<div className="flex flex-col gap-1.5">
									<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
										{categoryLabel(mot.categorie)}
									</span>
									<h3 className="text-2xl font-semibold tracking-tight uppercase group-hover:underline underline-offset-4">
										{mot.mot}
									</h3>
								</div>
								<span className="shrink-0 text-xs font-mono text-muted-foreground bg-muted rounded-full px-2.5 py-1">
									#{index + 1}
								</span>
							</div>

							{/* Definition */}
							{mot.definition && (
								<p className="text-sm text-muted-foreground line-clamp-2 mb-6">
									{mot.definition}
								</p>
							)}

							{/* Footer */}
							<div className="flex items-center justify-end">
								<ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
							</div>
						</Link>
					))}
				</div>

				{/* CTA */}
				<div className="flex justify-center mt-12">
					<Button asChild variant="outline" size="lg" className="gap-2">
						<Link href="/mots">
							Voir tous les mots
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}

export default PopularWordsSection;
