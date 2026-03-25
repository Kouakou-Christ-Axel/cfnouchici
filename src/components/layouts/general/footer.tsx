import React from 'react';
import Link from 'next/link';
import { navLinks } from '@/config/navigation';
import { Separator } from '@/components/ui/separator';

function Footer() {
	return (
		<footer className="py-10 mt-20">
			<div className="content-container flex flex-col gap-8">
				<div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
					{/* Brand */}
					<div className="flex flex-col gap-1">
						<span className="text-lg font-semibold tracking-tight uppercase">
							Nouchi.ci
						</span>
						<span className="text-sm text-muted-foreground max-w-xs">
							Le dictionnaire du nouchi, par la communauté CI.
						</span>
					</div>

					{/* Nav links */}
					<nav className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
							>
								{link.title}
							</Link>
						))}
					</nav>
				</div>

				<Separator />

				<div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
					<span>© {new Date().getFullYear()} Nouchi.ci — Tous droits réservés.</span>
					<span>Fait avec ❤️ par la communauté ivoirienne</span>
				</div>
			</div>
		</footer>
	);
}

export default Footer;