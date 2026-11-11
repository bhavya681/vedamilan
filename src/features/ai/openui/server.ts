import { createParser, type ParseResult } from "@openuidev/lang-core";

import { createGuruPromptLibrary } from "./contracts";

/** Built once — prompt generation and the parser memoize by library identity. */
const promptLibrary = createGuruPromptLibrary();
const parser = createParser(promptLibrary.toJSONSchema(), promptLibrary.root);

const EXAMPLES = [
  [
    "root = Stack([summary, facts, note, follow])",
    'summary = TextBlock("Your current **Venus Mahadasha** supports softening old defences and choosing partnerships with care.")',
    "facts = StatGrid([lagna, moon, dasha])",
    'lagna = StatCard("Lagna", "Libra", "How others first meet you")',
    'moon = StatCard("Moon", "Rohini", "Your emotional rhythm")',
    'dasha = StatCard("Mahadasha", "Venus", "Until March 2031")',
    'note = Callout("insight", "What this suggests", "Let warmth lead, but keep practical alignment checks alongside attraction.")',
    'follow = FollowUpChips(["What does Venus in the 7th house mean?", "Which marriage window is strongest?"])',
  ].join("\n"),
  [
    "root = Stack([intro, score, windows, steps])",
    'intro = TextBlock("The rule engine rates this alliance **78/100** overall, with strong emotional and family alignment.")',
    'score = ScoreGauge("Compatibility", 78, "Supportive overall — review the one caution below.")',
    'windows = TimingList([w1], "Marriage windows")',
    'w1 = TimingWindow("2027 - favourable", "Jupiter / Venus support", 82, "Steady growth in family discussions")',
    'steps = InsightList(["Discuss practical goals early", "Compare both charts before fixing muhurta"], "Next steps")',
  ].join("\n"),
];

/**
 * System prompt that teaches the model the exact OpenUI Lang output contract.
 * Kept server-side so the client bundle never needs prompt-generation code.
 */
export function getGuruUiSystemPrompt(): string {
  return promptLibrary.prompt({
    preamble: [
      "You are AI Guru, VedaMilan's professional Vedic astrology guide.",
      "Compose every reply as one OpenUI Lang program using only the components listed below.",
      "The program renders directly inside a chat interface, so structure matters more than prose volume.",
    ].join(" "),
    additionalRules: [
      "Return ONLY the OpenUI Lang program. No markdown fences, no commentary before or after it.",
      "Start with the root statement on the first line: root = Stack([...]).",
      "Every referenced name must be defined exactly once and reachable from root.",
      "Keep the reply focused: one short TextBlock summary, then only the structured blocks that genuinely help.",
      "Use tool output for chart facts. Never invent planets, dashas, gunas, yogas, or scores.",
      "Keep sentences calm, plain, and concise. Prefer 'may suggest' over certainty.",
      "Do not include the Vedic disclaimer — the interface shows it below the reply.",
      "String values use double quotes. Escape newlines as \\n when a TextBlock needs a paragraph break.",
      "Finish with 2-4 FollowUpChips when a useful next question exists.",
    ],
    examples: EXAMPLES,
  });
}

export type GuruUiPayload = {
  format: "openui";
  code: string;
  errors: number;
};

function stripFences(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:openui|openui-lang|txt)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? trimmed).trim();
}

/** Find the OpenUI program inside a model response, tolerating stray prose/fences. */
export function extractOpenUiCode(raw: string): string | null {
  const withoutFences = stripFences(raw);
  const rootIndex = withoutFences.search(/^root\s*=/m);
  if (rootIndex === -1) return null;

  const candidate = withoutFences.slice(rootIndex).trim();
  if (!candidate) return null;

  // Drop a trailing closing fence or obvious prose that follows the program.
  const lines = candidate.split(/\r?\n/);
  const kept: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) break;
    if (
      kept.length > 0 &&
      trimmed &&
      !/^(root|[A-Za-z_$][\w$]*)\s*=/.test(trimmed) &&
      !/^[\s})\],]+/.test(line) &&
      !/^["']/.test(trimmed)
    ) {
      break;
    }
    kept.push(line);
  }

  return kept.join("\n").trim();
}

export function parseGuruUiOutput(raw: string): GuruUiPayload | null {
  const code = extractOpenUiCode(raw);
  if (!code) return null;

  let result: ParseResult;
  try {
    result = parser.parse(code);
  } catch {
    return null;
  }

  if (!result.root) return null;
  const errors = result.meta.errors.filter((error) => error.severity !== "warning").length;

  return { format: "openui", code, errors };
}

/** Turn a plain-text fallback answer into a valid, minimal OpenUI program. */
export function buildFallbackGuruUi(
  markdown: string,
  prompts: string[] = [],
): GuruUiPayload | null {
  const safePrompts = prompts.filter(Boolean).slice(0, 4);
  const lines = [
    safePrompts.length ? "root = Stack([body, follow])" : "root = Stack([body])",
    `body = TextBlock(${JSON.stringify(markdown.trim())})`,
  ];
  if (safePrompts.length) {
    lines.push(`follow = FollowUpChips(${JSON.stringify(safePrompts)})`);
  }

  const code = lines.join("\n");
  let result: ParseResult;
  try {
    result = parser.parse(code);
  } catch {
    return null;
  }
  if (!result.root) return null;

  return { format: "openui", code, errors: 0 };
}
