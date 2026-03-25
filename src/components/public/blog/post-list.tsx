import React from 'react';
import PostCard from "@/components/public/blog/post-card";
import { posts } from "@/config/blog";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function PostList() {
	const [featured, ...rest] = posts;

	return (
		<section className="content-container space-y-10">
			{/* Page header */}
			<div className="flex flex-col items-center text-center space-y-4">
				<Badge variant="secondary" className="text-sm px-4 py-1 flex items-center gap-1.5">
					<BookOpen className="size-3.5" />
					Le blog du Nouchi
				</Badge>
				<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight uppercase leading-[1.1]">
					Culture & Langue
				</h1>
				<p className="max-w-xl text-base text-muted-foreground">
					Articles, analyses et anecdotes autour du nouchi et de la culture ivoirienne.
				</p>
			</div>

			<Separator />

			{/* Featured post */}
			{featured && (
				<div>
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 block">
						À la une
					</span>
					<PostCard post={featured} featured />
				</div>
			)}

			{/* Posts grid */}
			{rest.length > 0 && (
				<div>
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 block">
						Tous les articles
					</span>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{rest.map((post) => (
							<PostCard key={post.slug} post={post} />
						))}
					</div>
				</div>
			)}
		</section>
	);
}

export default PostList;