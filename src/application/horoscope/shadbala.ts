import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";
import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";

export type ShadbalaComponent = {
  name: string;
  sanskrit: string;
  score: number;
  max: number;
  /** Display units used by JHora / AstroSage (60 virupas = 1 rupa). */
  virupas: number;
  virupaMax: number;
  note: string;
};

export type PlanetShadbala = {
  planet: string;
  sign: string;
  house: number;
  /** Engine-unit total (legacy). Prefer `virupas` for display. */
  total: number;
  virupas: number;
  rupas: number;
  requiredVirupas: number;
  /** Virupas ÷ required. ≥ 1.00 meets the classical minimum. */
  ratio: number;
  meetsMinimum: boolean;
  ishtaPhala: number;
  kashtaPhala: number;
  percentage: number;
  grade: "Excellent" | "Good" | "Average" | "Weak";
  components: ShadbalaComponent[];
  /** Teaching breakdown of Sthana Bala (does not change the six-fold total). */
  sthanaParts: ShadbalaComponent[];
  interpretation: string;
  professionalNote: string;
};

export type BhavBalaRow = {
  house: number;
  sign: string;
  lord: string;
  virupas: number;
  rank: number;
  occupants: string[];
  note: string;
};

export type ShadbalaLab = {
  methodology: string;
  source: string;
  planets: PlanetShadbala[];
  bhavas: BhavBalaRow[];
  strongest: PlanetShadbala | null;
  weakest: PlanetShadbala | null;
  overallTheme: string;
};

export type ShadbalaPlanetInput = {
  planet: string;
  sign: string;
  house: number;
  nakshatra?: string;
  dignity: string | null;
  isRetrograde: boolean;
  longitude?: number;
  speed?: number;
  speedLongitude?: number;
};

/** BPHS required Shadbala (virupas). 60 virupas = 1 rupa. */
export const REQUIRED_VIRUPAS: Record<string, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
};

const CLASSICAL_GRAHAS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

/** Local copies so this route does not depend on HMR of newly added vedic-constants exports. */
const DIG_PEAK: Record<string, number> = {
  Sun: 10,
  Moon: 4,
  Mars: 10,
  Mercury: 1,
  Jupiter: 1,
  Venus: 4,
  Saturn: 7,
};

const EXALT_LON: Record<string, number> = {
  Sun: 10,
  Moon: 33,
  Mars: 298,
  Mercury: 165,
  Jupiter: 95,
  Venus: 357,
  Saturn: 200,
};

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function fmt(value: number, digits: number): string {
  return finite(value).toFixed(digits);
}

function angDist(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

function uchchaFromLon(planet: string, longitude: number): number {
  const exalt = EXALT_LON[planet];
  if (exalt == null) return 30;
  const dist = angDist(longitude, exalt);
  return Math.max(0, Math.min(60, 60 * (1 - dist / 180)));
}

const KENDRA = new Set([1, 4, 7, 10]);
const DUSTHANA = new Set([6, 8, 12]);

const OWN_SIGNS: Record<string, string[]> = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mars: ["Aries", "Scorpio"],
  Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"],
  Venus: ["Taurus", "Libra"],
  Saturn: ["Capricorn", "Aquarius"],
};

const EXALTED_SIGNS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mars: "Capricorn",
  Mercury: "Virgo",
  Jupiter: "Cancer",
  Venus: "Pisces",
  Saturn: "Libra",
};

const DEBILITATED_SIGNS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries",
};

const DIURNAL = new Set(["Sun", "Jupiter", "Venus"]);
const NOCTURNAL = new Set(["Moon", "Mars", "Saturn"]);
const BENEFIC = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
const MALEFIC = new Set(["Sun", "Mars", "Saturn", "Rahu", "Ketu"]);

const MEAN_SPEED: Record<string, number> = {
  Sun: 0.985,
  Moon: 13.176,
  Mars: 0.524,
  Mercury: 1.383,
  Venus: 1.2,
  Jupiter: 0.083,
  Saturn: 0.033,
};

