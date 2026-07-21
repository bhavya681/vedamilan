import { describe, expect, it } from "vitest";

import { calculateProfileCompletion } from "@/application/profile/profile.service";
import {
  birthDetailsSchema,
  partnerPreferencesSchema,
  profileUpdateSchema,
} from "@/lib/validators/profile";

describe("Module 3 — profile completion", () => {
  it("scores empty profile low", () => {
    const result = calculateProfileCompletion({});
    expect(result.score).toBe(0);
    expect(result.isComplete).toBe(false);
    expect(result.missing.length).toBeGreaterThan(5);
  });

  it("marks complete when weighted fields filled", () => {
    const result = calculateProfileCompletion({
      about: "A".repeat(50),
      photos: [{ url: "x" }],
      city: "Bengaluru",
      profession: "Designer",
      education: "NID",
      religion: "Hindu",
      dateOfBirth: new Date("1996-01-01"),
      heightCm: 165,
      languages: ["English"],
    });
    expect(result.score).toBe(100);
    expect(result.isComplete).toBe(true);
    expect(result.requiresPhoto).toBe(false);
  });

  it("never marks complete without a photo", () => {
    const result = calculateProfileCompletion({
      about: "A".repeat(50),
      city: "Bengaluru",
      profession: "Designer",
      education: "NID",
      religion: "Hindu",
      dateOfBirth: new Date("1996-01-01"),
      heightCm: 165,
      languages: ["English"],
    });
    expect(result.requiresPhoto).toBe(true);
    expect(result.isComplete).toBe(false);
    expect(result.missing).toContain("photos");
  });
});

describe("Module 3 — validators", () => {
  it("accepts profile update payload", () => {
    const parsed = profileUpdateSchema.parse({
      profession: "Product Designer",
      city: "Bengaluru",
      about: "Seeking intentional partnership.",
    });
    expect(parsed.city).toBe("Bengaluru");
  });

  it("accepts preferences with age range", () => {
    const parsed = partnerPreferencesSchema.parse({ ageMin: 28, ageMax: 36, cities: ["Mumbai"] });
    expect(parsed.ageMax).toBe(36);
  });

  it("accepts birth details", () => {
    const parsed = birthDetailsSchema.parse({
      birthDate: "1996-03-12",
      birthTime: "14:32",
      placeName: "Bengaluru",
      latitude: 12.97,
      longitude: 77.59,
      timezone: "Asia/Kolkata",
    });
    expect(parsed.placeName).toBe("Bengaluru");
  });
});
