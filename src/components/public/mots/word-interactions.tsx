"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
	id: number;
	author: string;
	content: string;
	date: string;
}

const MOCK_COMMENTS: Comment[] = [
	{ id: 1, author: "KouaKouamé", content: "Ce mot est trop utilisé à Yop, surtout dans les maquis du coin !", date: "Il y a 2h" },
	{ id: 2, author: "AbidjanCity", content: "Oui, j'entends aussi \"gbonhi\" dans le même sens parfois.", date: "Il y a 5h" },
];

interface WordInteractionsProps {
	initialLikes: number;
}

export function WordInteractions({ initialLikes }: WordInteractionsProps) {
	const [likes, setLikes] = useState(initialLikes);
	const [vote, setVote] = useState<"up" | "down" | null>(null);
	const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
	const [author, setAuthor] = useState("");
	const [content, setContent] = useState("");

	function handleVote(type: "up" | "down") {
		if (vote === type) {
			setVote(null);
			setLikes((v) => (type === "up" ? v - 1 : v + 1));
		} else {
			const prev = vote;
			setVote(type);
			if (prev === "up") setLikes((v) => v - 1);
			if (prev === "down") setLikes((v) => v + 1);
			if (type === "up") setLikes((v) => v + 1);
			if (type === "down") setLikes((v) => v - 1);
		}
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!author.trim() || !content.trim()) return;
		setComments((prev) => [
			{
				id: Date.now(),
				author: author.trim(),
				content: content.trim(),
				date: "À l'instant",
			},
			...prev,
		]);
		setAuthor("");
		setContent("");
	}

	return (
		<div className="space-y-10">

			{/* ── Vote ─────────────────────────────────────── */}
			<div className="space-y-4">
				<h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
					Ce mot est-il utile ?
				</h2>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						className={cn("gap-2", vote === "up" && "border-foreground bg-muted")}
						onClick={() => handleVote("up")}
					>
						<ThumbsUp className="size-4" />
						<span className="font-semibold">{likes}</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						className={cn("gap-2", vote === "down" && "border-foreground bg-muted")}
						onClick={() => handleVote("down")}
					>
						<ThumbsDown className="size-4" />
					</Button>
					<span className="text-xs text-muted-foreground">
						{vote === "up" ? "Merci pour ton vote !" : vote === "down" ? "Dommage…" : "Vote pour valider ce mot"}
					</span>
				</div>
			</div>

			<Separator />

			{/* ── Commentaires ─────────────────────────────── */}
			<div className="space-y-6">
				<h2 className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
					<MessageSquare className="size-3.5" />
					Suggérer une amélioration
				</h2>

				{/* Formulaire */}
				<Card className="gap-0 py-0">
					<form onSubmit={handleSubmit}>
						<CardHeader className="px-5 pt-4 pb-3 flex items-center gap-3">
							<Input
								placeholder="Ton pseudo"
								value={author}
								onChange={(e) => setAuthor(e.target.value)}
								className="max-w-xs"
							/>
							<Input
								placeholder="Ton adresse e-mail"
								type="email"
							/>
						</CardHeader>
						<CardContent className="px-5 pb-3">
							<Textarea
								placeholder="Ajoute un contexte, une nuance, une anecdote…"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								rows={3}
							/>
						</CardContent>
						<CardFooter className="px-5 pb-4 justify-end">
							<Button type="submit" size="sm" className="gap-2" disabled={!author.trim() || !content.trim()}>
								<Send className="size-3.5" />
								Envoyer
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}

