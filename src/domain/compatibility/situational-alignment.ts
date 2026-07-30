/**
 * Optional situational preference Q&A — complements Vedic compatibility.
 * Not required for discovery; used when both partners have completed it.
 */

export type SituationalQuestion = {
  id: string;
  theme: string;
  graha: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  /** Option ids that are considered compatible with each other (including self). */
  compatibleGroups: string[][];
};

export const SITUATIONAL_QUESTIONS: SituationalQuestion[] = [
  {
    id: "after_disagreement",
    theme: "Conflict & calm",
    graha: "Moon · Mars",
    prompt: "After a disagreement in the evening, what feels most natural to you?",
    options: [
      { id: "talk_now", label: "Talk it through calmly the same evening" },
      { id: "space_then_talk", label: "Take a little space, then reconnect" },
      { id: "write_first", label: "Write my thoughts first, then speak" },
      { id: "sleep_reset", label: "Sleep on it and revisit with a clear mind" },
    ],
    compatibleGroups: [
      ["talk_now", "write_first"],
      ["space_then_talk", "sleep_reset", "write_first"],
    ],
  },
  {
    id: "free_weekend",
    theme: "Shared joy",
    graha: "Venus",
    prompt: "On a free weekend together, what would you prefer most often?",
    options: [
      { id: "quiet_home", label: "Quiet time at home — cook, rest, talk" },
      { id: "nature", label: "Nature walk, picnic, or a short trip" },
      { id: "social", label: "Meet friends or family" },
      { id: "culture", label: "Cafe, film, music, or something cultural" },
    ],
    compatibleGroups: [
      ["quiet_home", "nature"],
      ["nature", "culture"],
      ["social", "culture"],
      ["quiet_home", "culture"],
    ],
  },
  {
    id: "family_gathering",
    theme: "Family harmony",
    graha: "Jupiter · Saturn",
    prompt: "A festival is coming and both families want time with you. You lean toward…",
    options: [
      { id: "split_fair", label: "Split time fairly between both sides" },
      { id: "host_together", label: "Host or gather everyone together if possible" },
      { id: "alternate_years", label: "Alternate years / clear rotation" },
      { id: "decide_together", label: "Decide case by case with my partner" },
    ],
    compatibleGroups: [
      ["split_fair", "alternate_years", "decide_together"],
      ["host_together", "decide_together"],
    ],
  },
  {
    id: "money_surprise",
    theme: "Money mindset",
    graha: "Saturn · Venus",
    prompt: "An unexpected expense comes up. Your first instinct is to…",
    options: [
      { id: "plan_budget", label: "Review the budget and plan calmly" },
      { id: "discuss_split", label: "Discuss openly how to share it" },
      { id: "absorb_if_able", label: "Cover what I can if I am able, then talk" },
      { id: "pause_spend", label: "Pause other spending until it is handled" },
    ],
    compatibleGroups: [
      ["plan_budget", "discuss_split", "pause_spend"],
      ["discuss_split", "absorb_if_able"],
    ],
  },
  {
    id: "stress_support",
    theme: "Emotional support",
    graha: "Moon",
    prompt: "When you are stressed, what kind of support helps most?",
    options: [
      { id: "listen", label: "Someone who listens without fixing" },
      { id: "practical", label: "Practical help — take a task off my plate" },
      { id: "encourage", label: "Gentle encouragement and perspective" },
      { id: "alone_then", label: "Quiet alone time first, then company" },
    ],
    compatibleGroups: [
      ["listen", "encourage"],
      ["practical", "encourage"],
      ["alone_then", "listen"],
    ],
  },
  {
    id: "social_energy",
    theme: "Social pace",
    graha: "Mercury · Moon",
    prompt: "Friends invite you to a lively gathering on a weeknight. You usually…",
    options: [
      { id: "go_gladly", label: "Go gladly — I recharge with people" },
      { id: "go_sometimes", label: "Go sometimes if energy allows" },
      { id: "prefer_quiet", label: "Prefer a quiet evening unless it matters" },
      { id: "partner_sync", label: "Check with my partner and decide together" },
    ],
    compatibleGroups: [
      ["go_gladly", "go_sometimes", "partner_sync"],
      ["go_sometimes", "prefer_quiet", "partner_sync"],
    ],
  },
  {
    id: "career_travel",
    theme: "Duty & growth",
    graha: "Saturn · Jupiter",
    prompt: "A good career opportunity needs travel or longer hours for a season. You…",
    options: [
      { id: "discuss_balance", label: "Discuss balance and a time limit with my partner" },
      { id: "seize_growth", label: "Lean into growth if the long-term gain is clear" },
      { id: "protect_home", label: "Protect home rhythm unless it is essential" },
      { id: "shared_plan", label: "Build a shared plan so neither feels alone" },
    ],
    compatibleGroups: [
      ["discuss_balance", "shared_plan"],
      ["seize_growth", "discuss_balance", "shared_plan"],
      ["protect_home", "discuss_balance", "shared_plan"],
    ],
  },
  {
    id: "morning_tone",
    theme: "Daily rhythm",
    graha: "Sun · Jupiter",
    prompt: "What morning tone do you hope a partnership supports?",
    options: [
      { id: "ritual", label: "A calm ritual — prayer, tea, or quiet start" },
      { id: "active", label: "Active start — walk, exercise, early tasks" },
      { id: "flexible", label: "Flexible — each person finds their pace" },
      { id: "together_slow", label: "Slow together time when schedules allow" },
    ],
    compatibleGroups: [
      ["ritual", "together_slow", "flexible"],
      ["active", "flexible"],
      ["together_slow", "flexible"],
    ],
  },
];

