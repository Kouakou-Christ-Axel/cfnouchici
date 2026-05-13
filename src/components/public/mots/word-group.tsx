import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Quote, ArrowUpRight } from "lucide-react";
import { categoryColor, categoryLabel } from "@/lib/category";
import type { Prisma } from "@/generated/prisma";

type MotWithIncludes = Prisma.MotGetPayload<{
	include: {
		sens: { include: { exemples: true } };
		soumisPar: { select: { id: true; name: true; image: true } };
	};
}>;

const PREVIEW_SIZE = 6;

interface WordGroupProps {
	letter: string;
	mots: MotWithIncludes[];
}

export function WordGroup({ letter, mots }: WordGroupProps) {
	const preview = mots.slice(0, PREVIEW_SIZE);
	const hasMore = mots.length > PREVIEW_SIZE;

	return (
		<section id={`letter-${letter}`} className="scroll-mt-24">
			{/* En-tête lettre */}
			<div className="flex items-center gap-4 mb-6">
				<span className="text-4xl font-semibold tracking-tight text-muted-foreground/30 select-none w-10 shrink-0">
					{letter}
				</span>
				<Separator className="flex-1" />
				<span className="text-xs text-muted-foreground font-mono">
					{mots.length} mot{mots.length > 1 ? "s" : ""}
				</span>
			</div>

			{/* Grille */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{preview.map((mot) => {
					const primarySens = mot.sens[0];
					return (
						<Link key={mot.slug} href={`/mots/${mot.slug}`} className="group">
							<Card className="h-full gap-0 py-0 hover:border-foreground/30 hover:shadow-sm transition-all duration-200">
								<div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
									<div className="space-y-1 min-w-0">
										<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor(primarySens?.categorie)}`}>
											{categoryLabel(primarySens?.categorie)}
										</span>
										<h2 className="text-xl font-semibold tracking-tight uppercase group-hover:underline underline-offset-4 truncate">
											{mot.mot}
										</h2>
									</div>
									<ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
								</div>

								<Separator />

								<div className="px-5 py-3 flex-1">
									<p className="text-sm text-muted-foreground line-clamp-2">{primarySens?.definition ?? ""}</p>
								</div>

								<div className="px-5 pb-4 flex items-start gap-2">
									<Quote className="size-3 text-muted-foreground/50 shrink-0 mt-1" />
									<p className="text-xs text-muted-foreground/70 italic line-clamp-1">{primarySens?.exemples?.[0]?.phrase}</p>
								</div>

								<Separator />

								<div className="flex items-center justify-between px-5 py-3">
									<span className="text-xs text-muted-foreground">
										par <span className="font-medium text-foreground">{mot.soumisPar?.name ?? "—"}</span>
									</span>
								</div>
							</Card>
						</Link>
					);
				})}
			</div>

			{/* Voir tous → nouvelle page */}
			{hasMore && (
				<div className="mt-6 flex items-center gap-4">
					<Separator className="flex-1" />
					<Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
						<Link href={`/mots/lettre/${letter.toLowerCase()}`}>
							<ArrowUpRight className="size-3.5" />
							Voir les {mots.length} mots en «&nbsp;{letter}&nbsp;»
						</Link>
					</Button>
					<Separator className="flex-1" />
				</div>
			)}
		</section>
	);
}
