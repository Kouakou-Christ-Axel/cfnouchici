"use client";

import React from 'react';
import {ArrowRightIcon, Search} from "lucide-react";
import {cn} from "@/lib/utils";
import {ShimmeringText} from "@/components/animate-ui/primitives/texts/shimmering";
import {Badge} from "@/components/ui/badge";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {popularWords} from "@/config/navigation";
import PopularWordBadge from "@/components/public/accueil/popular-word-badge";
import {GravityStarsBackground} from "@/components/animate-ui/components/backgrounds/gravity-stars";
import {Highlighter} from "@/components/ui/highlighter";
import {LightRays} from "@/components/ui/light-rays";

function HeroSection() {
	return (
		<section className="relative h-screen-nav">
			<LightRays />
			<GravityStarsBackground className="absolute inset-0 flex items-center justify-center rounded-xl"/>
			<div className="content-container py-8 text-center">
				<Badge
					variant="outline"
					className={cn(
						"group text-base transition-all ease-in hover:cursor-pointer max-w-fit mb-10 bg-gray-300"
					)}
				>
					<div
						className="inline-flex items-center justify-center px-4 py-1 hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400"
					>
						<ShimmeringText
							key={`hero-text-${Math.random()}`}
							duration={0.8}
							className="text-sm sm:text-base"
							text="✨ Votre dictionnaire ivoirien collaboratif"
						/>
						<ArrowRightIcon
							className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"/>
					</div>
				</Badge>
				<div className="flex flex-col items-center space-y-6">
					<h1
						className="sm:text-6xl lg:text-7xl leading-[1.1] font-semibold tracking-tight text-balance uppercase">
						Le dictionnaire du <Highlighter action="box" color="#3b82f6">nouchi</Highlighter>,
						<br/>
						<span className="text-[#71717a]">par la <Highlighter action="underline" color="#f59e0b">communauté CI</Highlighter> </span>
					</h1>
					<p className="max-w-2xl text-sm sm:text-base text-muted-foreground md:text-lg">
						Cherche un mot, découvre sa définition, propose une expression, et aide à documenter notre patrimoine
						linguistique.
					</p>
					<InputGroup className="max-w-4xl">
						<InputGroupInput className="text-sm md:text-xl" placeholder="Rechercher un mot..."/>
						<InputGroupAddon>
							<Search/>
						</InputGroupAddon>
						<InputGroupAddon className="hidden sm:block" align="inline-end">12 results</InputGroupAddon>
					</InputGroup>
					<div className="flex flex-col items-center space-y-6">
						<h2 className="text-2xl font-semibold tracking-tight text-balance">
							Les mots les plus populaires
						</h2>
						<div className="flex flex-wrap justify-center gap-4">
							{popularWords.map((popularWord) => (
								<PopularWordBadge key={popularWord.href} mot={popularWord.label} href={popularWord.href}/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default HeroSection;