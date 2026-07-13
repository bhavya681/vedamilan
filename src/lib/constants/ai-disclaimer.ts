/**
 * Standard disclaimer appended to every AI astrology explanation.
 * AI never calculates charts — it only interprets engine output.
 */
export const VEDIC_AI_DISCLAIMER =
  "This is a traditional Vedic astrological interpretation and should not be considered a guarantee or factual prediction.";

export function withVedicDisclaimer(text: string): string {
  const trimmed = text.trim();
  if (trimmed.includes(VEDIC_AI_DISCLAIMER)) {
    return trimmed;
  }
  return `${trimmed}\n\n${VEDIC_AI_DISCLAIMER}`;
}
