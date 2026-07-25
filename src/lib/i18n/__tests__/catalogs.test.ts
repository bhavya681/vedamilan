import { describe, expect, it } from "vitest";

import { getMessages } from "@/lib/i18n/get-messages";
import {
  createTranslateFn,
  localizeDecisionSummary,
  localizeGender,
  localizeNotification,
  localizeReasonCode,
} from "@/lib/i18n/catalogs/localize";
import { decisionSummaryCodeFromLabel, moodCodeFromScore } from "@/lib/i18n/catalogs/codes";
import { scoreAshtaKoota } from "@/application/rules/ashta-koota";
import { scoreDeepCompatibility } from "@/application/rules/deep-compatibility";

describe("i18n catalogs", () => {
  it("maps verdict labels to stable codes", () => {
    expect(decisionSummaryCodeFromLabel("Excellent Match")).toBe("excellent_match");
    expect(moodCodeFromScore(90)).toBe("excellent");
  });

  it("localizes enums and verdicts in Hindi", async () => {
    const messages = await getMessages("hi");
    const t = createTranslateFn(messages);
    expect(localizeGender(t, "MALE")).toBe("पुरुष");
    expect(localizeDecisionSummary(t, "excellent_match")).toContain("उत्कृष्ट");
    expect(localizeReasonCode(t, "kootaStrong.Varna")).toContain("वर्ण");
  });

  it("localizes notifications from type + payload", async () => {
    const messages = await getMessages("es");
    const t = createTranslateFn(messages);
    const copy = localizeNotification(t, {
      type: "INTEREST",
      title: "New Interest",
      body: "Ada is interested",
      data: { senderName: "Ada" },
    });
    expect(copy.title.toLowerCase()).toContain("interés");
    expect(copy.body).toContain("Ada");
  });

  it("ashta koota emits strengthCodes for localization", () => {
    const result = scoreAshtaKoota({
      moonSignA: "Aries",
      moonSignB: "Leo",
      nakshatraA: "Ashwini",
      nakshatraB: "Magha",
      manglikA: "NON_MANGLIK",
      manglikB: "NON_MANGLIK",
    });
    expect(Array.isArray(result.strengthCodes)).toBe(true);
    expect(Array.isArray(result.challengeCodes)).toBe(true);
  });

  it("deep compatibility returns decisionSummaryCode", () => {
    const chart = {
      lagnaSign: "Aries",
      moonSign: "Taurus",
      sunSign: "Gemini",
      manglikStatus: "NON_MANGLIK",
      planets: [
        { planet: "Sun", sign: "Gemini", house: 3 },
        { planet: "Moon", sign: "Taurus", house: 2 },
        { planet: "Venus", sign: "Cancer", house: 4 },
        { planet: "Mars", sign: "Aries", house: 1 },
      ],
    };
    const deep = scoreDeepCompatibility({
      chartA: chart,
      chartB: { ...chart, moonSign: "Cancer" },
      gunaBreakdown: [
        { koota: "Varna", score: 1, max: 1, note: "" },
        { koota: "Vashya", score: 2, max: 2, note: "" },
        { koota: "Tara", score: 3, max: 3, note: "" },
        { koota: "Yoni", score: 4, max: 4, note: "" },
        { koota: "Graha Maitri", score: 5, max: 5, note: "" },
        { koota: "Gana", score: 6, max: 6, note: "" },
        { koota: "Bhakoot", score: 7, max: 7, note: "" },
        { koota: "Nadi", score: 8, max: 8, note: "" },
      ],
      totalGuna: 36,
      maxGuna: 36,
    });
    expect(deep.decisionSummaryCode).toMatch(/_match|effort|challenge|recommended/);
  });

  it("loads new namespaces for all launch locales", async () => {
    for (const locale of ["en", "hi", "mr", "es", "sa"] as const) {
      const messages = await getMessages(locale);
      expect(messages.enums).toBeTruthy();
      expect(messages.notifications).toBeTruthy();
      expect(createTranslateFn(messages)("compatibility.verdicts.good_match")).toBeTruthy();
    }
  });
});
