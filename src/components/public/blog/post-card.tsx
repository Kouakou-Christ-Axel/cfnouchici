import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar';
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight } from "lucide-react";
import type { Post } from "@/config/blog";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface PostCardProps {
	post: Post;
	featured?: boolean;
}

function PostCard({ post, featured = false }: PostCardProps) {
	if (!post) return null;

	const formattedDate = format(parseISO(post.date), "d MMMM yyyy", { locale: fr });

	return (
		<Link
			href={`/blog/${post.slug}`}
			className={cn(
				"group block",
				featured && "md:col-span-2 lg:col-span-2"
			)}
		>
			<Card className={cn(
				"gap-0 py-0 overflow-hidden border-border hover:border-foreground/30 hover:shadow-sm transition-all duration-200 h-full"
			)}>
				{/* Cover image */}
				<div className={cn("relative w-full overflow-hidden", featured ? "aspect-16/7" : "aspect-video")}>
					<Image
						src={post.cover}
						alt={post.title}
						fill
						sizes={featured ? "100vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
						className="object-cover brightness-90 dark:brightness-75 group-hover:scale-[1.02] transition-transform duration-300"
					/>
				</div>

				<CardHeader className="px-5 pt-5 pb-0">
					{/* Meta */}
					<div className="flex items-center justify-between gap-2">
						<Badge variant="secondary" className="text-xs font-medium w-fit">
							{post.category}
						</Badge>
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							<Clock className="size-3" />
							{post.readTime} min
						</span>
					</div>

					<CardTitle className={cn(
						"tracking-tight leading-snug group-hover:underline underline-offset-4",
						featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
					)}>
						{post.title}
					</CardTitle>
				</CardHeader>

				<CardContent className="px-5 py-3 flex-1">
					<CardDescription className="line-clamp-2">
						{post.excerpt}
					</CardDescription>
				</CardContent>

				<Separator />

				<CardFooter className="px-5 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Avatar>
							<AvatarImage src={post.author.avatar} alt={post.author.name} />
							<AvatarFallback>{post.author.name[0]}</AvatarFallback>
						</Avatar>
						<span className="text-xs text-muted-foreground">{post.author.name}</span>
					</div>
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<span>{formattedDate}</span>
						<ArrowRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}

export default PostCard;