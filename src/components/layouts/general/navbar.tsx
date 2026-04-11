"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/layouts/general/nav-links";
import { NavAuth } from "@/components/layouts/general/nav-auth";
import { navLinks } from "@/config/navigation";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="content-container flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-xl font-extrabold tracking-tight"
        >
          nouchi<span className="text-red-500">.</span>ci
        </Link>

        <NavLinks links={navLinks} className="hidden md:flex gap-6" />

        <div className="hidden md:flex items-center gap-3">
          <NavAuth />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <NavLinks links={navLinks} className="flex flex-col gap-3 py-4" />
          <NavAuth />
        </div>
      )}
    </header>
  );
}
