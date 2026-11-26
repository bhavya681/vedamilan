"use client";

import { BookOpen, Heart, Stars, type LucideIcon } from "lucide-react";

import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { cn } from "@/lib/utils/cn";
import { WORKSPACE_MODE_META, type WorkspaceMode } from "@/lib/workspace/mode";

const MODES: WorkspaceMode[] = ["astrology", "matrimony", "wisdom"];

const MODE_ICON: Record<WorkspaceMode, LucideIcon> = {
  astrology: Stars,
  matrimony: Heart,
  wisdom: BookOpen,
};

const MODE_HINT: Record<WorkspaceMode, string> = {
  astrology: "Kundli, dashas & AI guidance",
  matrimony: "Matches & compatibility",
  wisdom: "Ask the Sages & Wisdom Journal",
};

type ModeEntryCardsProps = {
  className?: string;
  eyebrow?: string;
};

export function ModeEntryCards({ className, eyebrow = "KUNDLIV" }: ModeEntryCardsProps) {
  const { mode, setMode } = useWorkspaceMode();

  return (
    <section className={cn("min-w-0 space-y-2", className)} aria-label="Explore KUNDLIV modes">
      {eyebrow ? (
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((key) => {
          const active = mode === key;
          const Icon = MODE_ICON[key];
          return (
            <button
              key={key}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setMode(key, { navigate: true })}
              className={cn(
                "border-border/60 from-card/90 to-muted/30 flex min-w-0 items-center gap-3 rounded-2xl border bg-gradient-to-br p-3 text-left transition-all",
                active
                  ? "border-gold/45 bg-gold/5 ring-gold/35 ring-1"
                  : "hover:border-gold/30 hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
                  active
                    ? "border-gold/35 bg-gold/15 text-gold"
                    : "border-border/50 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="font-display flex items-center gap-1.5 text-sm font-semibold">
                  {WORKSPACE_MODE_META[key].label}
                  {active ? (
                    <span className="bg-gold h-1.5 w-1.5 rounded-full" aria-hidden />
                  ) : null}
                </span>
                <span className="text-muted-foreground mt-0.5 block truncate text-[11px]">
                  {MODE_HINT[key]}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[10px] font-semibold tracking-[0.08em] uppercase",
                    active ? "text-gold" : "text-muted-foreground/70",
                  )}
                >
                  {active ? "Current mode" : "Open mode"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
