import React from 'react';
import Link from "next/link";
import type {Metadata} from "next";
import {words} from "@/config/words";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {BookOpen, Plus} from "lucide-react";
import {WordGroup} from "@/components/public/mots/word-group";
import {ScrollToTop} from "@/components/ui/scroll-to-top";

export const metadata: Metadata = {
	title: "Tous les mots — Nouchici",
	description: "Explore le dictionnaire complet du nouchi ivoirien.",
};

export default function MotsListPage() {
	const sorted = [...words].sort((a, b) => a.label.localeCompare(b.label, "fr"));

	const grouped = sorted.reduce<Record<string, typeof words>>((acc, word) => {
		const letter = word.label[0].toUpperCase();
		if (!acc[letter]) acc[letter] = [];
		acc[letter].push(word);
		return acc;
	}, {});

	const letters = Object.keys(grouped).sort();
	const totalLikes = words.reduce((s, w) => s + w.likes, 0);

	return (
		<>
			<div className="content-container py-12 space-y-12">
				{/* ── Header ─────────────────────────────────────── */}
				<header className="space-y-6">
					<Badge variant="secondary" className="text-sm px-4 py-1 flex items-center gap-1.5 w-fit">
						<BookOpen className="size-3.5"/>
						Dictionnaire
					</Badge>

					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
						<div className="space-y-2">
							<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
								Tous les mots
								<br/>
								<span className="text-muted-foreground">du nouchi</span>
							</h1>
							<p className="text-base text-muted-foreground max-w-lg">
								{words.length} mots documentés par la communauté ivoirienne.
							</p>
						</div>
						<Button asChild className="gap-2 shrink-0">
							<Link href="/proposer">
								<Plus className="size-4"/>
								Proposer un mot
							</Link>
						</Button>
					</div>

					{/* Stats bar */}
					<div className="grid grid-cols-3 gap-4">
						{[
							{label: "Mots", value: words.length},
							{label: "Catégories", value: new Set(words.map((w) => w.category)).size},
							{label: "J'aime au total", value: totalLikes.toLocaleString("fr-FR")},
						].map(({label, value}) => (
							<Card key={label} className="py-4">
								<CardContent className="flex flex-col items-center text-center px-4 py-0 gap-0.5">
									<span className="text-2xl font-semibold tracking-tight">{value}</span>
									<span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
								</CardContent>
							</Card>
						))}
					</div>
				</header>

				<Separator/>

				{/* ── Index alphabétique ─────────────────────────── */}
				<nav className="flex flex-wrap gap-2" aria-label="Index alphabétique">
					{letters.map((letter) => (
						<a
							key={letter}
							href={`#letter-${letter}`}
							className="size-8 flex items-center justify-center rounded-md text-sm font-medium border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
						>
							{letter}
						</a>
					))}
				</nav>

				<Separator/>

				{/* ── Groupes avec pagination ────────────────────── */}
				<div className="space-y-14">
					{letters.map((letter) => (
						<WordGroup key={letter} letter={letter} words={grouped[letter]}/>
					))}
				</div>

				{/* ── CTA bas de page ────────────────────────────── */}
				<Separator/>
				<div className="flex flex-col items-center gap-4 text-center py-6">
					<p className="text-muted-foreground text-sm max-w-md">
						Tu connais un mot qui manque ? La communauté t'attend pour l'ajouter au dictionnaire.
					</p>
					<Button asChild size="lg" className="gap-2">
						<Link href="/proposer">
							<Plus className="size-4"/>
							Proposer un mot
						</Link>
					</Button>
				</div>
			</div>
			<ScrollToTop/>
		</>
	);
}
