"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { AstrologerTile } from "@/features/consultation/components/astrologer-portrait";
import {
  listVirtualAstrologers,
  type AstrologerSystem,
} from "@/domain/consultation/virtual-astrologers";
import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const FILTERS: { id: "all" | AstrologerSystem; label: string }[] = [
  { id: "all", label: "All" },
  { id: "parashara", label: "Parashara" },
  { id: "bnn", label: "BNN" },
  { id: "kp", label: "KP" },
  { id: "nadi", label: "Nadi" },
  { id: "lal-kitab", label: "Lal Kitab" },
  { id: "chinese", label: "Chinese" },
  { id: "western", label: "Western" },
  { id: "remedies", label: "Remedies" },
];

export default function ConsultationPage() {
  const { setMode } = useWorkspaceMode();
  const [filter, setFilter] = useState<"all" | AstrologerSystem>("all");
  const all = useMemo(() => listVirtualAstrologers(), []);
  const astrologers = useMemo(() => {
    if (filter === "all") return all;
    return all.filter((a) => a.system === filter);
  }, [all, filter]);

  useEffect(() => {
    setMode("astrology", { navigate: false });
  }, [setMode]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <ContentReveal className="space-y-8 sm:space-y-10">
        <PageHeader
          eyebrow="Astrology · Consultation"
          title="Virtual AI Astrologers"
          description="Chat or speak with fusion AI masters — Rahu Guru, Guru Orbit, Budha Byte, and more — each reading your stored kundli through a distinct Vedic tradition."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={routes.aiInsights}>
                  <MessageCircle className="h-4 w-4" />
                  AI Guru
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={routes.bookConsultation}>Human booking soon</Link>
              </Button>
            </div>
          }
        />

        <section className="border-border/50 from-muted/30 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
            <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,var(--gold)_0%,transparent_70%)] opacity-20" />
          </div>
          <div className="relative max-w-2xl space-y-3">
            <p className="text-gold/85 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {all.length} AI masters · kundli-aware
            </p>
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              Choose a tradition. Ask clearly. Receive professional guidance from your real chart.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Stylized AI astrologer personas — not photos of real people. Chart facts come from
              your calculated kundli; remedies follow engine-flagged themes.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-gold/50 bg-gold/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {astrologers.map((a) => (
            <AstrologerTile key={a.id} astrologer={a} />
          ))}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">{VEDIC_AI_DISCLAIMER}</p>
      </ContentReveal>
    </div>
  );
}
