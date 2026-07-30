/**
 * Demo situational-alignment answers for popular celebrity showcase profiles.
 * Interpretive / testing only — not claimed personal statements from real people.
 */

import type { SituationalAnswers } from "@/domain/compatibility/situational-alignment";
import { SITUATIONAL_QUESTIONS } from "@/domain/compatibility/situational-alignment";

/** Shorthand builder — fills every question id. */
function sit(answers: {
  after_disagreement: string;
  free_weekend: string;
  family_gathering: string;
  money_surprise: string;
  stress_support: string;
  social_energy: string;
  career_travel: string;
  morning_tone: string;
}): SituationalAnswers {
  return { ...answers };
}

/**
 * Popular celeb demo ids → complete situational quiz answers.
 * Only these get seeded; other demos remain without situational (filterable out).
 */
export const CELEB_SITUATIONAL_ANSWERS: Record<string, SituationalAnswers> = {
  // ── Indian film / sport (core popular) ─────────────────────────────────────
  c_deepika: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "listen",
    social_energy: "prefer_quiet",
    career_travel: "discuss_balance",
    morning_tone: "ritual",
  }),
  c_ranveer: sit({
    after_disagreement: "talk_now",
    free_weekend: "social",
    family_gathering: "host_together",
    money_surprise: "absorb_if_able",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "seize_growth",
    morning_tone: "flexible",
  }),
  c_alia: sit({
    after_disagreement: "write_first",
    free_weekend: "culture",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "listen",
    social_energy: "go_sometimes",
    career_travel: "shared_plan",
    morning_tone: "together_slow",
  }),
  c_ranbir: sit({
    after_disagreement: "sleep_reset",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "protect_home",
    morning_tone: "flexible",
  }),
  c_priyanka: sit({
    after_disagreement: "talk_now",
    free_weekend: "culture",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "practical",
    social_energy: "go_sometimes",
    career_travel: "seize_growth",
    morning_tone: "active",
  }),
  c_virat: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "nature",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "practical",
    social_energy: "partner_sync",
    career_travel: "shared_plan",
    morning_tone: "active",
  }),
  c_anushka: sit({
    after_disagreement: "talk_now",
    free_weekend: "quiet_home",
    family_gathering: "host_together",
    money_surprise: "discuss_split",
    stress_support: "listen",
    social_energy: "prefer_quiet",
    career_travel: "discuss_balance",
    morning_tone: "ritual",
  }),
  c_katrina: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "nature",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "encourage",
    social_energy: "go_sometimes",
    career_travel: "discuss_balance",
    morning_tone: "active",
  }),
  c_vicky: sit({
    after_disagreement: "talk_now",
    free_weekend: "quiet_home",
    family_gathering: "host_together",
    money_surprise: "absorb_if_able",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "shared_plan",
    morning_tone: "flexible",
  }),
  c_kiara: sit({
    after_disagreement: "write_first",
    free_weekend: "culture",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "listen",
    social_energy: "go_sometimes",
    career_travel: "discuss_balance",
    morning_tone: "together_slow",
  }),
  c_sidharth: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "nature",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "protect_home",
    morning_tone: "flexible",
  }),
  c_shraddha: sit({
    after_disagreement: "sleep_reset",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "listen",
    social_energy: "prefer_quiet",
    career_travel: "discuss_balance",
    morning_tone: "ritual",
  }),
  c_ayushmann: sit({
    after_disagreement: "talk_now",
    free_weekend: "culture",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "encourage",
    social_energy: "go_sometimes",
    career_travel: "shared_plan",
    morning_tone: "flexible",
  }),
  c_rashmika: sit({
    after_disagreement: "talk_now",
    free_weekend: "social",
    family_gathering: "host_together",
    money_surprise: "discuss_split",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "seize_growth",
    morning_tone: "active",
  }),
  c_dulquer: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "culture",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "listen",
    social_energy: "go_sometimes",
    career_travel: "discuss_balance",
    morning_tone: "flexible",
  }),
  c_dhoni: sit({
    after_disagreement: "sleep_reset",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "protect_home",
    morning_tone: "active",
  }),
  c_nayanthara: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "discuss_balance",
    morning_tone: "ritual",
  }),
  c_allu: sit({
    after_disagreement: "talk_now",
    free_weekend: "social",
    family_gathering: "host_together",
    money_surprise: "absorb_if_able",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "seize_growth",
    morning_tone: "active",
  }),
  c_samantha: sit({
    after_disagreement: "write_first",
    free_weekend: "nature",
    family_gathering: "split_fair",
    money_surprise: "discuss_split",
    stress_support: "listen",
    social_energy: "partner_sync",
    career_travel: "shared_plan",
    morning_tone: "active",
  }),
  c_shahid: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "protect_home",
    morning_tone: "flexible",
  }),
  c_sindhu: sit({
    after_disagreement: "talk_now",
    free_weekend: "nature",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "practical",
    social_energy: "go_sometimes",
    career_travel: "seize_growth",
    morning_tone: "active",
  }),
  c_neeraj: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "nature",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "practical",
    social_energy: "partner_sync",
    career_travel: "shared_plan",
    morning_tone: "active",
  }),
  c_arrahman: sit({
    after_disagreement: "sleep_reset",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "discuss_balance",
    morning_tone: "ritual",
  }),
  c_shreya: sit({
    after_disagreement: "write_first",
    free_weekend: "culture",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "listen",
    social_energy: "go_sometimes",
    career_travel: "discuss_balance",
    morning_tone: "ritual",
  }),

  // ── International popular ──────────────────────────────────────────────────
  i_zendaya: sit({
    after_disagreement: "talk_now",
    free_weekend: "culture",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "listen",
    social_energy: "partner_sync",
    career_travel: "shared_plan",
    morning_tone: "flexible",
  }),
  i_holland: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "encourage",
    social_energy: "go_sometimes",
    career_travel: "discuss_balance",
    morning_tone: "flexible",
  }),
  i_taylorswift: sit({
    after_disagreement: "write_first",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "listen",
    social_energy: "prefer_quiet",
    career_travel: "seize_growth",
    morning_tone: "ritual",
  }),
  i_rihanna: sit({
    after_disagreement: "talk_now",
    free_weekend: "culture",
    family_gathering: "host_together",
    money_surprise: "absorb_if_able",
    stress_support: "practical",
    social_energy: "go_gladly",
    career_travel: "seize_growth",
    morning_tone: "flexible",
  }),
  i_therock: sit({
    after_disagreement: "talk_now",
    free_weekend: "nature",
    family_gathering: "host_together",
    money_surprise: "plan_budget",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "shared_plan",
    morning_tone: "active",
  }),
  i_hemsworth: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "nature",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "protect_home",
    morning_tone: "active",
  }),
  i_reynolds: sit({
    after_disagreement: "talk_now",
    free_weekend: "quiet_home",
    family_gathering: "host_together",
    money_surprise: "discuss_split",
    stress_support: "encourage",
    social_energy: "go_sometimes",
    career_travel: "shared_plan",
    morning_tone: "flexible",
  }),
  i_scarlett: sit({
    after_disagreement: "write_first",
    free_weekend: "culture",
    family_gathering: "split_fair",
    money_surprise: "plan_budget",
    stress_support: "listen",
    social_energy: "go_sometimes",
    career_travel: "discuss_balance",
    morning_tone: "flexible",
  }),
  i_lewishamilton: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "nature",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "seize_growth",
    morning_tone: "active",
  }),
  i_dualipa: sit({
    after_disagreement: "talk_now",
    free_weekend: "culture",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "seize_growth",
    morning_tone: "flexible",
  }),
  i_selenagomez: sit({
    after_disagreement: "sleep_reset",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "discuss_split",
    stress_support: "listen",
    social_energy: "prefer_quiet",
    career_travel: "discuss_balance",
    morning_tone: "together_slow",
  }),
  i_henrycavill: sit({
    after_disagreement: "space_then_talk",
    free_weekend: "quiet_home",
    family_gathering: "decide_together",
    money_surprise: "plan_budget",
    stress_support: "alone_then",
    social_energy: "prefer_quiet",
    career_travel: "protect_home",
    morning_tone: "flexible",
  }),
  // CJ Perry (Lana) — WWE / performer demo
  i_lana: sit({
    after_disagreement: "talk_now",
    free_weekend: "social",
    family_gathering: "host_together",
    money_surprise: "discuss_split",
    stress_support: "encourage",
    social_energy: "go_gladly",
    career_travel: "seize_growth",
    morning_tone: "active",
  }),
};

export function getDemoSituationalAnswers(demoId: string): SituationalAnswers | null {
  const answers = CELEB_SITUATIONAL_ANSWERS[demoId];
  if (!answers) return null;
  // Validate option ids exist
  for (const q of SITUATIONAL_QUESTIONS) {
    const v = answers[q.id];
    if (!v || !q.options.some((o) => o.id === v)) return null;
  }
  return answers;
}

export function listDemoSituationalIds(): string[] {
  return Object.keys(CELEB_SITUATIONAL_ANSWERS);
}
