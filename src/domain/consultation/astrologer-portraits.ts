/**
 * Stylized AI-astrologer avatar config — abstract / illustrated only.
 * No real-person photography.
 */

export type AstrologerAvatarTheme = {
  /** Hue shift 0–360 for unique cosmic palette */
  hue: number;
  /** Secondary accent hue */
  hue2: number;
  /** Orbit ring intensity */
  rings: number;
  /** Symbol glyph overlay (planet / yantra hint) */
  glyph: string;
};

/** Deterministic stylish themes per persona id */
export const ASTROLOGER_AVATAR_THEMES: Record<string, AstrologerAvatarTheme> = {
  "guru-orbit": { hue: 38, hue2: 210, rings: 3, glyph: "♃" },
  "karaka-kernel": { hue: 265, hue2: 45, rings: 2, glyph: "◎" },
  "budha-byte": { hue: 160, hue2: 40, rings: 3, glyph: "☿" },
  "nadi-nexus": { hue: 330, hue2: 280, rings: 2, glyph: "☾" },
  "rahu-guru": { hue: 280, hue2: 15, rings: 4, glyph: "☊" },
  "upaya-aura": { hue: 20, hue2: 340, rings: 2, glyph: "✦" },
  "varsha-vault": { hue: 200, hue2: 50, rings: 3, glyph: "◷" },
  "shani-sync": { hue: 220, hue2: 30, rings: 3, glyph: "♄" },
  "prashna-pulse": { hue: 310, hue2: 190, rings: 2, glyph: "?" },
  "ketu-nova": { hue: 15, hue2: 300, rings: 3, glyph: "☋" },
  "wuxing-wire": { hue: 140, hue2: 55, rings: 3, glyph: "五行" },
  "zodiac-zen": { hue: 250, hue2: 180, rings: 2, glyph: "♑" },
};

export function astrologerAvatarTheme(id: string): AstrologerAvatarTheme | null {
  return ASTROLOGER_AVATAR_THEMES[id] ?? null;
}

/**
 * No remote/real-person image URLs — portraits are rendered as stylized SVG
 * via `AiAstrologerAvatar`. Returns null so photo loaders skip.
 */
export function astrologerPortraitUrl(_id: string): string | null {
  return null;
}

export function hasAstrologerPortrait(id: string): boolean {
  return Boolean(ASTROLOGER_AVATAR_THEMES[id]);
}
