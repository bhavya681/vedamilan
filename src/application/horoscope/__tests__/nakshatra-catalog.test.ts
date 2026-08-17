import { describe, expect, it } from "vitest";
import {
  nakshatraNadi,
  padaNavamsa,
  padaPurushartha,
  vimshottariLordOf,
  vimshottariYearsOf,
} from "../nakshatra-catalog";

describe("nakshatra catalog helpers", () => {
  it("maps Vimshottari lords from Ashwini = Ketu", () => {
    expect(vimshottariLordOf("Ashwini")).toBe("Ketu");
    expect(vimshottariLordOf("Bharani")).toBe("Venus");
    expect(vimshottariLordOf("Magha")).toBe("Ketu");
    expect(vimshottariYearsOf("Ashwini")).toBe(7);
  });

  it("cycles nadi Adi / Madhya / Antya", () => {
    expect(nakshatraNadi("Ashwini")).toBe("Adi");
    expect(nakshatraNadi("Bharani")).toBe("Madhya");
    expect(nakshatraNadi("Krittika")).toBe("Antya");
    expect(nakshatraNadi("Rohini")).toBe("Adi");
  });

  it("maps pada to navamsa and purushartha", () => {
    expect(padaNavamsa("Ashwini", 1)).toBe("Aries");
    expect(padaNavamsa("Ashwini", 4)).toBe("Cancer");
    expect(padaPurushartha(1)).toBe("Dharma");
    expect(padaPurushartha(4)).toBe("Moksha");
  });
});
