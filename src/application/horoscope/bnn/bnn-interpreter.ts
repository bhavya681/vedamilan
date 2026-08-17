import type { BnnThemeHit } from "./bnn-patterns";

/**
 * BNN copy layer — never invents extra rules.
 * If a combination is not in the v1 detector, the UI should show
 * "Advanced interpretation not available for this combination yet."
 */
export function interpretBnnTheme(hit: BnnThemeHit): {
  title: string;
  traditional: string;
  why: string;
  limitation: string | null;
} {
  return {
    title: hit.title,
    traditional: hit.manifestation,
    why: hit.why,
    limitation: hit.patterns.length
      ? null
      : "Advanced interpretation not available for this combination yet.",
  };
}
