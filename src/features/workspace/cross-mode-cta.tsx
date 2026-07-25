"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { cn } from "@/lib/utils/cn";

type CrossModeCtaProps = {
  className?: string;
};

/** Contextual bridge between Astrology, Matrimony, and Rishi Sage modes. */
export function CrossModeCta({ className }: CrossModeCtaProps) {
  const { mode, setMode } = useWorkspaceMode();

  if (mode === "astrology") {
    return (
      <section className={cn("border-border/60 border-t pt-8", className)}>
        <h2 className="font-display text-xl sm:text-2xl">Ready to meet people?</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
          Your Kundli stays with you. Switch to Matrimony for discovery, or open Rishi Sage for
          reflective conversations inspired by Vedic wisdom.
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode("wisdom", { navigate: true })}
            className="w-full sm:w-auto"
          >
            Open Rishi Sage
          </Button>
        </div>
      </section>
    );
  }

  if (mode === "wisdom") {
    return (
      <section className={cn("border-border/60 border-t pt-8", className)}>
        <h2 className="font-display text-xl sm:text-2xl">Carry insight into life</h2>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
          Reflect here, then return to your chart in Astrology — or explore compatibility in
          Matrimony with clearer intention.
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode("matrimony", { navigate: true })}
            className="w-full sm:w-auto"
          >
            Switch to Matrimony
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("border-border/60 border-t pt-8", className)}>
      <h2 className="font-display text-xl sm:text-2xl">Understand your relationship patterns</h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
        The same birth chart behind your matches can explain timing and emotional needs. Seek calm
        counsel in Rishi Sage, or open Astrology for your Kundli.
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
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode("wisdom", { navigate: true })}
          className="w-full sm:w-auto"
        >
          Open Rishi Sage
        </Button>
      </div>
    </section>
  );
}
