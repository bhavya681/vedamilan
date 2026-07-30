import { describe, expect, it } from "vitest";

import {
  SITUATIONAL_QUESTIONS,
  compareSituationalAnswers,
  isSituationalComplete,
} from "@/domain/compatibility/situational-alignment";

describe("situational alignment", () => {
  it("requires minimum answers to complete", () => {
    expect(isSituationalComplete({})).toBe(false);
    const partial: Record<string, string> = {};
    for (const q of SITUATIONAL_QUESTIONS.slice(0, 5)) {
      partial[q.id] = q.options[0]!.id;
    }
    expect(isSituationalComplete(partial)).toBe(false);
    for (const q of SITUATIONAL_QUESTIONS.slice(5, 6)) {
      partial[q.id] = q.options[0]!.id;
    }
    expect(isSituationalComplete(partial)).toBe(true);
  });

  it("scores identical answers highly", () => {
    const answers: Record<string, string> = {};
    for (const q of SITUATIONAL_QUESTIONS) {
      answers[q.id] = q.options[0]!.id;
    }
    const result = compareSituationalAnswers(answers, answers);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(90);
    expect(result!.aligned).toBe(SITUATIONAL_QUESTIONS.length);
  });
});
