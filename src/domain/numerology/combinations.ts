/**
 * Mulank + Bhagyank combination logic.
 *
 * IMPORTANT: the knowledge base does not define every possible pair
 * as a fixed rule. Where no specific combination guidance is sourced,
 * we return `defined: false` so the UI can say:
 *
 *   "Detailed combination interpretation is not defined by the current
 *    knowledge source."
 *
 * Interaction themes that ARE provided below are derived from the
 * number→planet/theme data already in this module — they are contemporary
 * interpretive sketches, never deterministic compatibility rules.
 */

import { NUMBER_PROFILES } from "./interpretations";
import type { CombinationInterpretation, NumberId } from "./types";

const KEY = (mulank: number, bhagyank: number) => `${mulank}-${bhagyank}`;

/**
 * Curated interaction notes derived from number themes.
 * These are contemporary interpretive sketches grounded in the
 * number→planet mapping, not classical combination doctrines.
 */
const COMBINATION_NOTES: Record<string, Omit<CombinationInterpretation, "mulank" | "bhagyank">> = {
  [KEY(1, 1)]: {
    defined: true,
    interaction:
      "Your root and life-path energies are aligned under the Sun — a strong, self-directed path.",
    complement:
      "Both numbers reinforce initiative and leadership through a single, focused channel.",
    tension: "May lean toward impatience or taking on too much alone.",
    strengths: "Clarity of purpose and natural authority when leading.",
    practicalAdvice:
      "Channel the double solar energy into one clear goal; delegate rather than doing everything yourself.",
  },
  [KEY(2, 2)]: {
    defined: true,
    interaction:
      "Your root and life-path both flow through the Moon — deep emotional awareness and relational attunement.",
    complement: "Cooperative instincts and intuitive reading of people are amplified.",
    tension: "Over-accommodating others can dilute your own needs.",
    strengths: "Exceptional empathy and the ability to hold emotional space for others.",
    practicalAdvice:
      "Set one firm boundary per day — protect your energy to preserve your giving nature.",
  },
  [KEY(1, 2)]: {
    defined: true,
    interaction:
      "Sun (leadership) and Moon (cooperation) meet — initiative guided by emotional intelligence.",
    complement: "You lead with heart and consult before acting, balancing confidence with care.",
    tension: "Inner push-pull between asserting independence and seeking harmony.",
    strengths: "A natural bridge-builder who can lead teams through collaboration.",
    practicalAdvice:
      "Before making unilateral decisions (1), check in with your team (2) to maintain trust.",
  },
  [KEY(2, 1)]: {
    defined: true,
    interaction: "Moon and Sun — cooperation guided by inner clarity of direction.",
    complement: "You support others' visions while knowing your own path.",
    tension: "Wanting harmony can delay decisions that need direct action.",
    strengths: "Balanced partner who contributes both stability and gentle leadership.",
    practicalAdvice:
      "When harmony stalls action (2), lean into your core purpose (1) to move forward.",
  },
  [KEY(3, 6)]: {
    defined: true,
    interaction:
      "Guru (wisdom) and Shukra (harmony) — expressive wisdom that refines beauty and relationship.",
    complement: "Creative teaching combined with aesthetic and relational grace.",
    tension: "Enthusiasm (3) may outpace the patience that harmony (6) requires.",
    strengths: "Inspiring communicator who knows how to make others feel valued.",
    practicalAdvice: "Direct your teaching energy toward relationship-building spaces.",
  },
  [KEY(6, 3)]: {
    defined: true,
    interaction: "Shukra and Guru — harmonious wisdom that seeks beauty in ideas and sharing it.",
    complement: "You teach and inspire through beauty, art, and refined expression.",
    tension: "Over-focus on harmony may avoid necessary direct feedback.",
    strengths: "Warm mentor who makes learning feel nurturing.",
    practicalAdvice: "Balance nurturing others with your own creative expression.",
  },
  [KEY(4, 8)]: {
    defined: true,
    interaction:
      "Rahu (structure) and Saturn (discipline) — material and karmic endurance aligned.",
    complement: "Practical building reinforced by long-term discipline.",
    tension: "Ambition (4) and duty (8) can both push toward over-work.",
    strengths: "Reliable, results-oriented, and built to last.",
    practicalAdvice: "Schedule rest as a non-negotiable part of your structure.",
  },
  [KEY(7, 9)]: {
    defined: true,
    interaction:
      "Ketu (introspection) and Mars (courage) — quiet strength that protects through action.",
    complement: "Deep insight channeled into protective, decisive action.",
    tension: "Withdrawal (7) may conflict with the need for direct action (9).",
    strengths: "Discerning warrior who acts only when it matters.",
    practicalAdvice:
      "Before withdrawing (7), ask whether action (9) is needed to protect what matters.",
  },
  [KEY(5, 5)]: {
    defined: true,
    interaction:
      "Budha (communication) dominates both root and life-path — a message-focused, adaptive path.",
    complement: "Communication and adaptability reinforce each other at every turn.",
    tension: "Variety-seeking can scatter commitments across too many channels.",
    strengths: "Exceptional communicator and quick learner who thrives on change.",
    practicalAdvice: "Choose one primary communication medium and master it before moving on.",
  },
};

export function getCombination(mulank: NumberId, bhagyank: NumberId): CombinationInterpretation {
  const key = KEY(mulank, bhagyank);
  const noted = COMBINATION_NOTES[key];
  if (noted) {
    return { mulank, bhagyank, ...noted };
  }
  return {
    mulank,
    bhagyank,
    defined: false,
  };
}

/**
 * Generate a generic, respectful sketch when no specific pair is defined.
 * Uses only the number themes from the knowledge base — not invented rules.
 */
export function genericInteraction(
  mulank: NumberId,
  bhagyank: NumberId,
): CombinationInterpretation {
  const mProfile = NUMBER_PROFILES[mulank];
  const bProfile = NUMBER_PROFILES[bhagyank];

  if (mulank === bhagyank) {
    return {
      mulank,
      bhagyank,
      defined: false,
      interaction: `Both Mulank and Bhagyank are ${mulank} (${bProfile.planet}), so the root energy and life-path energy are the same — a unified expression of ${bProfile.theme}.`,
      strengths: "Single-pointed alignment can focus your efforts powerfully.",
      practicalAdvice:
        "Notice when the theme repeats too loudly and seek balance from other life areas.",
    };
  }

  return {
    mulank,
    bhagyank,
    defined: false,
    interaction: `Your root number (${mulank}, ${mProfile.planet} — ${mProfile.theme}) and life-path number (${bhagyank}, ${bProfile.planet} — ${bProfile.theme}) bring two planetary energies into dialogue.`,
    complement:
      "Different planetary themes can cover each other's blind spots when you stay curious.",
    strengths: `The mix gives you both the ${mProfile.theme} of your root self and the ${bProfile.theme} of your path.`,
    practicalAdvice: `When ${mProfile.theme} pushes ahead, pause to listen to ${bProfile.theme} — and vice versa.`,
  };
}

export function getCombinationOrGeneric(
  mulank: NumberId,
  bhagyank: NumberId,
): CombinationInterpretation {
  const specific = getCombination(mulank, bhagyank);
  if (specific.defined) return specific;
  return { ...genericInteraction(mulank, bhagyank), defined: false };
}
