import { describe, expect, it } from "vitest";

import { getGraha, listGrahas, searchGrahas } from "@/domain/graha-katha/catalog";
import {
  engineNameForGraha,
  grahaIdFromEngineName,
  listComparePairs,
  listGrahaSummaries,
  loadGraha,
  searchGrahaSummaries,
} from "@/domain/graha-katha";

describe("graha-katha catalog", () => {
  it("lists nine classical grahas (full sync catalog)", () => {
    const all = listGrahas();
    expect(all).toHaveLength(9);
    expect(all.map((g) => g.id)).toEqual([
      "surya",
      "chandra",
      "mangal",
      "budha",
      "guru",
      "shukra",
      "shani",
      "rahu",
      "ketu",
    ]);
  });

  it("provides 12 house interpretations for each graha", () => {
    for (const g of listGrahas()) {
      expect(g.houses).toHaveLength(12);
      expect(g.chapters.length).toBeGreaterThanOrEqual(3);
      expect(g.engineName).toBeTruthy();
    }
  });

  it("maps graha ids to engine planet names", () => {
    expect(engineNameForGraha("shani")).toBe("Saturn");
    expect(engineNameForGraha("surya")).toBe("Sun");
    expect(grahaIdFromEngineName("Mars")).toBe("mangal");
    expect(grahaIdFromEngineName("Unknown")).toBeNull();
  });

  it("searches lightweight summaries without loading full modules", () => {
    expect(listGrahaSummaries()).toHaveLength(9);
    expect(searchGrahaSummaries("saturn").map((g) => g.id)).toContain("shani");
    expect(searchGrahaSummaries("marriage").some((g) => g.id === "shukra")).toBe(true);
  });

  it("lazy-loads a single graha entity", async () => {
    const shani = await loadGraha("shani");
    expect(shani?.archetype).toMatch(/Karma/i);
    expect(shani?.houses).toHaveLength(12);
    // Cached second call
    expect(await loadGraha("shani")).toBe(shani);
  });

  it("keeps sync search/get for scripts", () => {
    expect(searchGrahas("saturn").map((g) => g.id)).toContain("shani");
    expect(getGraha("shani")?.archetype).toMatch(/Karma/i);
  });

  it("seeds compare pairs", () => {
    expect(listComparePairs().length).toBeGreaterThanOrEqual(5);
  });
});
