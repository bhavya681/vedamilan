export type AppearanceMode = "light" | "dark" | "system";

export type AppearanceExpression = "feminine" | "masculine" | "neutral";

export type AppearanceThemeId =
  | "veda-gold"
  | "rose-serenity"
  | "crimson-heritage"
  | "saffron-veda"
  | "emerald-harmony"
  | "midnight-veda";

export type BorderIntensity = "soft" | "medium" | "strong";

export type AccentOverrideId = "gold" | "saffron" | "rose" | "burgundy" | "emerald" | "temple";

export type AppearancePreferences = {
  mode: AppearanceMode;
  expression: AppearanceExpression;
  theme: AppearanceThemeId;
  accentOverride?: AccentOverrideId | null;
  borderIntensity?: BorderIntensity;
  reducedMotion?: boolean;
};

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  mode: "system",
  expression: "neutral",
  theme: "veda-gold",
  accentOverride: null,
  borderIntensity: "medium",
  reducedMotion: false,
};

export const APPEARANCE_STORAGE_KEY = "vedamilan.appearance.v1";
