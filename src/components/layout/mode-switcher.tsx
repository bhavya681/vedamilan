"use client";

import type { ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useT } from "@/components/i18n/i18n-provider";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import type { WorkspaceMode } from "@/lib/workspace/mode";
import { cn } from "@/lib/utils/cn";

const MODES: WorkspaceMode[] = ["astrology", "matrimony", "wisdom"];

const spring = { type: "spring" as const, stiffness: 460, damping: 38, mass: 0.65 };

type ModeVisual = {
  index: string;
  soft: string;
  glow: string;
  ink: string;
  bar: string;
  Glyph: (props: { className?: string; active?: boolean }) => ReactElement;
};

function AstrologyGlyph({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <circle
        cx="16"
        cy="16"
        r="11"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.15}
        opacity={active ? 1 : 0.7}
      />
      <circle cx="16" cy="16" r="4.2" fill="currentColor" opacity={active ? 0.95 : 0.55} />
      <path
        d="M16 5.5v3.2M16 23.3v3.2M5.5 16h3.2M23.3 16h3.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={active ? 0.9 : 0.55}
      />
      <path
        d="M9.2 9.2l2.1 2.1M20.7 20.7l2.1 2.1M20.7 9.2l-2.1 2.1M11.3 20.7l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity={active ? 0.75 : 0.4}
      />
    </svg>
  );
}

function MatrimonyGlyph({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <circle
        cx="12.5"
        cy="15"
        r="6.2"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.15}
        opacity={active ? 1 : 0.7}
      />
      <circle
        cx="19.5"
        cy="15"
        r="6.2"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.15}
        opacity={active ? 1 : 0.7}
      />
      <circle cx="16" cy="15" r="2.1" fill="currentColor" opacity={active ? 0.9 : 0.45} />
    </svg>
  );
}

function WisdomGlyph({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <path
        d="M8 7.5h12.5c2.4 0 4 1.7 4 4.1v8.8c0 2.4-1.6 4.1-4 4.1H8.8C7.2 24.5 6 23.2 6 21.5V9.8C6 8.5 6.9 7.5 8 7.5Z"
        stroke="currentColor"
        strokeWidth={active ? 1.4 : 1.15}
        opacity={active ? 1 : 0.7}
      />
      <path
        d="M11 12.2h10M11 16h8.5M11 19.8h6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity={active ? 0.85 : 0.5}
      />
      <circle cx="22.5" cy="9.2" r="1.6" fill="currentColor" opacity={active ? 0.9 : 0.5} />
    </svg>
  );
}

