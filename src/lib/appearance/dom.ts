import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  type AppearancePreferences,
  type AppearanceExpression,
  type AppearanceMode,
  type AppearanceThemeId,
  type AccentOverrideId,
  type BorderIntensity,
} from "@/lib/appearance/types";

const THEMES = new Set<AppearanceThemeId>([
  "veda-gold",
  "rose-serenity",
  "crimson-heritage",
  "saffron-veda",
  "emerald-harmony",
  "midnight-veda",
]);

const EXPRESSIONS = new Set<AppearanceExpression>(["feminine", "masculine", "neutral"]);
const MODES = new Set<AppearanceMode>(["light", "dark", "system"]);
const ACCENTS = new Set<AccentOverrideId>([
  "gold",
  "saffron",
  "rose",
  "burgundy",
  "emerald",
  "temple",
]);
const BORDERS = new Set<BorderIntensity>(["soft", "medium", "strong"]);

export function normalizeAppearance(
  raw?: Partial<AppearancePreferences> | null,
): AppearancePreferences {
  const mode = raw?.mode && MODES.has(raw.mode) ? raw.mode : DEFAULT_APPEARANCE.mode;
  const expression =
    raw?.expression && EXPRESSIONS.has(raw.expression)
      ? raw.expression
      : DEFAULT_APPEARANCE.expression;
  const theme = raw?.theme && THEMES.has(raw.theme) ? raw.theme : DEFAULT_APPEARANCE.theme;
  const accentOverride =
    raw?.accentOverride && ACCENTS.has(raw.accentOverride) ? raw.accentOverride : null;
  const borderIntensity =
    raw?.borderIntensity && BORDERS.has(raw.borderIntensity)
      ? raw.borderIntensity
      : DEFAULT_APPEARANCE.borderIntensity;
  const reducedMotion = Boolean(raw?.reducedMotion);

  return {
    mode,
    expression,
    theme,
    accentOverride,
    borderIntensity,
    reducedMotion,
  };
}

export function readLocalAppearance(): AppearancePreferences {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    return normalizeAppearance(JSON.parse(raw) as Partial<AppearancePreferences>);
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function writeLocalAppearance(prefs: AppearancePreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}

/** Apply data attributes on <html> for CSS token themes. Mode is handled by next-themes. */
export function applyAppearanceDom(prefs: AppearancePreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", prefs.theme);
  root.setAttribute("data-expression", prefs.expression);
  root.setAttribute("data-border", prefs.borderIntensity || "medium");
  if (prefs.accentOverride) {
    root.setAttribute("data-accent", prefs.accentOverride);
  } else {
    root.removeAttribute("data-accent");
  }
  if (prefs.reducedMotion) {
    root.setAttribute("data-reduced-motion", "true");
  } else {
    root.removeAttribute("data-reduced-motion");
  }
}
