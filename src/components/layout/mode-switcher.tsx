"use client";

import { BookOpen, Stars, UsersRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useT } from "@/components/i18n/i18n-provider";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import type { WorkspaceMode } from "@/lib/workspace/mode";
import { cn } from "@/lib/utils/cn";

const MODE_ICON: Record<WorkspaceMode, typeof Stars> = {
  astrology: Stars,
  matrimony: UsersRound,
  wisdom: BookOpen,
};

const MODES: WorkspaceMode[] = ["astrology", "matrimony", "wisdom"];

const spring = { type: "spring" as const, stiffness: 480, damping: 36, mass: 0.65 };

function modeLabelKey(mode: WorkspaceMode) {
  if (mode === "astrology") return "navigation.modeAstrology";
  if (mode === "wisdom") return "navigation.modeRishiSage";
  return "navigation.modeMatrimony";
}

function modeSubtitleKey(mode: WorkspaceMode) {
  if (mode === "astrology") return "navigation.modeAstrologySubtitle";
  if (mode === "wisdom") return "navigation.modeRishiSageSubtitle";
  return "navigation.modeMatrimonySubtitle";
}

export function ModeSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  /** Icon-only for collapsed sidebar */
  compact?: boolean;
}) {
  const { mode, setMode, hydrated } = useWorkspaceMode();
  const t = useT();
  const reduceMotion = useReducedMotion();
  const pillId = compact ? "workspace-mode-pill-compact" : "workspace-mode-pill";

  return (
    <div
      className={cn(
        "border-border/50 bg-muted/50 overflow-hidden rounded-2xl border p-1",
        compact ? "inline-flex flex-col gap-0.5" : "grid w-full grid-cols-3 gap-0.5",
        className,
      )}
      role="tablist"
      aria-label={t("navigation.workspaceMode")}
      data-hydrated={hydrated ? "true" : "false"}
    >
      {MODES.map((key) => {
        const active = mode === key;
        const label = t(modeLabelKey(key));
        const subtitle = t(modeSubtitleKey(key));
        const Icon = MODE_ICON[key];
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            title={subtitle}
            onClick={() => {
              if (!active) setMode(key, { navigate: true });
            }}
            className={cn(
              "relative isolate flex min-w-0 items-center justify-center overflow-hidden rounded-xl outline-none",
              "focus-visible:ring-gold/40 focus-visible:ring-2 focus-visible:ring-offset-1",
              compact ? "h-9 w-9" : "h-9 gap-1 px-1.5",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/85",
            )}
          >
            {active ? (
              <motion.span
                layoutId={pillId}
                className="border-border/50 bg-card shadow-soft absolute inset-0 z-0 rounded-xl border"
                transition={reduceMotion ? { duration: 0 } : spring}
              />
            ) : null}
            <span className="relative z-10 flex min-w-0 items-center justify-center gap-1">
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
                  active ? "text-gold" : "opacity-70",
                )}
                aria-hidden
              />
              {compact ? (
                <span className="sr-only">{label}</span>
              ) : (
                <span className="truncate text-[10px] font-semibold tracking-wide sm:text-[11px]">
                  {label}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
