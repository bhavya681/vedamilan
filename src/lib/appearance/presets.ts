import type {
  AccentOverrideId,
  AppearanceExpression,
  AppearanceThemeId,
} from "@/lib/appearance/types";

export type ThemePresetMeta = {
  id: AppearanceThemeId;
  name: string;
  description: string;
  swatches: [string, string, string, string];
  recommendedExpression?: AppearanceExpression;
};

export const THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: "veda-gold",
    name: "Veda Gold",
    description: "Classic VedaMilan — balanced, Vedic, and universal.",
    swatches: ["#F7F1E3", "#C47A1A", "#D4AF37", "#14110E"],
    recommendedExpression: "neutral",
  },
  {
    id: "rose-serenity",
    name: "Rose Serenity",
    description: "Soft, romantic, and elegant — muted rose with warm ivory.",
    swatches: ["#F7F1E3", "#B76E79", "#C9A27A", "#14110E"],
    recommendedExpression: "feminine",
  },
  {
    id: "crimson-heritage",
    name: "Crimson Heritage",
    description: "Rich burgundy warmth — mature, confident, sophisticated.",
    swatches: ["#F7F1E3", "#8B2942", "#C47A1A", "#14110E"],
    recommendedExpression: "masculine",
  },
  {
    id: "saffron-veda",
    name: "Saffron Veda",
    description: "Deep saffron and gold — traditional Vedic presence.",
    swatches: ["#F7F1E3", "#B86A12", "#D4AF37", "#1A120C"],
    recommendedExpression: "neutral",
  },
  {
    id: "emerald-harmony",
    name: "Emerald Harmony",
    description: "Calm emerald with muted gold — grounded and serene.",
    swatches: ["#F7F1E3", "#0F766E", "#C9A227", "#14110E"],
    recommendedExpression: "neutral",
  },
  {
    id: "midnight-veda",
    name: "Midnight Veda",
    description: "Cinematic charcoal and gold — premium for dark mode.",
    swatches: ["#0C0A08", "#D4AF37", "#C47A1A", "#F7F1E3"],
    recommendedExpression: "neutral",
  },
];

export const EXPRESSION_OPTIONS: Array<{
  id: AppearanceExpression;
  name: string;
  description: string;
}> = [
  {
    id: "neutral",
    name: "Neutral",
    description: "Balanced VedaMilan accents — recommended default.",
  },
  {
    id: "feminine",
    name: "Feminine",
    description: "Soft rose-gold accents. Visual preference only.",
  },
  {
    id: "masculine",
    name: "Masculine",
    description: "Deep burgundy accents. Visual preference only.",
  },
];

export const ACCENT_OVERRIDES: Array<{
  id: AccentOverrideId;
  name: string;
  color: string;
}> = [
  { id: "gold", name: "Royal Gold", color: "#D4AF37" },
  { id: "saffron", name: "Deep Saffron", color: "#C47A1A" },
  { id: "rose", name: "Rose Gold", color: "#B76E79" },
  { id: "burgundy", name: "Burgundy", color: "#8B2942" },
  { id: "emerald", name: "Emerald", color: "#0F766E" },
  { id: "temple", name: "Temple Blue", color: "#1F3A5F" },
];
