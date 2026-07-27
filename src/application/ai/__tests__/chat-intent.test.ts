import { describe, expect, it } from "vitest";

import {
  classifyQuestionIntent,
  needsAstrologyTools,
  trySolveMath,
} from "@/application/ai/chat-intent";

describe("chat-intent", () => {
  it("solves simple arithmetic", () => {
    expect(trySolveMath("4+4")).toContain("= 8");
    expect(trySolveMath("what is 12 * 3?")).toContain("= 36");
    expect(trySolveMath("10/2")).toContain("= 5");
  });

  it("classifies intents without treating math as astrology", () => {
    expect(classifyQuestionIntent("4+4")).toBe("math");
    expect(needsAstrologyTools(classifyQuestionIntent("4+4"))).toBe(false);
    expect(classifyQuestionIntent("What does my Mahadasha mean?")).toBe("astrology");
    expect(classifyQuestionIntent("When is a good time this year?")).toBe("timing");
    expect(classifyQuestionIntent("Namaste")).toBe("greeting");
  });
});
