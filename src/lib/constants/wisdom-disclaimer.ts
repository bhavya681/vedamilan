/** Educational / reflective AI — not historical quotation or professional advice. */
export const WISDOM_AI_DISCLAIMER =
  "Vedic Wisdom provides educational and reflective perspectives inspired by traditional teachings. AI-generated responses are interpretations and should not be treated as direct historical quotations, scripture citations, or professional advice.";

export function withWisdomDisclaimer(text: string): string {
  const trimmed = text.trim();
  if (trimmed.includes(WISDOM_AI_DISCLAIMER)) return trimmed;
  return `${trimmed}\n\n${WISDOM_AI_DISCLAIMER}`;
}
