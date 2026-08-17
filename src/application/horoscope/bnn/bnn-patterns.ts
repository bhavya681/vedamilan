import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import { BNN_THEME_META, type BnnPatternKind, type BnnThemeId } from "./bnn-rules";

export type BnnPlanet = {
  planet: string;
  sign: string;
  house: number;
  longitude?: number;
  isRetrograde?: boolean;
  nakshatra?: string;
};

export type BnnPattern = {
  id: string;
  kind: BnnPatternKind;
  planets: string[];
  signs: string[];
  houses: number[];
  evidence: string;
};

export type BnnThemeHit = {
  theme: BnnThemeId;
  title: string;
  patterns: BnnPattern[];
  planets: string[];
  why: string;
  manifestation: string;
};

function signId(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : -1;
}

function lordOf(sign: string): string | null {
  return HOUSE_LORDS[sign as keyof typeof HOUSE_LORDS] ?? null;
}

export function detectBnnPatterns(planets: BnnPlanet[]): BnnPattern[] {
  const classical = planets.filter((p) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(
      p.planet,
    ),
  );
  const bySign = new Map<string, BnnPlanet[]>();
  const byName = new Map<string, BnnPlanet>();
  for (const p of classical) {
    byName.set(p.planet, p);
    const list = bySign.get(p.sign) ?? [];
    list.push(p);
    bySign.set(p.sign, list);
  }

  const patterns: BnnPattern[] = [];

  for (const [sign, group] of bySign) {
    if (group.length < 2) continue;
    const names = group.map((p) => p.planet).sort();
    patterns.push({
      id: `conj:${names.join("+")}:${sign}`,
      kind: "conjunction",
      planets: names,
      signs: [sign],
      houses: [...new Set(group.map((p) => p.house))],
      evidence: `${names.join(" + ")} occupy ${sign} together (BNN conjunction).`,
    });
  }

  const seenExchange = new Set<string>();
  for (const p of classical) {
    const lord = lordOf(p.sign);
    if (!lord || lord === p.planet) continue;
    const host = byName.get(lord);
    if (!host) continue;
    patterns.push({
      id: `dep:${p.planet}->${lord}`,
      kind: "depositor",
      planets: [p.planet, lord],
      signs: [p.sign, host.sign],
      houses: [p.house, host.house],
      evidence: `${p.planet} occupies ${p.sign}, whose lord is ${lord} in ${host.sign} (depositor link).`,
    });

    const backLord = lordOf(host.sign);
    if (backLord === p.planet) {
      const key = [p.planet, lord].sort().join("|");
      if (!seenExchange.has(key)) {
        seenExchange.add(key);
        patterns.push({
          id: `exch:${key}`,
          kind: "exchange",
          planets: [p.planet, lord].sort(),
          signs: [p.sign, host.sign],
          houses: [p.house, host.house],
          evidence: `${p.planet} and ${lord} exchange signs (${p.sign} ↔ ${host.sign}).`,
        });
      }
    }

    const next = lordOf(host.sign);
    if (next && next !== p.planet && next !== lord) {
      const third = byName.get(next);
      if (third) {
        patterns.push({
          id: `chain:${p.planet}->${lord}->${next}`,
          kind: "chain",
          planets: [p.planet, lord, next],
          signs: [p.sign, host.sign, third.sign],
          houses: [p.house, host.house, third.house],
          evidence: `${p.planet} → ${lord} → ${next} (two-step depositor chain).`,
        });
      }
    }
  }

  return patterns;
}

function houseLord(lagnaSign: string, house: number): string | null {
  const i = signId(lagnaSign);
  if (i < 0) return null;
  const sign = SIGNS[(i + house - 1) % 12];
  return sign ? lordOf(sign) : null;
}

export function matchBnnThemes(
  patterns: BnnPattern[],
  planets: BnnPlanet[],
  lagnaSign: string,
): BnnThemeHit[] {
  const hits: BnnThemeHit[] = [];
  const themeIds = Object.keys(BNN_THEME_META) as BnnThemeId[];

  for (const theme of themeIds) {
    const meta = BNN_THEME_META[theme];
    const lords = meta.houses
      .map((h) => houseLord(lagnaSign, h))
      .filter((n): n is string => Boolean(n));
    const matched = patterns.filter((p) => {
      const hasKaraka = p.planets.some((name) => meta.karakas.includes(name));
      const hasHouse =
        p.houses.some((h) => meta.houses.includes(h)) ||
        p.planets.some((name) => lords.includes(name));
      return hasKaraka && hasHouse;
    });

    // Direct occupancy of a theme house by a karaka also counts (no extra pattern needed).
    const occupancy = planets.filter(
      (p) => meta.karakas.includes(p.planet) && meta.houses.includes(p.house),
    );
    if (occupancy.length) {
      matched.push({
        id: `occ:${theme}:${occupancy.map((p) => p.planet).join("+")}`,
        kind: "occupancy",
        planets: occupancy.map((p) => p.planet),
        signs: occupancy.map((p) => p.sign),
        houses: occupancy.map((p) => p.house),
        evidence: occupancy
          .map(
            (p) =>
              `${p.planet} occupies house ${p.house} (${p.sign}), a ${meta.title.toLowerCase()} house.`,
          )
          .join(" "),
      });
    }

    const unique = new Map<string, BnnPattern>();
    for (const p of matched) unique.set(p.id, p);
    const list = [...unique.values()];
    if (!list.length) continue;

    const involved = [...new Set(list.flatMap((p) => p.planets))];
    hits.push({
      theme,
      title: meta.title,
      patterns: list,
      planets: involved,
      why: `${meta.note} Evidence: ${list.map((p) => p.evidence).join(" ")}`,
      manifestation: `This pattern can become more noticeable in ${meta.title.toLowerCase()} themes when dasha or transit touches ${involved.join(" or ")}. It is not a guaranteed event.`,
    });
  }

  return hits;
}

export type BnnActivation = {
  theme: BnnThemeId;
  status: "activated" | "not-activated" | "unknown";
  reason: string;
};

export function activateBnnThemes(
  hits: BnnThemeHit[],
  currentMaha: string | null,
  currentAntar: string | null,
  transitSigns: Array<{ planet: string; sign: string }>,
): BnnActivation[] {
  return hits.map((hit) => {
    const dashaHit =
      (currentMaha && hit.planets.includes(currentMaha)) ||
      (currentAntar && hit.planets.includes(currentAntar));
    const transitHit = transitSigns.some(
      (t) =>
        ["Jupiter", "Saturn"].includes(t.planet) &&
        hit.patterns.some((p) => p.signs.includes(t.sign) || p.planets.includes(t.planet)),
    );
    if (!currentMaha && !transitSigns.length) {
      return {
        theme: hit.theme,
        status: "unknown" as const,
        reason: "Dasha or transit data is unavailable — activation cannot be scored.",
      };
    }
    if (dashaHit || transitHit) {
      const bits: string[] = [];
      if (dashaHit)
        bits.push(
          `current ${[currentMaha, currentAntar].filter(Boolean).join("–")} dasha involves a pattern graha`,
        );
      if (transitHit)
        bits.push(
          "Jupiter or Saturn currently occupies a pattern sign or is itself in the pattern",
        );
      return {
        theme: hit.theme,
        status: "activated" as const,
        reason: `The current period activates this theme: ${bits.join("; ")}.`,
      };
    }
    return {
      theme: hit.theme,
      status: "not-activated" as const,
      reason:
        "Neither the current Maha/Antar lord nor transit Jupiter/Saturn currently contacts this pattern.",
    };
  });
}
