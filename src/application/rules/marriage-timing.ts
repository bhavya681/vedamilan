export type MarriageWindow = {
  label: string;
  window: string;
  reason: string;
  score: number;
};

type DashaPeriod = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  level: string;
  parentLord?: string | null;
};

const BENEFIC = new Set(["Venus", "Jupiter", "Moon", "Mercury"]);

/** Deterministic marriage-timing windows from dasha periods (not AI). */
export function computeMarriageWindows(
  periods: DashaPeriod[],
  manglikStatus: string,
): MarriageWindow[] {
  const maha = periods.filter((p) => p.level === "MAHA");
  const antar = periods.filter((p) => p.level === "ANTAR");
  const windows: MarriageWindow[] = [];

  const scoreLord = (lord: string) => {
    if (lord === "Venus") return 94;
    if (lord === "Jupiter") return 90;
    if (lord === "Moon") return 86;
    if (lord === "Mercury") return 82;
    if (lord === "Sun") return 70;
    return 62;
  };

  for (const period of maha.slice(0, 4)) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    if (end < new Date()) continue;
    const base = scoreLord(period.lord);
    const manglikAdj = manglikStatus === "MANGLIK" && period.lord === "Mars" ? -8 : 0;
    const nested = antar.find(
      (a) =>
        a.parentLord === period.lord &&
        new Date(a.startDate) >= start &&
        new Date(a.endDate) <= end &&
        BENEFIC.has(a.lord),
    );
    const score = Math.min(99, base + (nested ? 4 : 0) + manglikAdj);
    windows.push({
      label: nested ? "Primary activation" : "Seasonal window",
      window: `${start.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – ${end.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`,
      reason: nested
        ? `${period.lord} mahadasha with ${nested.lord} antardasha favors sincere introductions.`
        : `${period.lord} mahadasha forms a relationship timing corridor.`,
      score,
    });
  }

  if (windows.length === 0 && maha[0]) {
    const start = new Date(maha[0].startDate);
    const end = new Date(maha[0].endDate);
    windows.push({
      label: "Baseline window",
      window: `${start.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – ${end.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`,
      reason: `${maha[0].lord} period is the nearest stored mahadasha reference.`,
      score: scoreLord(maha[0].lord),
    });
  }

  return windows.sort((a, b) => b.score - a.score).slice(0, 3);
}
