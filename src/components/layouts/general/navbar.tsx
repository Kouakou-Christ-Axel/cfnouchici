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
import ThemeSwitcher from "@/components/layouts/theme-switcher";
import {usePathname} from "next/navigation";

function Navbar() {
	const pathname = usePathname();

	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
				{/*<Link href="/">Se connecter</Link>*/}
				<Button>
					Proposer un mot
				</Button>
			</NavbarContent>
		</UINavbar>
	);
}

export default Navbar;