import { z } from "zod";

export const appearancePreferencesSchema = z.object({
  mode: z.enum(["light", "dark", "system"]),
  expression: z.enum(["feminine", "masculine", "neutral"]),
  theme: z.enum([
    "veda-gold",
    "rose-serenity",
    "crimson-heritage",
    "saffron-veda",
    "emerald-harmony",
    "midnight-veda",
  ]),
  accentOverride: z
    .enum(["gold", "saffron", "rose", "burgundy", "emerald", "temple"])
    .nullable()
    .optional(),
  borderIntensity: z.enum(["soft", "medium", "strong"]).optional(),
  reducedMotion: z.boolean().optional(),
});
