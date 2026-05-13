import React from 'react';
import {notFound} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type {Metadata} from "next";
import {posts} from "@/config/blog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {ArrowLeft, CalendarDays, Clock} from "lucide-react";
import {format, parseISO} from "date-fns";
import {fr} from "date-fns/locale";
import PostCard from "@/components/public/blog/post-card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

/* ─── ISR ─────────────────────────────────────────────── */
export const revalidate = 3600; // re-génère toutes les heures

export function generateStaticParams() {
	return posts.map((post) => ({slug: post.slug}));
}

/* ─── Metadata ────────────────────────────────────────── */
export async function generateMetadata({
	                                       params,
                                       }: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const {slug} = await params;
	const post = posts.find((p) => p.slug === slug);
	if (!post) return {};
	return {
		title: `${post.title} | nouchi.ci`,
		description: post.excerpt,
		openGraph: {
			title: post.title,
			description: post.excerpt,
			images: [{url: post.cover}],
		},
	};
}

/* ─── Page ────────────────────────────────────────────── */
export default async function BlogDetailsPage({
	                                              params,
                                              }: {
	params: Promise<{ slug: string }>;
}) {
	const {slug} = await params;
	const post = posts.find((p) => p.slug === slug);
	if (!post) notFound();

	const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
	const formattedDate = format(parseISO(post.date), "d MMMM yyyy", {locale: fr});

	/* Convertit le "body" markdown-like en paragraphes/titres simples */
	const renderInline = (text: string): React.ReactNode => {
		const boldChunks = text.split(/(\*\*.*?\*\*)/g);
		return (
			<>
				{boldChunks.map((chunk, i) => {
					if (chunk.startsWith("**") && chunk.endsWith("**")) {
						return (
							<strong key={i} className="font-semibold text-foreground">
								{chunk.slice(2, -2)}
							</strong>
						);
					}
					const linkChunks = chunk.split(/\[\[([\w-]+)\]\]/g);
					return linkChunks.map((part, j) => {
						if (j % 2 === 1) {
							return (
								<Link
									key={`${i}-${j}`}
									href={`/mots/${part}`}
									className="font-medium underline underline-offset-2 decoration-muted-foreground hover:decoration-foreground transition-colors"
								>
									{part}
								</Link>
							);
						}
						return part;
					});
				})}
			</>
		);
	};

	const renderBody = (body: string) =>
		body.split("\n\n").map((block, i) => {
			if (block.startsWith("## ")) {
				return (
					<h2 key={i} className="text-xl sm:text-2xl font-semibold tracking-tight mt-10 mb-4">
						{block.replace("## ", "")}
					</h2>
				);
			}
			if (block.startsWith("> ")) {
				return (
					<blockquote
						key={i}
						className="border-l-2 border-foreground/20 pl-4 italic text-muted-foreground my-6"
					>
						{block.replace("> ", "")}
					</blockquote>
				);
			}
			return (
				<p key={i} className="leading-7 text-muted-foreground">
					{renderInline(block)}
				</p>
			);
		});

	return (
		<article className="content-container py-12 space-y-10">

			{/* ← Back */}
			<Link
				href="/blog"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeft className="size-3.5"/>
				Retour au blog
			</Link>

			{/* Hero */}
			<header className="space-y-6 max-w-3xl mx-auto text-center">
				<Badge variant="secondary" className="text-xs font-medium">
					{post.category}
				</Badge>
				<h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15]">
					{post.title}
				</h1>
				<p className="text-base text-muted-foreground">{post.excerpt}</p>

				{/* Author + meta */}
				<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="relative size-8 rounded-full overflow-hidden">
							<Avatar>
								<AvatarImage src={post.author.avatar} alt={post.author.name} />
								<AvatarFallback>{post.author.name[0]}</AvatarFallback>
							</Avatar>
						</div>
						<span className="font-medium text-foreground">{post.author.name}</span>
					</div>
					<span className="text-border">·</span>
					<span className="flex items-center gap-1.5">
						<CalendarDays className="size-3.5"/>
						{formattedDate}
					</span>
					<span className="text-border">·</span>
					<span className="flex items-center gap-1.5">
						<Clock className="size-3.5"/>
						{post.readTime} min de lecture
					</span>
				</div>
			</header>

			{/* Cover */}
			<div className="relative w-full aspect-16/7 rounded-xl overflow-hidden">
				<Image
					src={post.cover}
					alt={post.title}
					width={1920}
					height={1080}
					priority
					className="brightness-90 dark:brightness-75"
				/>
			</div>

			<Separator/>

			{/* Body */}
			<div className="max-w-2xl mx-auto space-y-5">
				{renderBody(post.body)}
			</div>

			<Separator/>

			{/* Related posts */}
			{related.length > 0 && (
				<section className="space-y-6">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block">
						À lire aussi
					</span>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{related.map((p) => (
							<PostCard key={p.slug} post={p}/>
						))}
					</div>
				</section>
			)}
		</article>
	);
}
