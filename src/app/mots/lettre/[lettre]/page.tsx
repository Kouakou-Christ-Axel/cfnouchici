import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { words } from "@/config/words";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Heart, Quote } from "lucide-react";
import { categoryColor } from "@/lib/category";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const revalidate = 3600;

export function generateStaticParams() {
	const letters = [...new Set(words.map((w) => w.label[0].toLowerCase()))];
	return letters.map((lettre) => ({ lettre }));
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

	const filtered = words
		.filter((w) => w.label[0].toUpperCase() === letter)
		.sort((a, b) => a.label.localeCompare(b.label, "fr"));

	if (filtered.length === 0) notFound();

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
						{filtered.length} mot{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
					</p>
				</div>
			</header>

			<Separator />

			{/* Grille complète */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{filtered.map((word) => (
					<Link key={word.slug} href={`/mots/${word.slug}`} className="group">
						<Card className="h-full gap-0 py-0 hover:border-foreground/30 hover:shadow-sm transition-all duration-200">
							<div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
								<div className="space-y-1 min-w-0">
									<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor(word.category)}`}>
										{word.category}
									</span>
									<h2 className="text-xl font-semibold tracking-tight uppercase group-hover:underline underline-offset-4 truncate">
										{word.label}
									</h2>
								</div>
								<ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
							</div>

							<Separator />

							<div className="px-5 py-3 flex-1">
								<p className="text-sm text-muted-foreground line-clamp-2">{word.definition}</p>
							</div>

							<div className="px-5 pb-4 flex items-start gap-2">
								<Quote className="size-3 text-muted-foreground/50 shrink-0 mt-1" />
								<p className="text-xs text-muted-foreground/70 italic line-clamp-1">{word.example}</p>
							</div>

							<Separator />

							<div className="flex items-center justify-between px-5 py-3">
								<span className="text-xs text-muted-foreground">
									par <span className="font-medium text-foreground">{word.author}</span>
								</span>
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<Heart className="size-3" />
									{word.likes}
								</span>
							</div>
						</Card>
					</Link>
				))}
			</div>

			{/* Navigation entre lettres */}
			<Separator />
			<div className="flex items-center justify-between gap-4">
				<p className="text-xs text-muted-foreground">
					Tu cherches une autre lettre ?
				</p>
				<Button variant="outline" size="sm" asChild>
					<Link href="/mots">Voir toutes les lettres</Link>
				</Button>
			</div>

			<ScrollToTop />
		</div>
	);
}

