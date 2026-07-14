import { describe, expect, it } from "vitest";

function addPeriod(interval: string, from = new Date()) {
  const end = new Date(from);
  if (interval === "YEARLY") end.setFullYear(end.getFullYear() + 1);
  else if (interval === "QUARTERLY") end.setMonth(end.getMonth() + 3);
  else if (interval === "LIFETIME") end.setFullYear(end.getFullYear() + 100);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

describe("Module 9 — billing periods", () => {
  it("extends monthly and quarterly intervals", () => {
    const start = new Date("2026-01-15T00:00:00Z");
    const monthly = addPeriod("MONTHLY", start);
    const quarterly = addPeriod("QUARTERLY", start);
    expect(monthly.getUTCMonth()).toBe(1);
    expect(quarterly.getUTCMonth()).toBe(3);
  });
});
