import { describe, expect, it } from "vitest";

import {
  celebrityMatchesQuery,
  countCelebritiesByCategory,
  type CelebrityFilterItem,
} from "../celebrity-filters";

const pool: CelebrityFilterItem[] = [
  {
    name: "Warren Buffett",
    field: "Investing",
    category: "Finance",
    place: "Omaha, Nebraska",
  },
  {
    name: "Charlie Munger",
    field: "Value investing",
    category: "Finance",
    place: "Omaha, Nebraska",
  },
  {
    name: "Lionel Messi",
    field: "Football",
    category: "Sports",
    place: "Rosario, Argentina",
  },
  {
    name: "Meryl Streep",
    field: "Cinema",
    category: "Cinema",
    place: "Summit, New Jersey",
  },
];

describe("celebrity filters", () => {
  it("counts every category in the supplied pool", () => {
    expect(countCelebritiesByCategory(pool, "")).toEqual({
      All: 4,
      Finance: 2,
      Sports: 1,
      Cinema: 1,
    });
  });

  it("recomputes counters from the active search query", () => {
    expect(countCelebritiesByCategory(pool, "Omaha")).toEqual({
      All: 2,
      Finance: 2,
    });
    expect(countCelebritiesByCategory(pool, "investing")).toEqual({
      All: 2,
      Finance: 2,
    });
  });

  it("recomputes counters from a similarity match pool", () => {
    const matches = [pool[1]!, pool[2]!];

    expect(countCelebritiesByCategory(matches, "")).toEqual({
      All: 2,
      Finance: 1,
      Sports: 1,
    });
    expect(countCelebritiesByCategory(matches, "football")).toEqual({
      All: 1,
      Sports: 1,
    });
  });

  it("matches names, fields, categories and places case-insensitively", () => {
    expect(celebrityMatchesQuery(pool[0]!, "  buffett  ")).toBe(true);
    expect(celebrityMatchesQuery(pool[2]!, "SPORTS")).toBe(true);
    expect(celebrityMatchesQuery(pool[3]!, "jersey")).toBe(true);
    expect(celebrityMatchesQuery(pool[0]!, "soccer")).toBe(false);
  });
});
