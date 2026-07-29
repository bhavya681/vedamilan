import { SIGNS } from "@/application/horoscope/vedic-constants";
import {
  buildNorthChart,
  type ChartPlanet,
  type ChartPlanetGlyph,
} from "@/application/horoscope/chart-builder";
import { buildNavamsaChart } from "@/application/horoscope/navamsa-chart";
import {
  IMPORTANT_VARGAS,
  longitudeToVargaSign,
  resolveLagnaLongitude,
  type VargaId,
  type VargaMeta,
} from "@/application/horoscope/varga";

function signIdOf(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function degreeInSign(longitude: number) {
  const x = ((longitude % 30) + 30) % 30;
  return x;
}

/**
 * Rebuild a North Indian whole-sign chart counting houses from a chosen lagna sign
 * (Moon chart, Sun chart, etc.) using stored D1 planet rashis.
 */
export function buildChartFromLagnaSign(planets: ChartPlanet[], lagnaSign: string, label: string) {
  const lagnaSignId = signIdOf(lagnaSign);
  const lagnaPlanet = planets.find((p) => p.signId === lagnaSignId);
  const lagnaDegree = lagnaPlanet ? degreeInSign(lagnaPlanet.longitude) : 15;
  const chart = buildNorthChart(planets, lagnaSignId, lagnaDegree);
  return {
    ...chart,
    lagnaLabel: `${label} ${Math.floor(lagnaDegree)}°`,
    reference: label,
    referenceSign: lagnaSign,
  };
}

export function buildMoonChart(planets: ChartPlanet[]) {
  const moon = planets.find((p) => p.planet === "Moon");
  if (!moon) return null;
  return buildChartFromLagnaSign(planets, moon.sign, "Moon Lagna");
}

export function buildSunChart(planets: ChartPlanet[]) {
  const sun = planets.find((p) => p.planet === "Sun");
  if (!sun) return null;
  return buildChartFromLagnaSign(planets, sun.sign, "Sun Lagna");
}

/** D9 Navamsha as a North Indian house map from D9 Lagna. */
export function buildNavamsaNorthChart(input: {
  planets: ChartPlanet[];
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
}) {
  const d9 = buildNavamsaChart({
    planets: input.planets.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      house: p.house,
      longitude: p.longitude,
      dignity: p.dignity,
      isRetrograde: p.isRetrograde,
    })),
    lagnaSign: input.lagnaSign,
    lagnaDegree: input.lagnaDegree,
    lagnaLongitude: input.lagnaLongitude,
  });

  const asD1Style: ChartPlanet[] = d9.planets.map((p) => ({
    planet: p.planet,
    sign: p.sign,
    signId: p.signId,
    house: p.house,
    longitude: p.signId * 30 + 15,
    latitude: 0,
    speed: 0,
    isRetrograde: Boolean(p.isRetrograde),
    nakshatra: "",
    nakshatraPada: 1,
    dignity: p.dignity ?? null,
  }));

  const chart = buildNorthChart(asD1Style, d9.lagnaSignId, 15);
  return {
    ...chart,
    lagnaLabel: `D9 Asc ${d9.lagnaSign}`,
    reference: "Navamsha (D9)",
    referenceSign: d9.lagnaSign,
    notes: d9.notes,
  };
}

/** Generic Parashari varga (D2–D60) as North Indian whole-sign chart. */
export function buildVargaNorthChart(input: {
  planets: ChartPlanet[];
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
  varga: VargaId;
  meta?: VargaMeta;
}) {
  const meta = input.meta || IMPORTANT_VARGAS.find((v) => v.id === input.varga);
  const notes: string[] = [];
  const lagnaResolved = resolveLagnaLongitude({
    lagnaSign: input.lagnaSign,
    lagnaDegree: input.lagnaDegree,
    lagnaLongitude: input.lagnaLongitude,
  });
  if (lagnaResolved.note) notes.push(lagnaResolved.note);

  if (input.varga === 9) {
    return buildNavamsaNorthChart(input);
  }

  if (input.varga === 1) {
    const lagnaSignId = signIdOf(input.lagnaSign);
    const chart = buildNorthChart(
      input.planets,
      lagnaSignId,
      degreeInSign(lagnaResolved.longitude),
    );
    return {
      ...chart,
      lagnaLabel: `D1 Asc ${input.lagnaSign}`,
      reference: meta?.name || "Rashi (D1)",
      referenceSign: input.lagnaSign,
      notes,
      vargaId: 1 as VargaId,
      theme: meta?.theme,
    };
  }

  const vLagna = longitudeToVargaSign(lagnaResolved.longitude, input.varga);
  const asD1Style: ChartPlanet[] = [];
  for (const p of input.planets) {
    if (typeof p.longitude !== "number" || Number.isNaN(p.longitude)) {
      notes.push(`Skipped ${p.planet} in ${meta?.code || `D${input.varga}`} — missing longitude.`);
      continue;
    }
    const v = longitudeToVargaSign(p.longitude, input.varga);
    asD1Style.push({
      planet: p.planet,
      sign: v.sign,
      signId: v.signId,
      house: ((v.signId - vLagna.signId + 12) % 12) + 1,
      longitude: v.signId * 30 + 15,
      latitude: 0,
      speed: 0,
      isRetrograde: Boolean(p.isRetrograde),
      nakshatra: "",
      nakshatraPada: 1,
      dignity: p.dignity ?? null,
    });
  }

  const chart = buildNorthChart(asD1Style, vLagna.signId, 15);
  return {
    ...chart,
    lagnaLabel: `${meta?.code || `D${input.varga}`} Asc ${vLagna.sign}`,
    reference: meta?.name || `D${input.varga}`,
    referenceSign: vLagna.sign,
    notes,
    vargaId: input.varga,
    theme: meta?.theme,
  };
}

/** Build all important vargas for the Charts hub / API. */
export function buildImportantVargaCharts(input: {
  planets: ChartPlanet[];
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
  d1North?: unknown;
}) {
  const catalog = IMPORTANT_VARGAS.map((meta) => ({
    id: meta.id,
    code: meta.code,
    name: meta.name,
    theme: meta.theme,
  }));

  const byCode: Record<string, ReturnType<typeof buildVargaNorthChart> | unknown> = {};
  for (const meta of IMPORTANT_VARGAS) {
    if (meta.id === 1 && input.d1North) {
      byCode.D1 = {
        ...(input.d1North as object),
        lagnaLabel: `D1 Asc ${input.lagnaSign}`,
        reference: meta.name,
        referenceSign: input.lagnaSign,
        theme: meta.theme,
        vargaId: 1,
      };
      continue;
    }
    byCode[meta.code] = buildVargaNorthChart({
      planets: input.planets,
      lagnaSign: input.lagnaSign,
      lagnaDegree: input.lagnaDegree,
      lagnaLongitude: input.lagnaLongitude,
      varga: meta.id,
      meta,
    });
  }

  return { catalog, byCode };
}

export type VariantChart = ReturnType<typeof buildChartFromLagnaSign> & {
  notes?: string[];
  theme?: string;
  vargaId?: VargaId;
};

export type { ChartPlanetGlyph, VargaId, VargaMeta };
export { IMPORTANT_VARGAS };
