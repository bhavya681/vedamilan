/**
 * Shared helpers so every AI surface answers the *actual* question —
 * no identical chart dump for unrelated prompts.
 */

export type ChatTurn = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
};

export type QuestionIntent =
  | "greeting"
  | "identity"
  | "general"
  | "math"
  | "thanks"
  | "astrology"
  | "relationship"
  | "career"
  | "timing"
  | "compatibility"
  | "product"
  | "wisdom"
  | "unknown";

const ASTRO_RE =
  /\b(kundli|horoscope|chart|lagna|ascendant|moon|sun|mars|venus|jupiter|saturn|rahu|ketu|nakshatra|dasha|mahadasha|antardasha|gochar|transit|yoga|dosha|manglik|planet|house|rashi|guna|ashta|milan|birth|jyotish|vedic|astrolog)/i;

const RELATIONSHIP_RE =
  /\b(marri|partner|spouse|relat|love|7th|vivah|wedding|compat|boyfriend|girlfriend|husband|wife)/i;

const CAREER_RE = /\b(career|job|work|business|office|success|promotion|money|finance|wealth)/i;

const TIMING_RE =
  /\b(when|timing|this (month|year|week)|now|soon|muhurta|gochar|transit|dasha|window)/i;

const PRODUCT_RE =
  /\b(vedamilan|how (do|does|to)|sign ?up|login|premium|billing|profile|photo|match|shortlist)/i;

const GREETING_RE = /^(hi|hello|hey|namaste|namaskar|good (morning|afternoon|evening)|hola)\b/i;

const THANKS_RE = /^(thanks|thank you|thx|ok|okay|great|got it|cool)\b/i;

const IDENTITY_RE =
  /\b(who are you|what are you|your name|are you (an )?ai|what can you (do|help))\b/i;

/** Simple arithmetic like "4+4", "what is 12*3", "2 + 2 = ?" */
const MATH_RE =
  /(?:what(?:'s| is)\s+)?(-?\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(-?\d+(?:\.\d+)?)\s*\??$/i;

export function classifyQuestionIntent(message: string): QuestionIntent {
  const q = message.trim();
  if (!q) return "unknown";
  if (GREETING_RE.test(q) && q.length < 40) return "greeting";
  if (THANKS_RE.test(q) && q.length < 40) return "thanks";
  if (IDENTITY_RE.test(q)) return "identity";
  if (MATH_RE.test(q.replace(/\s+/g, " ").trim())) return "math";
  if (PRODUCT_RE.test(q) && !ASTRO_RE.test(q)) return "product";
  if (RELATIONSHIP_RE.test(q) || /\bcompat/.test(q)) return "relationship";
  if (CAREER_RE.test(q)) return "career";
  if (TIMING_RE.test(q) && (ASTRO_RE.test(q) || TIMING_RE.test(q))) return "timing";
  if (ASTRO_RE.test(q)) return "astrology";
  if (
    /\b(dharma|wisdom|reflect|meditat|peace|anger|angry|conflict|duty|principle|virtue|sage|rishi|decide|decision|should i|advice|relationship|family|fear|worry|stress|how to|what should)\b/i.test(
      q,
    )
  ) {
    return "wisdom";
  }
  // Short non-astro questions → treat as general (answer directly)
  if (q.length < 120 && !ASTRO_RE.test(q) && !RELATIONSHIP_RE.test(q)) return "general";
  return "unknown";
}

export function needsAstrologyTools(intent: QuestionIntent): boolean {
  return (
    intent === "astrology" ||
    intent === "relationship" ||
    intent === "career" ||
    intent === "timing" ||
    intent === "compatibility" ||
    intent === "unknown"
  );
}

export function trySolveMath(message: string): string | null {
  const cleaned = message.replace(/\s+/g, " ").trim();
  const m = MATH_RE.exec(cleaned);
  if (!m) return null;
  const a = Number(m[1]);
  const op = m[2];
  const b = Number(m[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  let result: number;
  switch (op) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
    case "x":
    case "×":
      result = a * b;
      break;
    case "/":
    case "÷":
      if (b === 0)
        return "Division by zero is undefined. Ask me something else — or a chart question when you are ready.";
      result = a / b;
      break;
    default:
      return null;
  }
  const pretty = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(6)));
  return `**${a} ${op === "x" || op === "×" ? "×" : op === "/" || op === "÷" ? "÷" : op} ${b} = ${pretty}.**\n\nI can also help with your Kundli, dashas, compatibility, or timing when you want Vedic guidance.`;
}

export function formatChatHistory(
  messages: ChatTurn[],
  options?: { limit?: number; excludeLastUser?: boolean },
): string {
  const limit = options?.limit ?? 10;
  let turns = messages.filter((m) => m.role === "user" || m.role === "assistant");
  if (options?.excludeLastUser && turns.length && turns[turns.length - 1]?.role === "user") {
    turns = turns.slice(0, -1);
  }
  const slice = turns.slice(-limit);
  if (!slice.length) return "";
  return slice
    .map((m) => `${m.role === "user" ? "Member" : "Assistant"}: ${m.content.slice(0, 1200)}`)
    .join("\n");
}

export function buildGuruSystemDirectives(intent: QuestionIntent): string {
  const lines = [
    "You are a professional Vedic astrologer assistant for VedaMilan (branded AI Guru).",
    "ANSWER THE MEMBER'S ACTUAL QUESTION FIRST. Never ignore the question to dump a chart overview.",
    "Do not repeat the same chart summary you already gave earlier in this conversation unless they ask for an overview again.",
    "If the question is general (math, definitions, non-astrology), answer it correctly and briefly, then optionally offer Vedic help.",
    "For astrology questions: use tools for facts; explain like a calm professional jyotishi — clear, respectful, never fear-mongering.",
    "Prefer 'may suggest' / 'often indicates' — never absolute predictions or guarantees.",
  ];

  if (!needsAstrologyTools(intent)) {
    lines.push(
      "This question does NOT require chart tools. Answer directly without calling astrology tools.",
    );
  } else {
    lines.push(
      "This question is astrology-related. Call the relevant tool(s) before stating chart facts.",
    );
  }

  return lines.join("\n");
}

export function buildWisdomSystemDirectives(intent: QuestionIntent): string {
  return [
    "PRIORITY: Answer the member's ACTUAL question first — concrete, to the point, tied to their words.",
    "Do NOT recycle a generic reflection, biography, or the same principle for every prompt.",
    "Do NOT use a fixed five-heading template. Vary openings. Stay under ~180 words unless they ask for depth.",
    "Never fill with polite unrelated wisdom. If the question is about X, every sentence must help with X.",
    "If they ask something factual or simple (e.g. arithmetic), answer correctly first; add a light wisdom lens only if natural.",
    "Stay as an AI guide inspired by the named tradition — never claim to be the historical figure.",
    "If prior assistant replies in history used the same opening/principle, choose a different angle that still answers THIS question.",
    "Do NOT write the legal disclaimer yourself — the system appends it.",
    intent === "math" || intent === "general" || intent === "greeting" || intent === "thanks"
      ? "Keep wisdom framing light; prioritize a correct, direct answer."
      : "Use only the guide themes that illuminate THIS scenario; ignore unrelated teachings.",
  ].join("\n");
}
