"use client";

import { Check, Monitor, Moon, RotateCcw, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppearance } from "@/components/providers/appearance-provider";
import { ACCENT_OVERRIDES, EXPRESSION_OPTIONS, THEME_PRESETS } from "@/lib/appearance/presets";
import type {
  AccentOverrideId,
  AppearanceExpression,
  AppearanceMode,
  AppearanceThemeId,
  BorderIntensity,
} from "@/lib/appearance/types";
import { cn } from "@/lib/utils/cn";

function ModeCard({
  mode,
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  mode: AppearanceMode;
  label: string;
  icon: typeof Sun;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "border-border/60 bg-card flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-sm font-medium transition-all",
        active
          ? "border-primary/50 ring-primary/25 shadow-soft ring-2"
          : "hover:border-primary/30 hover:bg-muted/40",
      )}
      aria-pressed={active}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
      {label}
      <span className="sr-only">{mode}</span>
    </button>
  );
}

function ThemePreviewMini({ swatches }: { swatches: [string, string, string, string] }) {
  const [bg, primary, gold, ink] = swatches;
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-black/5 p-3"
      style={{ background: bg }}
      aria-hidden
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-1.5 w-8 rounded-full" style={{ background: primary }} />
        <span className="h-1.5 w-5 rounded-full opacity-40" style={{ background: ink }} />
      </div>
      <div
        className="rounded-lg p-2 shadow-sm"
        style={{ background: "#fff", border: `1px solid ${ink}18` }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="h-2 w-10 rounded-full" style={{ background: ink, opacity: 0.7 }} />
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold text-white"
            style={{ background: primary }}
          >
            87
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-5 flex-1 rounded-md" style={{ background: primary }} />
          <span
            className="h-5 w-8 rounded-md border"
            style={{ borderColor: `${ink}22`, background: gold }}
          />
        </div>
      </div>
    </div>
  );
}

export function AppearanceSettingsPanel() {
  const { preferences, setPreferences, resetAppearance, hydrated } = useAppearance();

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="skeleton-shimmer h-8 w-48 rounded-full" />
        <div className="skeleton-shimmer h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Appearance</h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
          Personalize how VedaMilan feels. Themes change mood and accents — never matchmaking,
          kundli math, or your identity.
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Your preferences are saved automatically.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="display-mode">
        <div>
          <h2 id="display-mode" className="font-display text-xl tracking-tight">
            Display mode
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Default follows your device (System).
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ModeCard
            mode="light"
            label="Light"
            icon={Sun}
            active={preferences.mode === "light"}
            onSelect={() => setPreferences({ mode: "light" })}
          />
          <ModeCard
            mode="dark"
            label="Dark"
            icon={Moon}
            active={preferences.mode === "dark"}
            onSelect={() => setPreferences({ mode: "dark" })}
          />
          <ModeCard
            mode="system"
            label="System"
            icon={Monitor}
            active={preferences.mode === "system"}
            onSelect={() => setPreferences({ mode: "system" })}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="expression">
        <div>
          <h2 id="expression" className="font-display text-xl tracking-tight">
            Personal expression
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Visual personality for Veda Gold. Curated themes keep their own accents. Never used for
            matching.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXPRESSION_OPTIONS.map((opt) => {
            const active = preferences.expression === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreferences({ expression: opt.id as AppearanceExpression })}
                className={cn(
                  "border-border/60 bg-card rounded-2xl border p-4 text-left transition-all",
                  active
                    ? "border-primary/50 ring-primary/25 shadow-soft ring-2"
                    : "hover:border-primary/30",
                )}
                aria-pressed={active}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{opt.name}</p>
                  {active ? (
                    <span className="text-primary inline-flex items-center gap-1 text-xs font-medium">
                      <Check className="h-3.5 w-3.5" /> Active
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="themes">
        <div>
          <h2 id="themes" className="font-display text-xl tracking-tight">
            Theme
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Curated VedaMilan atmospheres. Veda Gold is the classic brand identity.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {THEME_PRESETS.map((preset) => {
            const active = preferences.theme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setPreferences({
                    theme: preset.id as AppearanceThemeId,
                    accentOverride: null,
                  });
                }}
                className={cn(
                  "border-border/60 bg-card rounded-[1.35rem] border p-4 text-left transition-all",
                  active
                    ? "border-primary/50 ring-primary/25 shadow-elevated ring-2"
                    : "hover:border-primary/30 shadow-soft",
                )}
                aria-pressed={active}
              >
                <ThemePreviewMini swatches={preset.swatches} />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg tracking-tight">{preset.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  {active ? (
                    <span className="text-primary shrink-0 text-xs font-medium">✓ Active</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="accessibility">
        <div>
          <h2 id="accessibility" className="font-display text-xl tracking-tight">
            Accessibility
          </h2>
        </div>
        <div className="border-border/60 bg-card flex items-center justify-between gap-4 rounded-2xl border px-4 py-4">
          <div>
            <Label htmlFor="reduced-motion" className="text-sm font-medium">
              Reduced motion
            </Label>
            <p className="text-muted-foreground mt-1 text-xs">
              Minimize decorative animation across the product.
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={Boolean(preferences.reducedMotion)}
            onCheckedChange={(on) => setPreferences({ reducedMotion: on })}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="advanced">
        <div>
          <h2 id="advanced" className="font-display text-xl tracking-tight">
            Advanced
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Optional curated accents and border strength. Safe palettes only.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Accent override
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreferences({ accentOverride: null })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                !preferences.accentOverride
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-primary/30",
              )}
            >
              Theme default
            </button>
            {ACCENT_OVERRIDES.map((a) => {
              const active = preferences.accentOverride === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setPreferences({ accentOverride: a.id as AccentOverrideId })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ background: a.color }}
                    aria-hidden
                  />
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Border intensity
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["soft", "medium", "strong"] as BorderIntensity[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPreferences({ borderIntensity: level })}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm capitalize transition-all",
                  preferences.borderIntensity === level
                    ? "border-primary/50 bg-primary/10 font-medium"
                    : "border-border/60 hover:border-primary/30",
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <Button type="button" variant="outline" onClick={() => resetAppearance()}>
          <RotateCcw className="h-4 w-4" />
          Reset appearance
        </Button>
      </section>
    </div>
  );
}
