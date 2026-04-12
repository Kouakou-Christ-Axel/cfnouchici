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
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
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
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
