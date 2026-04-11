"use client";
import React from 'react';
import {
	Link,
	Navbar as UINavbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuToggle
} from "@heroui/react";
import {navLinks} from "@/config/navigation";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import ThemeSwitcher from "@/components/layouts/theme-switcher";
import {usePathname, useRouter} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {LogOut, Shield} from "lucide-react";

function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	const isActive = (href: string) => {
		return href === '/'
			? pathname === '/'
			: pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<UINavbar
			isBordered
			classNames={{
				wrapper: "content-container",
			}}
			position="static"
		>
			<NavbarContent>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
					className="sm:hidden"
				/>
				<NavbarBrand>
					<Link href="/" className="text-xl font-bold">
						nouchi.ci
					</Link>
				</NavbarBrand>
			</NavbarContent>
			<NavbarContent className="hidden sm:flex gap-4" justify="center">
				{navLinks.map((link) => {
					const active = isActive(link.href);
					return (
					<NavbarItem key={link.href}>
						<Link href={link.href} className="w-full" color={!active ? 'foreground' : 'primary'} onPress={() => setIsMenuOpen(false)}>
							{link.title}
						</Link>
					</NavbarItem>
				)})}
			</NavbarContent>
			<NavbarMenu>
				{navLinks.map((link) => (
					<NavbarItem key={link.href}>
						<Link href={link.href}>
							{link.title}
						</Link>
					</NavbarItem>
				))}
			</NavbarMenu>
			<NavbarContent justify="end">
				<ThemeSwitcher/>
				{user ? (
					<>
						{(((user as { role?: string }).role === "MODERATEUR") || ((user as { role?: string }).role === "ADMIN")) && (
							<NavbarItem>
								<Link href="/admin" aria-label="Administration">
									<Shield className="size-4" />
								</Link>
							</NavbarItem>
						)}
						<NavbarItem>
							<Avatar className="size-8 cursor-pointer">
								<AvatarImage src={user.image ?? undefined} alt={user.name ?? "Utilisateur"} />
								<AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
							</Avatar>
						</NavbarItem>
						<NavbarItem>
							<Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Se déconnecter">
								<LogOut className="size-4" />
							</Button>
						</NavbarItem>
						<NavbarItem>
							<Button asChild>
								<Link href="/proposer">Proposer un mot</Link>
							</Button>
						</NavbarItem>
					</>
				) : (
					<>
						<NavbarItem>
							<Link href="/connexion" color="foreground">Se connecter</Link>
						</NavbarItem>
						<NavbarItem>
							<Button asChild>
								<Link href="/connexion">Proposer un mot</Link>
							</Button>
						</NavbarItem>
					</>
				)}
			</NavbarContent>
		</UINavbar>
	);
}

export default Navbar;