/** Parashara Naisargika Bala in virupas — fixed natural strength, not chart-dependent. */
const NAISARGIKA_VIRUPAS: Record<string, number> = {
  Sun: 60,
  Moon: 51.43,
  Mars: 17.14,
  Mercury: 25.71,
  Jupiter: 34.28,
  Venus: 42.85,
  Saturn: 8.57,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function planetSpeed(p: ShadbalaPlanetInput): number {
  if (typeof p.speed === "number" && Number.isFinite(p.speed)) return p.speed;
  if (typeof p.speedLongitude === "number" && Number.isFinite(p.speedLongitude)) {
    return p.speedLongitude;
  }
  return p.isRetrograde ? -0.2 : 0.4;
}

function uchchaFromSign(planet: string, sign: string, dignity: string | null): number {
  if (dignity === "Exalted" || EXALTED_SIGNS[planet] === sign) return 60;
  if (dignity === "Debilitated" || DEBILITATED_SIGNS[planet] === sign) return 0;
  if (dignity === "Own" || OWN_SIGNS[planet]?.includes(sign)) return 45;
  return 30;
}

/** Shortest house steps between two whole-sign houses (1–12). */
export function houseDistance(a: number, b: number): number {
  const d = Math.abs(((a - 1) % 12) - ((b - 1) % 12));
  return Math.min(d, 12 - d);
}

/** Dig Bala from natal house vs the planet's directional peak house. */
export function digVirupas(planet: string, house: number): number {
  const peak = DIG_PEAK[planet];
  if (peak == null) return 30;
  const dist = houseDistance(house, peak);
  return clamp(60 * (1 - dist / 6), 0, 60);
}

function housesAspectedBy(fromHouse: number, planet: string): number[] {
  const at = (steps: number) => ((fromHouse - 1 + steps) % 12) + 1;
  const houses = [at(6)];
  if (planet === "Mars") {
    houses.push(at(3), at(7));
  } else if (planet === "Jupiter") {
    houses.push(at(4), at(8));
  } else if (planet === "Saturn") {
    houses.push(at(2), at(9));
  } else if (planet === "Rahu" || planet === "Ketu") {
    houses.push(at(4), at(8));
  }
  return [...new Set(houses)];
}

function mercuryIsBenefic(planets: ShadbalaPlanetInput[]): boolean {
  const mercury = planets.find((p) => p.planet === "Mercury");
  if (!mercury) return true;
  return !planets.some(
    (p) =>
      p &&
      p.planet !== "Mercury" &&
      p.house === mercury.house &&
      (p.planet === "Sun" || p.planet === "Mars" || p.planet === "Saturn"),
  );
}

/** Drik Bala from natal graha drishti onto this planet's house. */
export function drikVirupas(
  planet: string,
  house: number,
  planets: ShadbalaPlanetInput[],
): { virupas: number; note: string } {
  const mercBenefic = mercuryIsBenefic(planets);
  let delta = 0;
  const hits: string[] = [];

  for (const other of planets) {
    if (!other || other.planet === planet || typeof other.planet !== "string") continue;
    const fromHouse = num(other.house, 0);
    if (fromHouse < 1) continue;
    const aspects = housesAspectedBy(fromHouse, other.planet);
    if (!aspects.includes(house)) continue;

    const isBenefic = other.planet === "Mercury" ? mercBenefic : BENEFIC.has(other.planet);
    const weight =
      other.planet === "Jupiter"
        ? 14
        : other.planet === "Venus" || other.planet === "Moon"
          ? 10
          : other.planet === "Mercury"
            ? 8
            : other.planet === "Sun"
              ? -6
              : other.planet === "Mars" || other.planet === "Saturn"
                ? -12
                : -8;
    const signed = isBenefic ? Math.abs(weight) : -Math.abs(weight);
    delta += signed;
    hits.push(`${other.planet} ${signed > 0 ? "+" : ""}${signed}`);
  }

  const virupas = clamp(30 + delta, 0, 60);
  const note =
    hits.length === 0
      ? `No graha drishti on house ${house}`
      : `Aspects on H${house}: ${hits.join(", ")}`;
  return { virupas, note };
}

function isDayBirth(sunHouse: number | undefined): boolean | null {
  if (typeof sunHouse !== "number") return null;
  return sunHouse >= 7;
}

export function kalaVirupas(
  planet: string,
  sunHouse: number | undefined,
  moonLongitude: number | undefined,
  sunLongitude: number | undefined,
  house: number,
): { virupas: number; note: string } {
  const notes: string[] = [];
  const day = isDayBirth(sunHouse);
  let natonnata = 30;
  if (day === true) {
    natonnata = DIURNAL.has(planet) ? 60 : NOCTURNAL.has(planet) ? 0 : 30;
    notes.push(DIURNAL.has(planet) ? "Day birth — diurnal graha" : "Day birth — nocturnal graha");
  } else if (day === false) {
    natonnata = NOCTURNAL.has(planet) ? 60 : DIURNAL.has(planet) ? 0 : 30;
    notes.push(
      NOCTURNAL.has(planet) ? "Night birth — nocturnal graha" : "Night birth — diurnal graha",
    );
  } else {
    notes.push("Sun house missing — Natonnata held at 30");
  }

  let paksha = 30;
  if (typeof moonLongitude === "number" && typeof sunLongitude === "number") {
    const elong = angDist(moonLongitude, sunLongitude);
    const moonPaksha = 60 * (elong / 180);
    paksha = MALEFIC.has(planet) && planet !== "Rahu" ? 60 - moonPaksha : moonPaksha;
    notes.push(`Paksha from Moon-Sun ${fmt(elong, 0)}°`);
  } else {
    notes.push("Moon/Sun longitude missing — Paksha held at 30");
  }

  const hora = KENDRA.has(house) ? 30 : house === 5 || house === 9 ? 20 : 10;
  const virupas = clamp(natonnata + paksha + hora, 0, 180);
  return { virupas, note: notes.join(" · ") };
}

export function chestaVirupas(
  planet: string,
  speed: number,
  isRetrograde: boolean,
  moonLongitude?: number,
  sunLongitude?: number,
): { virupas: number; note: string } {
  if (planet === "Moon" && typeof moonLongitude === "number" && typeof sunLongitude === "number") {
    const elong = angDist(moonLongitude, sunLongitude);
    const virupas = clamp(60 * (elong / 180), 0, 60);
    return { virupas, note: `Moon Chesta from elongation ${fmt(elong, 0)}° (paksha motion)` };
  }

  if (planet === "Sun") {
    const mean = MEAN_SPEED.Sun ?? 0.985;
    const ratio = Math.abs(speed) / mean;
    const virupas = clamp(60 * Math.min(1, ratio), 8, 60);
    return { virupas, note: `Sun Chesta from natal speed ${fmt(speed, 3)}°/day` };
  }

  const mean = MEAN_SPEED[planet] ?? 0.5;
  const rx = isRetrograde || speed < 0;
  if (rx) {
    const virupas = clamp(48 + Math.min(12, (Math.abs(speed) / mean) * 6), 48, 60);
    return { virupas, note: `Retrograde — Chesta from natal speed ${fmt(speed, 3)}°/day` };
  }

  const ratio = Math.abs(speed) / (mean * 1.15);
  const virupas = clamp(60 * Math.min(1, Math.max(0.12, ratio)), 8, 60);
  const note =
    ratio < 0.35
      ? `Slow / near station — natal speed ${fmt(speed, 3)}°/day`
      : `Direct motion — natal speed ${fmt(speed, 3)}°/day`;
  return { virupas, note };
}

function naisargikaBala(planet: string): { virupas: number; note: string } {
  const virupas = NAISARGIKA_VIRUPAS[planet] ?? 25;
  return {
    virupas,
    note: "Parashara Naisargika — natural strength (same for every chart)",
  };
}

function sthanaPartsFor(
  planet: string,
  house: number,
  sign: string,
  dignity: string | null,
  longitude?: number,
): ShadbalaComponent[] {
  const uchcha =
    typeof longitude === "number"
      ? uchchaFromLon(planet, longitude)
      : uchchaFromSign(planet, sign, dignity);
  const kendradi = KENDRA.has(house)
    ? 60
    : house === 2 || house === 5 || house === 8 || house === 11
      ? 30
      : 15;
  const saptavarga =
    dignity === "Exalted" || EXALTED_SIGNS[planet] === sign
      ? 45
      : dignity === "Own" || OWN_SIGNS[planet]?.includes(sign)
        ? 30
        : dignity === "Debilitated" || DEBILITATED_SIGNS[planet] === sign
          ? 5
          : 15;
  const signId = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  const odd = signId >= 0 ? signId % 2 === 0 : true;
  const ojha = odd ? 15 : 30;
  const deg = typeof longitude === "number" ? ((longitude % 30) + 30) % 30 : 15;
  const drekkana = deg < 10 ? 15 : deg < 20 ? 10 : 5;

  return [
    {
      name: "Uchcha",
      sanskrit: "Uchcha Bala",
      score: uchcha,
      max: 60,
      virupas: round1(uchcha),
      virupaMax: 60,
      note:
        typeof longitude === "number"
          ? `From natal longitude ${fmt(longitude, 2)}° vs exaltation point`
          : uchcha >= 45
            ? "Sign dignity near exaltation"
            : uchcha <= 5
              ? "Sign dignity near debilitation"
              : "Mid-range sign dignity (longitude missing)",
    },
    {
      name: "Kendradi",
      sanskrit: "Kendradi Bala",
      score: kendradi,
      max: 60,
      virupas: kendradi,
      virupaMax: 60,
      note: KENDRA.has(house)
        ? `House ${house} is Kendra`
        : kendradi === 30
          ? `House ${house} is Panapara`
          : `House ${house} is Apoklima`,
    },
    {
      name: "Saptavargaja",
      sanskrit: "Saptavargaja Bala",
      score: saptavarga,
      max: 45,
      virupas: saptavarga,
      virupaMax: 45,
      note: "Rasi dignity only — D2–D12 vargas are not scored here",
    },
    {
      name: "Ojhayugma",
      sanskrit: "Ojhagugma Bala",
      score: ojha,
      max: 30,
      virupas: ojha,
      virupaMax: 30,
      note: odd ? `${sign} is odd (solar / male)` : `${sign} is even (lunar / female)`,
    },
    {
      name: "Drekkana",
      sanskrit: "Drekkana Bala",
      score: drekkana,
      max: 15,
      virupas: drekkana,
      virupaMax: 15,
      note:
        drekkana === 15
          ? `First drekkana (${fmt(deg, 1)}° of ${sign})`
          : drekkana === 10
            ? `Middle drekkana (${fmt(deg, 1)}° of ${sign})`
            : `Last drekkana (${fmt(deg, 1)}° of ${sign})`,
    },
  ];
}

function component(
  name: string,
  sanskrit: string,
  virupas: number,
  virupaMax: number,
  note: string,
): ShadbalaComponent {
  const safe = finite(round1(virupas));
  return {
    name,
    sanskrit,
    score: safe,
    max: virupaMax,
    virupas: safe,
    virupaMax,
    note,
  };
}

function gradeFromRatio(ratio: number): PlanetShadbala["grade"] {
  if (ratio >= 1.25) return "Excellent";
  if (ratio >= 1) return "Good";
  if (ratio >= 0.75) return "Average";
  return "Weak";
}

function professionalNote(p: {
  planet: string;
  ratio: number;
  meetsMinimum: boolean;
  ishtaPhala: number;
  kashtaPhala: number;
  components: ShadbalaComponent[];
}): string {
  const weakest = [...p.components].sort((a, b) => a.virupas - b.virupas)[0];
  const strongest = [...p.components].sort((a, b) => b.virupas - a.virupas)[0];
  const result = p.meetsMinimum
    ? `${p.planet} meets the BPHS minimum (${fmt(p.ratio, 2)}x required) and can deliver results in its dasha with less obstruction.`
    : `${p.planet} is below the BPHS minimum (${fmt(p.ratio, 2)}x required). Results still occur, but they tend to need support from dasha lords, transits, or remedies.`;
  const ishta =
    p.ishtaPhala >= p.kashtaPhala
      ? `Ishta (${p.ishtaPhala}) outweighs Kashta (${p.kashtaPhala}) — constructive fruit is more available.`
      : `Kashta (${p.kashtaPhala}) outweighs Ishta (${p.ishtaPhala}) — effort and delay are more likely than easy gains.`;
  return `${result} Strongest limb: ${strongest?.name ?? "Sthana"}. Weakest limb: ${weakest?.name ?? "Dig"}. ${ishta}`;
}

function interpretation(planet: string, _total: number, g: PlanetShadbala["grade"]): string {
  const themes: Record<string, Record<string, string>> = {
    Sun: {
      Excellent: "Strong vitality and authority",
      Good: "Good self-expression",
      Average: "Moderate vitality",
      Weak: "Low vitality — needs solar practices",
    },
    Moon: {
      Excellent: "Emotional balance and clarity",
      Good: "Stable mind",
      Average: "Variable moods",
      Weak: "Emotional sensitivity — lunar routines help",
    },
    Mars: {
      Excellent: "Strong drive and courage",
      Good: "Good energy for action",
      Average: "Moderate drive",
      Weak: "Energy blocks — physical discipline helps",
    },
    Mercury: {
      Excellent: "Sharp intellect and communication",
      Good: "Good learning ability",
      Average: "Moderate intellect",
      Weak: "Mental restlessness — grounding practices",
    },
    Jupiter: {
      Excellent: "Wisdom and expansion strong",
      Good: "Good fortune and learning",
      Average: "Moderate growth",
      Weak: "Limited expansion — spiritual study",
    },
    Venus: {
      Excellent: "Strong harmony and relationships",
      Good: "Good creative energy",
      Average: "Moderate pleasures",
      Weak: "Relationship refinement needed",
    },
    Saturn: {
      Excellent: "Strong discipline and longevity",
      Good: "Good structure and focus",
      Average: "Moderate discipline",
      Weak: "Heavy karma — structured routine essential",
    },
  };
  return themes[planet]?.[g] || `${g} overall strength`;
}

function bhavDigBala(house: number): number {
  if (house === 1 || house === 10) return 60;
  if (house === 4 || house === 7) return 40;
  if (house === 5 || house === 9) return 30;
  if (house === 2 || house === 11) return 20;
  if (house === 3) return 15;
  return 8;
}

function computeBhavBala(lagnaSign: string, planets: PlanetShadbala[]): BhavBalaRow[] {
  const lagnaIndex = Math.max(0, SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]));
  const byName = new Map(planets.map((p) => [p.planet, p]));
  const raw = Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    const sign = SIGNS[(lagnaIndex + i) % 12] ?? "Aries";
    const lord = HOUSE_LORDS[sign as (typeof SIGNS)[number]] ?? "Mars";
    const lordRow = byName.get(lord);
    const occupants = planets.filter((p) => p.house === house);
    const occupantSum = occupants.reduce((s, p) => s + p.virupas, 0);
    const virupas = Math.round(
      (lordRow?.virupas ?? 0) +
        occupantSum * 0.35 +
        bhavDigBala(house) -
        (DUSTHANA.has(house) ? 25 : 0),
    );
    return {
      house,
      sign,
      lord,
      virupas: Math.max(0, virupas),
      rank: 0,
      occupants: occupants.map((p) => p.planet),
      note: occupants.length
        ? `Lord ${lord} · occupied by ${occupants.map((p) => p.planet).join(", ")}`
        : `Lord ${lord} · empty bhava`,
    };
  });
  const order = [...raw].sort((a, b) => b.virupas - a.virupas);
  order.forEach((row, idx) => {
    const target = raw.find((r) => r.house === row.house);
    if (target) target.rank = idx + 1;
  });
  return raw;
}

