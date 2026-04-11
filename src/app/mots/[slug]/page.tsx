import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMotBySlug, listAllMotsValides } from "@/lib/queries/mots";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Quote, User, CalendarDays } from "lucide-react";
import { categoryColor, categoryLabel } from "@/lib/category";
import { WordInteractions } from "@/components/public/mots/word-interactions";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { db } from "@/lib/db";

/* ─── ISR ─────────────────────────────────────────────── */
export const revalidate = 3600;

export async function generateStaticParams() {
	try {
		const mots = await listAllMotsValides();
		return mots.map((m) => ({ slug: m.slug }));
	} catch {
		return [];
	}
}

/* ─── Metadata ────────────────────────────────────────── */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const mot = await getMotBySlug(slug);
	if (!mot) return {};
	return {
		title: `${mot.mot} — Nouchici`,
		description: mot.definition,
	};
}

/* ─── Page ────────────────────────────────────────────── */
export default async function MotDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const mot = await getMotBySlug(slug);
	if (!mot || mot.statut !== "VALIDE") notFound();

	const letter = mot.mot[0].toUpperCase();
	const related = await db.mot.findMany({
		where: {
			statut: "VALIDE",
			categorie: mot.categorie ?? undefined,
			slug: { not: slug },
		},
		take: 3,
	});

	const formattedDate = format(mot.createdAt, "d MMMM yyyy", { locale: fr });

	return (
		<div className="content-container py-12 space-y-10">

			{/* ← Retour */}
			<div className="flex items-center gap-3">
				<Link
					href="/mots"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="size-3.5" />
					Dictionnaire
				</Link>
				<span className="text-muted-foreground/40 text-sm">/</span>
				<Link
					href={`/mots/lettre/${letter.toLowerCase()}`}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Lettre {letter}
				</Link>
			</div>

			{/* ── Contenu principal + sidebar ─────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

				{/* Colonne principale */}
				<div className="lg:col-span-2 space-y-8">

					{/* Mot + catégorie */}
					<header className="space-y-4">
						<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${categoryColor(mot.categorie)}`}>
							{categoryLabel(mot.categorie)}
						</span>
						<h1 className="text-5xl sm:text-6xl font-semibold tracking-tight uppercase leading-none">
							{mot.mot}
						</h1>
					</header>

					<Separator />

					{/* Définition */}
					<div className="space-y-2">
						<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
							Définition
						</span>
						<p className="text-lg leading-relaxed">{mot.definition}</p>
					</div>

					{/* Exemple */}
					{mot.exemples.length > 0 && (
						<div className="space-y-2">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
								Exemple
							</span>
							<blockquote className="flex items-start gap-3 border-l-2 border-foreground/20 pl-4">
								<Quote className="size-4 text-muted-foreground/40 shrink-0 mt-1" />
								<p className="italic text-muted-foreground">{mot.exemples[0].phrase}</p>
							</blockquote>
						</div>
					)}

					<Separator />

					{/* Interactions : vote + commentaires */}
					<WordInteractions initialLikes={0} />
				</div>

				{/* Sidebar */}
				<aside className="space-y-6">

					{/* Infos */}
					<Card className="gap-0 py-0">
						<div className="px-5 pt-4 pb-3">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
								Informations
							</span>
						</div>
						<Separator />
						<CardContent className="px-5 py-4 space-y-4">
							<div className="flex items-center gap-3">
								<User className="size-4 text-muted-foreground shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Ajouté par</p>
									<p className="text-sm font-medium">{mot.soumisPar?.name ?? "—"}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<CalendarDays className="size-4 text-muted-foreground shrink-0" />
								<div>
									<p className="text-xs text-muted-foreground">Date d'ajout</p>
									<p className="text-sm font-medium">{formattedDate}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Badge variant="secondary" className="text-xs">
									{categoryLabel(mot.categorie)}
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Mots similaires */}
					{related.length > 0 && (
						<div className="space-y-3">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block">
								Même catégorie
							</span>
							<div className="space-y-2">
								{related.map((w) => (
									<Link
										key={w.slug}
										href={`/mots/${w.slug}`}
										className="flex items-center justify-between group rounded-lg border border-border px-4 py-3 hover:border-foreground/30 hover:bg-muted/50 transition-all duration-200"
									>
										<div className="min-w-0">
											<p className="text-sm font-semibold uppercase truncate group-hover:underline underline-offset-4">
												{w.mot}
											</p>
											<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
												{w.definition}
											</p>
										</div>
										<ArrowLeft className="size-3.5 rotate-180 text-muted-foreground shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
									</Link>
								))}
							</div>
						</div>
					)}
				</aside>
			</div>

			<ScrollToTop />
		</div>
	);
}
