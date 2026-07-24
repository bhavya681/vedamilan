"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type CrossModeCtaProps = {
  className?: string;
};

/** Contextual bridge between Astrology and Matrimony without splitting the product. */
export function CrossModeCta({ className }: CrossModeCtaProps) {
  const { mode, setMode } = useWorkspaceMode();

  if (mode === "astrology") {
    return (
      <section
        className={cn(
          "border-border/60 from-card to-primary/[0.04] rounded-2xl border bg-gradient-to-br p-5 sm:p-6",
          className,
        )}
      >
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
          Continue in Matrimony
        </p>
        <h2 className="font-display mt-2 text-xl sm:text-2xl">Ready to find aligned partners?</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
          Your Kundli stays with you. Switch to Matrimony when you want discovery, interest, and
          compatibility — Astrology mode stays focused on your chart.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setMode("matrimony", { navigate: true })}
            className="w-full sm:w-auto"
          >
            Switch to Matrimony
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={routes.rajaYogas}>Check Raja Yogas</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "border-border/60 from-card to-primary/[0.04] rounded-2xl border bg-gradient-to-br p-5 sm:p-6",
        className,
      )}
    >
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
        Vedic self-discovery
      </p>
      <h2 className="font-display mt-2 text-xl sm:text-2xl">
        Understand your relationship patterns
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
        The same birth chart behind your matches can explain timing, emotional needs, and growth
        themes. Ask AI Guru or open your Kundli in Astrology mode.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={() => setMode("astrology", { navigate: true })}
          className="w-full sm:w-auto"
        >
          Open Astrology
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={routes.aiInsights}>Ask AI Guru</Link>
        </Button>
      </div>
    </section>
  );
}
