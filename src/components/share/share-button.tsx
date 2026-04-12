"use client";

import { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Twitter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  copyShareLink,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  nativeShare,
} from "@/lib/share";

interface ShareButtonProps {
  mot: string;
  slug: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  label?: string;
}

export function ShareButton({
  mot,
  slug,
  variant = "outline",
  size = "sm",
  label,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleNative() {
    await nativeShare({ mot, slug });
  }

  async function handleCopy() {
    const ok = await copyShareLink({ slug });
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const hasNative = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={size === "icon" ? "" : "rounded-full gap-2"} aria-label="Partager">
          <Share2 className="size-4" />
          {size !== "icon" && label !== undefined && <span>{label}</span>}
          {size !== "icon" && label === undefined && <span>Partager</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasNative && (
          <DropdownMenuItem onClick={handleNative}>
            <Share2 className="size-4" />
            <span>Partager…</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <a href={getWhatsAppShareUrl({ mot, slug })} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={getTwitterShareUrl({ mot, slug })} target="_blank" rel="noopener noreferrer">
            <Twitter className="size-4" />
            <span>X (Twitter)</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          <span>{copied ? "Copié !" : "Copier le lien"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
