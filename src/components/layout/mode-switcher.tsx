"use client";

import { Stars, UsersRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { WORKSPACE_MODE_META, type WorkspaceMode } from "@/lib/workspace/mode";
import { cn } from "@/lib/utils/cn";

const MODE_ICON: Record<WorkspaceMode, typeof Stars> = {
  astrology: Stars,
  matrimony: UsersRound,
};

const MODES = ["astrology", "matrimony"] as const;

const spring = { type: "spring" as const, stiffness: 480, damping: 36, mass: 0.65 };

export function ModeSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  /** Icon-only for collapsed sidebar */
  compact?: boolean;
}) {
  const { mode, setMode, hydrated } = useWorkspaceMode();
  const reduceMotion = useReducedMotion();
  const pillId = compact ? "workspace-mode-pill-compact" : "workspace-mode-pill";

  return (
    <div
      className={cn(
        "border-border/50 bg-muted/50 overflow-hidden rounded-2xl border p-1",
        compact ? "inline-flex flex-col gap-0.5" : "grid w-full grid-cols-2 gap-0.5",
        className,
      )}
      role="tablist"
      aria-label="VedaMilan workspace mode"
      data-hydrated={hydrated ? "true" : "false"}
    >
      {MODES.map((key) => {
        const active = mode === key;
        const meta = WORKSPACE_MODE_META[key];
        const Icon = MODE_ICON[key];
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            title={meta.subtitle}
            onClick={() => {
              if (!active) setMode(key, { navigate: true });
            }}
            className={cn(
              "relative isolate flex min-w-0 items-center justify-center overflow-hidden rounded-xl outline-none",
              "focus-visible:ring-gold/40 focus-visible:ring-2 focus-visible:ring-offset-1",
              compact ? "h-9 w-9" : "h-9 gap-1.5 px-2",
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
            <span className="relative z-10 flex min-w-0 items-center justify-center gap-1.5">
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
                  active ? "text-gold" : "opacity-70",
                )}
                aria-hidden
              />
              {compact ? (
                <span className="sr-only">{meta.label}</span>
              ) : (
                <span className="truncate text-[11px] font-semibold tracking-wide">
                  {meta.label}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
