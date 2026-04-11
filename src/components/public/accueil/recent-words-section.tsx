import React from 'react';
import { ArrowRight, Clock, Plus } from 'lucide-react';
import { getRecentMots } from '@/lib/queries/mots';
import { categoryLabel } from '@/lib/category';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

async function RecentWordsSection() {
	const mots = await getRecentMots();

	return (
		<section className="py-16">
			<div className="content-container">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
					<div className="flex flex-col gap-3">
						<Badge variant="secondary" className="text-sm px-4 py-1 flex items-center gap-1.5 max-w-fit">
							<Clock className="size-3.5" />
							Ajouts récents
						</Badge>
						<h2 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
							Les derniers mots
							<br />
							<span className="text-[#71717a]">de la communauté</span>
						</h2>
					</div>
					<Button asChild variant="outline" className="gap-2 shrink-0">
						<Link href="/proposer">
							<Plus className="size-4" />
							Proposer un mot
						</Link>
					</Button>
				</div>

				{/* List */}
				<div className="flex flex-col">
					{mots.map((mot, index) => (
						<React.Fragment key={mot.slug}>
							{index > 0 && <Separator />}
							<Link
								href={`/mots/${mot.slug}`}
								className="group flex items-center justify-between gap-4 py-5 hover:bg-muted/40 -mx-4 px-4 rounded-lg transition-colors duration-150"
							>
								<div className="flex items-center gap-5 min-w-0">
									{/* Numéro */}
									<span className="shrink-0 text-xs font-mono text-muted-foreground w-5 text-right">
										{String(index + 1).padStart(2, '0')}
									</span>

									{/* Mot + définition */}
									<div className="flex flex-col gap-0.5 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-base font-semibold uppercase tracking-tight group-hover:underline underline-offset-4">
												{mot.mot}
											</span>
											{mot.categorie && (
												<span className="hidden sm:inline text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
													{categoryLabel(mot.categorie)}
												</span>
											)}
										</div>
										{mot.definition && (
											<span className="text-sm text-muted-foreground truncate">
												{mot.definition}
											</span>
										)}
									</div>
								</div>

								{/* Meta + arrow */}
								<div className="flex items-center gap-4 shrink-0">
									<div className="hidden md:flex flex-col items-end gap-0.5">
										<span className="text-xs text-muted-foreground">
											{formatDistanceToNow(mot.createdAt, { addSuffix: true, locale: fr })}
										</span>
										<span className="text-xs text-muted-foreground">par {mot.soumisPar?.name ?? "—"}</span>
									</div>
									<ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
								</div>
							</Link>
						</React.Fragment>
					))}
				</div>

				{/* CTA */}
				<div className="flex justify-center mt-10">
					<Button asChild variant="outline" size="lg" className="gap-2">
						<Link href="/mots?tri=recent">
							Voir tous les ajouts
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}

export default RecentWordsSection;
