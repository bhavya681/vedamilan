/**
 * Professional display casing for person names.
 * Lowercase / ALL CAPS inputs become Title Case; mixed intentional casing is preserved.
 */

const SMALL_PARTICLES = new Set(["de", "da", "di", "du", "van", "von", "der", "den", "la", "le"]);

function titleCasePart(part: string, indexInWord: number): string {
  if (!part) return part;
  const lower = part.toLowerCase();

  // Preserve particles in the middle of multi-word surnames (van, de, …)
  if (indexInWord > 0 && SMALL_PARTICLES.has(lower)) {
    return lower;
  }

  // O'brien → O'Brien ; mcdonald → Mcdonald (simple)
  if (lower.includes("'")) {
    return lower
      .split("'")
      .map((segment) => (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : segment))
      .join("'");
  }

  // Mc / Mac prefixes when fully lower/upper
  if (/^mc[a-z]/.test(lower) && lower.length > 2) {
    return `Mc${lower.charAt(2).toUpperCase()}${lower.slice(3)}`;
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function titleCaseToken(token: string): string {
  return token
    .split("-")
    .map((part, i) => titleCasePart(part, i))
    .join("-");
}

function needsRecase(name: string): boolean {
  const letters = name.replace(/[^A-Za-z]/g, "");
  if (!letters) return false;
  const allLower = letters === letters.toLowerCase();
  const allUpper = letters === letters.toUpperCase();
  return allLower || allUpper;
}

/**
 * Format a person name for UI. Empty → fallback.
 * - "rahul sharma" → "Rahul Sharma"
 * - "RAHUL SHARMA" → "Rahul Sharma"
 * - "Rahul Sharma" → "Rahul Sharma" (unchanged)
 */
export function formatPersonName(raw: string | null | undefined, fallback = "Member"): string {
  const trimmed = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!trimmed) return fallback;

  if (!needsRecase(trimmed)) {
    // Still capitalize a leading lowercase letter on otherwise mixed names
    if (/^[a-z]/.test(trimmed)) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return trimmed;
  }

  return trimmed.split(" ").map(titleCaseToken).join(" ");
}

/** First given name, professionally capitalized. */
export function formatPersonFirstName(raw: string | null | undefined, fallback = "Friend"): string {
  const full = formatPersonName(raw, fallback);
  return full.split(/\s+/)[0] || fallback;
}
