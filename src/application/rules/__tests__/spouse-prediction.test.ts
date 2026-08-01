import { describe, expect, it } from "vitest";

import { predictSpouseTendencies } from "@/application/rules/spouse-prediction";

describe("spouse tendencies", () => {
  it("leans love + foreign when Rahu/Venus hit 5–7–12", () => {
    const result = predictSpouseTendencies({
      lagnaSign: "Aries",
      planets: [
        { planet: "Venus", sign: "Leo", house: 5 },
        { planet: "Rahu", sign: "Libra", house: 7 },
        { planet: "Jupiter", sign: "Pisces", house: 12 },
        { planet: "Saturn", sign: "Capricorn", house: 10 },
        { planet: "Moon", sign: "Cancer", house: 4 },
      ],
    });
    expect(result.marriagePath).toBe("love");
    expect(result.spouseOrigin).toBe("foreign");
    expect(result.marriagePathLabel).toMatch(/Love/i);
    expect(result.spouseOriginLabel).toMatch(/another place|culture/i);
  });

  it("leans arranged + same culture with Saturn/Jupiter on family houses", () => {
    const result = predictSpouseTendencies({
      lagnaSign: "Aries",
      planets: [
        { planet: "Saturn", sign: "Libra", house: 7 },
        { planet: "Jupiter", sign: "Taurus", house: 2 },
        { planet: "Venus", sign: "Taurus", house: 2 },
        { planet: "Moon", sign: "Cancer", house: 4 },
        { planet: "Rahu", sign: "Aquarius", house: 11 },
      ],
    });
    expect(result.marriagePath).toBe("arranged");
    expect(["same_culture", "mixed"]).toContain(result.spouseOrigin);
  });
});
