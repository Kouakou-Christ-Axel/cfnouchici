"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SidebarUser } from "@/components/dashboard/sidebar-user";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="border-b p-4">
          <Link
            href="/"
            className="font-(family-name:--font-heading) font-extrabold text-lg tracking-tight"
          >
            nouchi<span className="text-red-500">.</span>ci
          </Link>
        </SidebarHeader>
        <SidebarNav role={user.role ?? "USER"} />
        <SidebarUser user={user} />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center h-14 border-b border-border px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
