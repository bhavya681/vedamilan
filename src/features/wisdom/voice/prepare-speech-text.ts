import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";

/**
 * Prepare guru reply text for TTS: keep only the spoken answer,
 * drop disclaimers, markdown chrome, and reflective fluff.
 */
export function prepareSpeechText(raw: string, maxChars = 900): string {
  let text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  if (text.includes(WISDOM_AI_DISCLAIMER)) {
    text = text.split(WISDOM_AI_DISCLAIMER)[0] || text;
  }
  text = text
    .replace(/Vedic Wisdom provides educational[\s\S]*$/i, "")
    .replace(/AI-generated responses are interpretations[\s\S]*$/i, "");

  text = text
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*\*\*[^*]+\*\*\s*:?\s*$/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(
      /^\s*(Direct answer|Principle|Next step|Reflect|Wisdom reflection|Explanation|Modern application|Invite)\s*:?\s*$/gim,
      "",
    )
    .replace(/^\s*You asked:\s*[“"'][^”"']*[”"']\s*$/gim, "")
    .replace(/^\s*\*\(AI interpretation[^)]*\)\*\s*$/gim, "")
    .replace(/^\s*\(AI interpretation[^)]*\)\s*$/gim, "");

  text = text.replace(/\n+\s*(Reflect|Reflection question)\s*:?\s*[\s\S]*$/i, "");

  text = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (text.length > maxChars) {
    const sliced = text.slice(0, maxChars);
    const lastStop = Math.max(
      sliced.lastIndexOf("।"),
      sliced.lastIndexOf("."),
      sliced.lastIndexOf("!"),
      sliced.lastIndexOf("?"),
    );
    text = (lastStop > maxChars * 0.5 ? sliced.slice(0, lastStop + 1) : sliced).trim();
  }

  return text;
}