export function computeShadbalaFromChart(input: {
  lagnaSign: string;
  planets: ShadbalaPlanetInput[];
}): ShadbalaLab {
  const planets = (Array.isArray(input.planets) ? input.planets : []).filter(
    (p): p is ShadbalaPlanetInput => Boolean(p && typeof p.planet === "string"),
  );
  const sun = planets.find((p) => p.planet === "Sun");
  const moon = planets.find((p) => p.planet === "Moon");

  const shadbala: PlanetShadbala[] = planets
    .filter((p) => (CLASSICAL_GRAHAS as readonly string[]).includes(p.planet))
    .map((p) => {
      const parts = sthanaPartsFor(p.planet, p.house, p.sign, p.dignity, p.longitude);
      const sthanaVirupas = parts.reduce((s, c) => s + c.virupas, 0);
      const dig = digVirupas(p.planet, p.house);
      const kala = kalaVirupas(p.planet, sun?.house, moon?.longitude, sun?.longitude, p.house);
      const chesta = chestaVirupas(
        p.planet,
        planetSpeed(p),
        p.isRetrograde || planetSpeed(p) < 0,
        moon?.longitude,
        sun?.longitude,
      );
      const naisargika = naisargikaBala(p.planet);
      const drik = drikVirupas(p.planet, p.house, planets);
      const uchcha = parts.find((c) => c.name === "Uchcha")?.virupas ?? 30;

      const peak = DIG_PEAK[p.planet];
      const components: ShadbalaComponent[] = [
        component(
          "Sthana",
          "Sthana Bala",
          sthanaVirupas,
          240,
          `Sum of Uchcha, Kendradi, Rasi-Saptavargaja, Ojha, Drekkana from natal ${p.sign} H${p.house}`,
        ),
        component(
          "Dig",
          "Dig Bala",
          dig,
          60,
          peak
            ? `House ${p.house} vs peak house ${peak} (${houseDistance(p.house, peak)} houses away)`
            : "No directional peak",
        ),
        component("Kala", "Kala Bala", kala.virupas, 180, kala.note),
        component("Chesta", "Chesta Bala", chesta.virupas, 60, chesta.note),
        component("Naisargika", "Naisargika Bala", naisargika.virupas, 60, naisargika.note),
        component("Drik", "Drik Bala", drik.virupas, 60, drik.note),
      ];

      const virupas = Math.round(components.reduce((sum, c) => sum + c.virupas, 0));
      const requiredVirupas = REQUIRED_VIRUPAS[p.planet] ?? 300;
      const ratio = requiredVirupas > 0 ? virupas / requiredVirupas : 0;
      const g = gradeFromRatio(ratio);
      const ishtaPhala = Math.round(
        Math.sqrt(Math.max(0, finite(uchcha) * finite(chesta.virupas))),
      );
      const kashtaPhala = Math.round(
        Math.sqrt(Math.max(0, (60 - finite(uchcha)) * (60 - finite(chesta.virupas)))),
      );

      const row: PlanetShadbala = {
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        total: virupas,
        virupas,
        rupas: Math.round((virupas / 60) * 100) / 100,
        requiredVirupas,
        ratio: Math.round(ratio * 100) / 100,
        meetsMinimum: ratio >= 1,
        ishtaPhala,
        kashtaPhala,
        percentage: Math.round(ratio * 100),
        grade: g,
        components,
        sthanaParts: parts,
        interpretation: interpretation(p.planet, virupas, g),
        professionalNote: "",
      };
      row.professionalNote = professionalNote(row);
      return row;
    });

  const sorted = [...shadbala].sort((a, b) => b.virupas - a.virupas);
  const strongest = sorted[0] || null;
  const weakest = sorted[sorted.length - 1] || null;

  const themes: string[] = [];
  if (strongest)
    themes.push(
      `${strongest.planet} leads at ${strongest.rupas} rupas (${fmt(strongest.ratio, 2)}× required)`,
    );
  if (weakest && !weakest.meetsMinimum)
    themes.push(`${weakest.planet} is below the classical minimum — supportive practices help`);
  const above = shadbala.filter((p) => p.meetsMinimum).length;
  if (above >= 5) themes.push("Most grahas meet required Shadbala — chart supports action");
  const weak = shadbala.filter((p) => p.grade === "Weak").length;
  if (weak >= 3) themes.push("Several planets require attention — remedial focus advised");
  const bhavas = computeBhavBala(input.lagnaSign, shadbala);
  const strongestBhava = [...bhavas].sort((a, b) => a.rank - b.rank)[0];
  if (strongestBhava) {
    themes.push(`House ${strongestBhava.house} (${strongestBhava.sign}) leads Bhav Bala`);
  }

  return {
    methodology:
      "Virupas from your stored natal kundli (sidereal Lahiri). Dig Bala uses house from lagna vs each graha peak direction. Uchcha uses longitude vs the exaltation degree. Drik uses 7th-house drishti plus Mars 4/8, Jupiter 5/9, Saturn 3/10. Chesta uses stored speed (Moon from Sun elongation). Kala uses Sun house for day/night plus Moon-Sun paksha. Naisargika is the Parashara natural constant. Saptavargaja is Rasi dignity only. Bhav Bala combines house-lord Shadbala, occupants, and bhava digbala.",
    source:
      "Natal kundli planet rows (sign, house, longitude, speed, lagna). Not a guess and not a static table except Naisargika, which is classically fixed.",
    planets: shadbala,
    bhavas,
    strongest,
    weakest,
    overallTheme: themes.join("; ") || "Balanced planetary strength distribution",
  };
}

