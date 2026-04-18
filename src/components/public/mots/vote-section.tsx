"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Eye, HelpCircle, Check, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { VoteAuthModal } from "@/components/public/mots/vote-auth-modal";

/* ─── Types ────────────────────────────────────────────── */

type ConnaissanceOption = "OUI_UTILISE" | "CONNAIS" | "JAMAIS_ENTENDU";
type ExactitudeOption = "EXACTE" | "APPROXIMATIVE" | "FAUSSE";

interface VoteSummary {
  totalVotes: number;
  connaissance: Record<ConnaissanceOption, number>;
  exactitude: Record<ExactitudeOption, number>;
}

interface UserVote {
  connaissance: ConnaissanceOption;
  exactitude: ExactitudeOption;
}

interface PendingVote {
  slug: string;
  field: "connaissance" | "exactitude";
  value: string;
}

/* ─── Option configs ────────────────────────────────────── */

const CONNAISSANCE_OPTIONS: {
  value: ConnaissanceOption;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "OUI_UTILISE", label: "Oui, je l'utilise", icon: ThumbsUp },
  { value: "CONNAIS", label: "Je le connais", icon: Eye },
  { value: "JAMAIS_ENTENDU", label: "Jamais entendu", icon: HelpCircle },
];

const EXACTITUDE_OPTIONS: {
  value: ExactitudeOption;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "EXACTE", label: "Exacte", icon: Check },
  { value: "APPROXIMATIVE", label: "Approximative", icon: AlertTriangle },
  { value: "FAUSSE", label: "Fausse", icon: X },
];

/* ─── Component ─────────────────────────────────────────── */

interface VoteSectionProps {
  slug: string;
}

export function VoteSection({ slug }: VoteSectionProps) {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const [summary, setSummary] = useState<VoteSummary | null>(null);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [pendingConnaissance, setPendingConnaissance] = useState<ConnaissanceOption | null>(null);
  const [pendingExactitude, setPendingExactitude] = useState<ExactitudeOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ── Fetch summary ────────────────────────────────────── */
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/mots/${slug}/vote`);
      if (res.ok) {
        const data: VoteSummary = await res.json();
        setSummary(data);
      }
    } catch {
      // silently ignore network errors
    }
  }, [slug]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  /* ── Restore pending vote after login ────────────────── */
  useEffect(() => {
    if (!session?.user) return;
    const raw = localStorage.getItem("pending_vote");
    if (!raw) return;
    try {
      const pending: PendingVote = JSON.parse(raw);
      if (pending.slug !== slug) return;
      localStorage.removeItem("pending_vote");
      if (pending.field === "connaissance") {
        setPendingConnaissance(pending.value as ConnaissanceOption);
      } else {
        setPendingExactitude(pending.value as ExactitudeOption);
      }
    } catch {
      localStorage.removeItem("pending_vote");
    }
  }, [session?.user, slug]);

  /* ── Submit vote ──────────────────────────────────────── */
  const submitVote = useCallback(
    async (connaissance: ConnaissanceOption, exactitude: ExactitudeOption) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/mots/${slug}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connaissance, exactitude }),
        });
        if (res.ok) {
          setUserVote({ connaissance, exactitude });
          await fetchSummary();
        }
      } catch {
        // silently ignore network errors
      } finally {
        setIsSubmitting(false);
      }
    },
    [slug, isSubmitting, fetchSummary]
  );

  /* ── Handle unauth click ────────────────────────────── */
  function handleUnauthClick(field: "connaissance" | "exactitude", value: string) {
    localStorage.setItem("pending_vote", JSON.stringify({ slug, field, value }));
    setIsModalOpen(true);
  }

  /* ── Handle modal cancel ────────────────────────────── */
  function handleModalCancel() {
    localStorage.removeItem("pending_vote");
  }

  /* ── Handle selection ─────────────────────────────────── */
  function handleConnaissance(value: ConnaissanceOption) {
    if (!isAuthenticated) {
      handleUnauthClick("connaissance", value);
      return;
    }
    const next = pendingConnaissance === value ? null : value;
    setPendingConnaissance(next);
    if (next && pendingExactitude) {
      submitVote(next, pendingExactitude);
    }
  }

  function handleExactitude(value: ExactitudeOption) {
    if (!isAuthenticated) {
      handleUnauthClick("exactitude", value);
      return;
    }
    const next = pendingExactitude === value ? null : value;
    setPendingExactitude(next);
    if (pendingConnaissance && next) {
      submitVote(pendingConnaissance, next);
    }
  }

  /* ── Resolve active selections (submitted vote takes priority) */
  const activeConnaissance = userVote?.connaissance ?? pendingConnaissance;
  const activeExactitude = userVote?.exactitude ?? pendingExactitude;

  return (
    <>
      <VoteAuthModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        slug={slug}
        onCancel={handleModalCancel}
      />

      <Card className="gap-0 py-0">
        <CardContent className="px-5 py-5 space-y-6">

          {/* ── Question 1 ──────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Tu connais ce mot ?
            </p>
            <div className="flex flex-wrap gap-2">
              {CONNAISSANCE_OPTIONS.map(({ value, label, icon: Icon }) => {
                const count = summary?.connaissance[value] ?? 0;
                const isSelected = activeConnaissance === value;
                return (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleConnaissance(value)}
                    className={cn(
                      "gap-2",
                      isSelected && "border-foreground bg-muted"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                    {summary && (
                      <span className="ml-1 font-semibold text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* ── Question 2 ──────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              La définition est correcte ?
            </p>
            <div className="flex flex-wrap gap-2">
              {EXACTITUDE_OPTIONS.map(({ value, label, icon: Icon }) => {
                const count = summary?.exactitude[value] ?? 0;
                const isSelected = activeExactitude === value;
                return (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleExactitude(value)}
                    className={cn(
                      "gap-2",
                      isSelected && "border-foreground bg-muted"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                    {summary && (
                      <span className="ml-1 font-semibold text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
