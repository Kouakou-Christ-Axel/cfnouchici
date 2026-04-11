"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  links: { title: string; href: string }[];
  className?: string;
}

export function NavLinks({ links, className }: NavLinksProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className={cn(className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm transition-colors",
            isActive(link.href)
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
}