export class ShadbalaService {
  async forUser(userId: string): Promise<ShadbalaLab> {
    await connectMongo();
    const chart = await Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    if (!chart) throw new NotFoundError("Generate kundli first");

    const raw = Array.isArray(chart.planets) ? chart.planets : [];
    const planets: ShadbalaPlanetInput[] = raw.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const p = row as unknown as Record<string, unknown>;
      if (typeof p.planet !== "string" || !p.planet) return [];
      const house = Math.min(12, Math.max(1, Math.round(num(p.house, 1))));
      const longitude =
        typeof p.longitude === "number" && Number.isFinite(p.longitude) ? p.longitude : undefined;
      const speed = typeof p.speed === "number" && Number.isFinite(p.speed) ? p.speed : undefined;
      return [
        {
          planet: p.planet,
          sign: typeof p.sign === "string" && p.sign ? p.sign : "Aries",
          house,
          nakshatra: typeof p.nakshatra === "string" ? p.nakshatra : undefined,
          dignity: typeof p.dignity === "string" ? p.dignity : null,
          isRetrograde: Boolean(p.isRetrograde) || (typeof speed === "number" && speed < 0),
          longitude,
          speed,
          speedLongitude:
            typeof p.speedLongitude === "number" && Number.isFinite(p.speedLongitude)
              ? p.speedLongitude
              : undefined,
        },
      ];
    });

    return computeShadbalaFromChart({
      lagnaSign: typeof chart.lagnaSign === "string" && chart.lagnaSign ? chart.lagnaSign : "Aries",
      planets,
    });
  }
}

export const shadbalaService = new ShadbalaService();