const MODE_VISUAL: Record<WorkspaceMode, ModeVisual> = {
  astrology: {
    index: "01",
    soft: "from-gold/18 via-gold/8 to-transparent",
    glow: "bg-gold/25",
    ink: "text-gold",
    bar: "bg-gold",
    Glyph: AstrologyGlyph,
  },
  matrimony: {
    index: "02",
    soft: "from-[color:var(--rose-gold)]/18 via-[color:var(--rose-gold)]/8 to-transparent",
    glow: "bg-[color:var(--rose-gold)]/25",
    ink: "text-[color:var(--rose-gold)]",
    bar: "bg-[color:var(--rose-gold)]",
    Glyph: MatrimonyGlyph,
  },
  wisdom: {
    index: "03",
    soft: "from-primary/18 via-primary/8 to-transparent",
    glow: "bg-primary/25",
    ink: "text-primary",
    bar: "bg-primary",
    Glyph: WisdomGlyph,
  },
};

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
  const activeVisual = MODE_VISUAL[mode];
  const pillId = compact ? "workspace-mode-pill-compact" : "workspace-mode-pill";

  if (compact) {
    return (
      <div
        className={cn(
          "border-border/55 relative inline-flex flex-col gap-1 overflow-hidden rounded-2xl border p-1",
          "from-card/95 to-muted/50 shadow-soft bg-gradient-to-b",
          className,
        )}
        role="tablist"
        aria-label={t("navigation.workspaceMode")}
        data-hydrated={hydrated ? "true" : "false"}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-1 top-1 h-10 rounded-xl opacity-70 blur-md transition-colors duration-500",
            activeVisual.glow,
          )}
          aria-hidden
        />
        {MODES.map((key) => {
          const active = mode === key;
          const label = t(modeLabelKey(key));
          const subtitle = t(modeSubtitleKey(key));
          const visual = MODE_VISUAL[key];
          const Glyph = visual.Glyph;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              title={`${label} — ${subtitle}`}
              onClick={() => {
                if (!active) setMode(key, { navigate: true });
              }}
              className={cn(
                "relative isolate flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl transition-colors outline-none",
                "focus-visible:ring-gold/40 focus-visible:ring-2 focus-visible:ring-offset-1",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground/90",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={pillId}
                  className="border-border/40 bg-card/95 shadow-soft absolute inset-0 z-0 rounded-xl border"
                  transition={reduceMotion ? { duration: 0 } : spring}
                />
              ) : null}
              <Glyph
                active={active}
                className={cn("relative z-10 h-5 w-5", active ? visual.ink : "opacity-70")}
              />
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mode-path-switcher border-border/50 shadow-soft relative overflow-hidden rounded-2xl border",
        "from-card via-card/95 to-muted/45 bg-gradient-to-b",
        className,
      )}
      role="tablist"
      aria-label={t("navigation.workspaceMode")}
      data-hydrated={hydrated ? "true" : "false"}
    >
      {/* Ambient wash follows active path */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 transition-all duration-500",
          activeVisual.soft,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--gold) 35%, transparent) 0 1px, transparent 1.5px), radial-gradient(circle at 78% 28%, color-mix(in srgb, var(--gold) 28%, transparent) 0 1px, transparent 1.5px), radial-gradient(circle at 62% 72%, color-mix(in srgb, var(--primary) 30%, transparent) 0 1px, transparent 1.5px)",
          backgroundSize: "100% 100%",
        }}
        aria-hidden
      />

      <div className="relative px-2.5 pt-2.5 pb-1">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
            {t("navigation.workspaceModeLabel")}
          </p>
          <span className="text-muted-foreground/70 font-display text-[10px] tracking-wide">
            {activeVisual.index} / 03
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-1 p-1.5 pt-1">
        {MODES.map((key) => {
          const active = mode === key;
          const label = t(modeLabelKey(key));
          const subtitle = t(modeSubtitleKey(key));
          const visual = MODE_VISUAL[key];
          const Glyph = visual.Glyph;
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
                "group relative isolate flex min-h-[4.25rem] flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-0.5 py-2 text-center transition-colors duration-200 outline-none sm:min-h-[4.85rem] sm:gap-1.5 sm:px-1 sm:py-2.5",
                "focus-visible:ring-gold/40 focus-visible:ring-2 focus-visible:ring-offset-1",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground/88",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={pillId}
                  className="border-border/40 bg-card/95 shadow-soft absolute inset-0 z-0 rounded-xl border"
                  transition={reduceMotion ? { duration: 0 } : spring}
                />
              ) : (
                <span
                  className="group-hover:bg-muted/45 absolute inset-0 z-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 sm:h-9 sm:w-9",
                  active
                    ? cn("border-transparent shadow-sm", visual.ink, "bg-background/70")
                    : "border-border/45 bg-background/35 opacity-80 group-hover:opacity-100",
                )}
              >
                <Glyph active={active} className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" />
              </span>

              <span className="relative z-10 max-w-full min-w-0 px-0.5">
                <span
                  className={cn(
                    "font-display line-clamp-2 block text-[10px] leading-tight font-semibold tracking-tight sm:text-[12px]",
                    active && "text-foreground",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 hidden text-[9px] tracking-[0.14em] uppercase transition-opacity sm:block",
                    active ? cn(visual.ink, "opacity-90") : "text-muted-foreground/0",
                  )}
                >
                  {visual.index}
                </span>
              </span>

              {active ? (
                <motion.span
                  layoutId={`${pillId}-bar`}
                  className={cn(
                    "absolute bottom-1.5 left-1/2 z-10 h-0.5 w-5 -translate-x-1/2 rounded-full",
                    visual.bar,
                  )}
                  transition={reduceMotion ? { duration: 0 } : spring}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <p
        key={mode}
        className="text-muted-foreground relative line-clamp-2 px-2.5 pb-2 text-[10px] leading-snug sm:line-clamp-none sm:truncate sm:px-3 sm:pb-2.5"
      >
        {t(modeSubtitleKey(mode))}
      </p>
    </div>
  );
}
