import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listMotsValidesByLettre, listAllMotsValides } from "@/lib/queries/mots";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { categoryColor, categoryLabel } from "@/lib/category";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const revalidate = 3600;

export async function generateStaticParams() {
	try {
		const mots = await listAllMotsValides();
		const letters = [...new Set(mots.map((m) => m.mot[0].toLowerCase()))];
		return letters.map((lettre) => ({ lettre }));
	} catch {
		return [];
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lettre: string }>;
}): Promise<Metadata> {
	const { lettre } = await params;
	const letter = lettre.toUpperCase();
	return {
		title: `Mots en « ${letter} » — Nouchici`,
		description: `Tous les mots nouchi commençant par la lettre ${letter}.`,
	};
}

export default async function LettreListPage({
	params,
}: {
	params: Promise<{ lettre: string }>;
}) {
	const { lettre } = await params;
	const letter = lettre.toUpperCase();

	const mots = await listMotsValidesByLettre(letter);

	const allMots = await listAllMotsValides();
	const availableLetters = [...new Set(allMots.map((m) => m.mot[0].toUpperCase()))].sort();
	const currentIndex = availableLetters.indexOf(letter);
	const prevLetter = currentIndex > 0 ? availableLetters[currentIndex - 1] : null;
	const nextLetter = currentIndex < availableLetters.length - 1 ? availableLetters[currentIndex + 1] : null;

	if (mots.length === 0) notFound();

	return (
		<div className="content-container py-12 space-y-10">

			{/* ← Retour */}
			<Link
				href="/mots"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeft className="size-3.5" />
				Retour au dictionnaire
			</Link>

			{/* Header */}
			<header className="flex items-end justify-between gap-6">
				<div className="space-y-2">
					<Badge variant="secondary" className="text-sm px-4 py-1 w-fit">
						Lettre {letter}
					</Badge>
					<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
						<span className="text-muted-foreground">Mots en</span> «&nbsp;{letter}&nbsp;»
					</h1>
					<p className="text-sm text-muted-foreground">
						{mots.length} mot{mots.length > 1 ? "s" : ""} trouvé{mots.length > 1 ? "s" : ""}
					</p>
				</div>
			</header>

			<Separator />

			{/* Grille complète */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{mots.map((mot) => (
					<Link key={mot.slug} href={`/mots/${mot.slug}`} className="group">
						<Card className="h-full gap-0 py-0 hover:border-foreground/30 hover:shadow-sm transition-all duration-200">
							<div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
								<div className="space-y-1 min-w-0">
									<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor(mot.categorie)}`}>
										{categoryLabel(mot.categorie)}
									</span>
									<h2 className="text-xl font-semibold tracking-tight uppercase group-hover:underline underline-offset-4 truncate">
										{mot.mot}
									</h2>
								</div>
								<ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
							</div>

							<Separator />

							<div className="px-5 py-3 flex-1">
								<p className="text-sm text-muted-foreground line-clamp-2">{mot.definition}</p>
							</div>

							<div className="px-5 pb-4 flex items-start gap-2">
								<Quote className="size-3 text-muted-foreground/50 shrink-0 mt-1" />
								<p className="text-xs text-muted-foreground/70 italic line-clamp-1">{mot.exemples[0]?.phrase}</p>
							</div>

							<Separator />

							<div className="flex items-center justify-between px-5 py-3">
								<span className="text-xs text-muted-foreground">
									par <span className="font-medium text-foreground">{mot.soumisPar?.name ?? "—"}</span>
								</span>
							</div>
						</Card>
					</Link>
				))}
			</div>

			{/* Navigation entre lettres */}
			<Separator />
			<div className="flex items-center justify-between gap-4">
				<div>
					{prevLetter ? (
						<Button variant="outline" size="sm" asChild>
							<Link href={`/mots/lettre/${prevLetter.toLowerCase()}`}>
								<ArrowLeft className="size-3.5 mr-1" />
								Lettre {prevLetter}
							</Link>
						</Button>
					) : (
						<div />
					)}
				</div>
				<Button variant="ghost" size="sm" asChild>
					<Link href="/mots">Toutes les lettres</Link>
				</Button>
				<div>
					{nextLetter ? (
						<Button variant="outline" size="sm" asChild>
							<Link href={`/mots/lettre/${nextLetter.toLowerCase()}`}>
								Lettre {nextLetter}
								<ArrowRight className="size-3.5 ml-1" />
							</Link>
						</Button>
					) : (
						<div />
					)}
				</div>
			</div>

			<ScrollToTop />
		</div>
	);
}