export const SITUATIONAL_MIN_ANSWERS = 6;

export type SituationalAnswers = Record<string, string>;

export function isSituationalComplete(answers: SituationalAnswers | null | undefined): boolean {
  if (!answers) return false;
  const count = SITUATIONAL_QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return typeof v === "string" && v.length > 0;
  }).length;
  return count >= SITUATIONAL_MIN_ANSWERS;
}

function optionsCompatible(question: SituationalQuestion, a: string, b: string): boolean {
  if (a === b) return true;
  return question.compatibleGroups.some((group) => group.includes(a) && group.includes(b));
}

export type SituationalCompareResult = {
  score: number;
  answeredTogether: number;
  aligned: number;
  soft: number;
  gaps: number;
  highlights: string[];
  discuss: string[];
};

export function compareSituationalAnswers(
  mine: SituationalAnswers | null | undefined,
  theirs: SituationalAnswers | null | undefined,
): SituationalCompareResult | null {
  if (!isSituationalComplete(mine) || !isSituationalComplete(theirs)) return null;

  let aligned = 0;
  let soft = 0;
  let gaps = 0;
  const highlights: string[] = [];
  const discuss: string[] = [];

  for (const q of SITUATIONAL_QUESTIONS) {
    const a = mine?.[q.id];
    const b = theirs?.[q.id];
    if (!a || !b) {
      gaps += 1;
      continue;
    }
    if (a === b) {
      aligned += 1;
      if (highlights.length < 3) {
        highlights.push(`${q.theme}: you share a similar instinct`);
      }
    } else if (optionsCompatible(q, a, b)) {
      soft += 1;
      if (highlights.length < 3) {
        highlights.push(`${q.theme}: complementary styles (${q.graha})`);
      }
    } else {
      gaps += 1;
      if (discuss.length < 3) {
        discuss.push(`${q.theme}: worth a gentle conversation`);
      }
    }
  }

  const answeredTogether = aligned + soft + gaps;
  if (!answeredTogether) return null;

  // Exact align 100, soft compatible ~72, gap ~38 — weighted average
  const score = Math.round((aligned * 100 + soft * 72 + gaps * 38) / answeredTogether);

  return {
    score: Math.max(0, Math.min(100, score)),
    answeredTogether,
    aligned,
    soft,
    gaps,
    highlights,
    discuss,
  };
}
