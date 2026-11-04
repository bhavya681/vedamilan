import type { LifeNeedId } from "./sage-alignment";

export const LIFE_NEED_QUESTIONS: Record<LifeNeedId, string> = {
  relationship:
    "Someone I care about and I keep misunderstanding each other. How do I respond without losing myself?",
  career: "I am stuck between stability and a meaningful change at work. How should I decide?",
  inner: "I keep replaying a mistake and cannot settle. How do I move forward without avoiding it?",
  duty: "I feel torn between family expectations and what is right for me. What is my duty here?",
  inquiry:
    "I want to understand what I actually value, not only what I was told to value. Where do I start?",
  astrology:
    "I am in a difficult season and want perspective without treating it as fate. How should I hold it?",
};

export const COUNCIL_QUESTION_STARTERS = [
  "I keep postponing a decision that matters. How do I move forward without regret?",
  "A relationship in my life feels strained. What should I change first?",
  "I want to be more consistent with a habit I know is good for me. Where do I start?",
  "I am afraid of disappointing my family. How do I stay honest and kind?",
] as const;

export const PRACTICAL_WISDOM_PROMPTS: Array<{
  need: LifeNeedId;
  title: string;
  question: string;
}> = [
  {
    need: "career",
    title: "A decision at work",
    question: LIFE_NEED_QUESTIONS.career,
  },
  {
    need: "relationship",
    title: "A strained relationship",
    question: LIFE_NEED_QUESTIONS.relationship,
  },
  {
    need: "duty",
    title: "Family expectations",
    question: LIFE_NEED_QUESTIONS.duty,
  },
  {
    need: "inner",
    title: "A restless mind",
    question: LIFE_NEED_QUESTIONS.inner,
  },
];
