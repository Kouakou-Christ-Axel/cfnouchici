"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 400);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<button
			aria-label="Retour en haut"
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			className={cn(
				"fixed bottom-6 right-6 z-50 size-10 rounded-full border border-border bg-background shadow-md",
				"flex items-center justify-center text-muted-foreground",
				"hover:bg-muted hover:text-foreground transition-all duration-200",
				"opacity-0 translate-y-2 pointer-events-none",
				visible && "opacity-100 translate-y-0 pointer-events-auto"
			)}
		>
			<ArrowUp className="size-4" />
		</button>
	);
}

