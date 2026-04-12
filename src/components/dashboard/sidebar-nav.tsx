"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User,
  Shield,
  MessageSquare,
  BarChart,
  Users,
  FileClock,
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  role: string;
}

const USER_ITEMS = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/propositions", label: "Mes propositions", icon: FileText },
  { href: "/dashboard/profil", label: "Profil & paramètres", icon: User },
];

const MOD_ITEMS = [
  { href: "/dashboard/moderation", label: "File d'attente", icon: Shield },
  { href: "/dashboard/mots", label: "Tous les mots", icon: MessageSquare },
  { href: "/dashboard/stats", label: "Stats globales", icon: BarChart },
];

const ADMIN_ITEMS = [
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/dashboard/logs", label: "Logs de modération", icon: FileClock },
];

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const isStaff = role === "MODERATEUR" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Mon espace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {USER_ITEMS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isStaff && (
        <SidebarGroup>
          <SidebarGroupLabel>Modération</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MOD_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}
