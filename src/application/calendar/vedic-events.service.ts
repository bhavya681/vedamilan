import {
  YOGA_NAMES,
  jdToUnixMs,
  karanaForDifference,
  nakshatraForLongitude,
  nityaYogaFor,
  norm360,
  tithiForDifference,
} from "@/application/horoscope/panchanga";
import { NAKSHATRAS, SIGNS } from "@/application/horoscope/vedic-constants";
import {
  swissEphemerisService,
  type AyanamshaMode,
  type CalculationBody,
} from "@/lib/services/swiss-ephemeris";

export type VedicEventCategory =
  "transit" | "retrograde" | "conjunction" | "lunar" | "eclipse" | "panchanga";

export type VedicAstrologyEvent = {
  id: string;
  category: VedicEventCategory;
  eventType: string;
  name: string;
  startIso: string;
  startMs: number;
  localDate: string;
  localTime: string;
  timezone: string;
  planets: string[];
  sign?: string | null;
  nakshatra?: string | null;
  description: string;
  calculationContext: string;
  visibilityScope: "global" | "local";
};

export type PanchangaTransition = {
  atIso: string;
  kind: "Tithi" | "Nakshatra" | "Yoga" | "Karana";
  from: string;
  to: string;
};

export type DailyPanchanga = {
  localDate: string;
  timezone: string;
  basis: "sunrise" | "local-midnight-fallback";
  tithi: ReturnType<typeof tithiForDifference>;
  nakshatra: ReturnType<typeof nakshatraForLongitude>;
  yoga: ReturnType<typeof nityaYogaFor>;
  karana: ReturnType<typeof karanaForDifference>;
  sunriseIso: string | null;
  transitions: PanchangaTransition[];
};

export type VedicCalendarOptions = {
  from: Date;
  to: Date;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsha: AyanamshaMode;
  include?: VedicEventCategory[];
  dailyDays?: number;
};

export type VedicCalendarPayload = {
  generatedAt: string;
  config: {
    zodiac: "sidereal";
    ayanamsha: AyanamshaMode;
    timezone: string;
    latitude: number;
    longitude: number;
    from: string;
    to: string;
    engine: "swiss-ephemeris";
  };
  events: VedicAstrologyEvent[];
  dailyPanchanga: DailyPanchanga[];
  limitations: string[];
};

type Sample = { jd: number; value: number };
type Crossing = { jd: number; boundary: number; direction: 1 | -1; reference: number };

const BODY_LABELS: Record<CalculationBody, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  rahu: "Rahu",
};

const TRANSIT_BODIES: CalculationBody[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "rahu",
];

const STATION_BODIES: CalculationBody[] = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

const CONJUNCTION_BODIES: CalculationBody[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "rahu",
];

const CATEGORY_LIMIT = 220;
const cache = new Map<string, { expiresAt: number; value: VedicCalendarPayload }>();

function jdFromMs(timestamp: number): number {
  return timestamp / 86400000 + 2440587.5;
}

function unwrapNear(value: number, reference: number): number {
  return reference + (((value - reference + 540) % 360) - 180);
}

function signedDifference(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

function refineLongitudinalCrossing(
  sample: (jd: number) => number,
  leftJd: number,
  rightJd: number,
  boundary: number,
  reference: number,
): number {
  let lo = leftJd;
  let hi = rightJd;
  let loValue = unwrapNear(sample(lo), reference) - boundary;
  for (let index = 0; index < 40; index += 1) {
    const mid = (lo + hi) / 2;
    const midValue = unwrapNear(sample(mid), reference) - boundary;
    if (loValue <= 0 === midValue <= 0) {
      lo = mid;
      loValue = midValue;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

function refineSpeedStation(
  sample: (jd: number) => number,
  leftJd: number,
  rightJd: number,
): number {
  let lo = leftJd;
  let hi = rightJd;
  let loValue = sample(lo);
  for (let index = 0; index < 40; index += 1) {
    const mid = (lo + hi) / 2;
    const midValue = sample(mid);
    if (loValue <= 0 === midValue <= 0) {
      lo = mid;
      loValue = midValue;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

function detectCrossings(samples: Sample[], span: number): Crossing[] {
  const crossings: Crossing[] = [];
  if (samples.length < 2) return crossings;
  let previous = samples[0]!.value;
  for (let index = 1; index < samples.length; index += 1) {
    const current = unwrapNear(samples[index]!.value, previous);
    const fromLevel = Math.floor(previous / span);
    const toLevel = Math.floor(current / span);
    if (fromLevel !== toLevel) {
      const direction: 1 | -1 = toLevel > fromLevel ? 1 : -1;
      const boundary = direction === 1 ? (fromLevel + 1) * span : fromLevel * span;
      crossings.push({ jd: samples[index]!.jd, boundary, direction, reference: previous });
    }
    previous = current;
  }
  return crossings;
}

function localParts(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

function makeEvent(
  input: Omit<
    VedicAstrologyEvent,
    "id" | "timezone" | "startIso" | "startMs" | "localDate" | "localTime"
  > & { jd: number },
  timezone: string,
): VedicAstrologyEvent {
  const { jd, ...rest } = input;
  const startMs = jdToUnixMs(jd);
  const local = localParts(startMs, timezone);
  const slug = `${input.eventType}-${input.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    ...rest,
    id: `${startMs}-${slug}`,
    timezone,
    startMs,
    startIso: new Date(startMs).toISOString(),
    localDate: local.date,
    localTime: local.time,
  };
}

function signName(boundary: number): string {
  const index = ((Math.round(boundary / 30) % 12) + 12) % 12;
  return SIGNS[index] || "Aries";
}

function tithiTransitionName(boundary: number, direction: 1 | -1) {
  const value = tithiForDifference(boundary + direction * 0.001);
  return `${value.paksha} ${value.name}`;
}

function nakshatraTransitionName(boundary: number, direction: 1 | -1) {
  const index = Math.min(
    26,
    Math.max(0, Math.floor(norm360(boundary + direction * 0.001) / (360 / 27))),
  );
  return NAKSHATRAS[index] || "Ashwini";
}

function yogaTransitionName(boundary: number, direction: 1 | -1) {
  const index = Math.min(
    26,
    Math.max(0, Math.floor(norm360(boundary + direction * 0.001) / (360 / 27))),
  );
  return YOGA_NAMES[index] || "Vishkumbha";
}

function karanaTransitionName(boundary: number, direction: 1 | -1): string {
  return karanaForDifference(boundary + direction * 0.001).name ?? "Bava";
}

function eclipseTypeName(flag: number, kind: "solar" | "lunar"): string {
  const names: string[] = [];
  if (flag & 4) names.push("Total");
  if (flag & 8) names.push("Annular");
  if (flag & 16) names.push("Partial");
  if (flag & 64) names.push("Penumbral");
  if (flag & 32) names.push("Annular-total");
  return `${names.join("/") || "Eclipse"} ${kind === "solar" ? "solar eclipse" : "lunar eclipse"}`;
}

function buildSamples(
  fromJd: number,
  toJd: number,
  stepDays: number,
  sample: (jd: number) => number,
): Sample[] {
  const samples: Sample[] = [];
  for (let jd = fromJd; jd <= toJd + stepDays; jd += stepDays) {
    samples.push({ jd: Math.min(jd, toJd + stepDays), value: sample(jd) });
  }
  return samples;
}

function pushLimited<T>(target: T[], item: T) {
  if (target.length < CATEGORY_LIMIT) target.push(item);
}

function generateTransits(
  options: VedicCalendarOptions,
  fromJd: number,
  toJd: number,
  stepDays: number,
): VedicAstrologyEvent[] {
  const events: VedicAstrologyEvent[] = [];
  for (const body of TRANSIT_BODIES) {
    const longitude = (jd: number) =>
      swissEphemerisService.calculateBody(jd, body, options.ayanamsha).longitude;
    const samples = buildSamples(fromJd, toJd, stepDays, longitude);
    for (const crossing of detectCrossings(samples, 30)) {
      const crossingIndex = samples.findIndex((sample) => sample.jd === crossing.jd);
      const jd = refineLongitudinalCrossing(
        longitude,
        samples[Math.max(0, crossingIndex - 1)]!.jd,
        crossing.jd,
        crossing.boundary,
        crossing.reference,
      );
      const nextSign = signName(
        crossing.direction === 1 ? crossing.boundary : crossing.boundary - 30,
      );
      pushLimited(
        events,
        makeEvent(
          {
            jd,
            category: "transit",
            eventType: "rashi-ingress",
            name: `${BODY_LABELS[body]} enters ${nextSign}`,
            planets: [BODY_LABELS[body]],
            sign: nextSign,
            nakshatra: nakshatraForLongitude(longitude(jd)).name,
            description: `${BODY_LABELS[body]} crosses a 30° sidereal rashi boundary into ${nextSign}.`,
            calculationContext:
              "Sidereal geocentric longitude from Swiss Ephemeris; boundary time refined by bisection.",
            visibilityScope: "global",
          },
          options.timezone,
        ),
      );
    }
  }
  return events;
}

function generateStations(
  options: VedicCalendarOptions,
  fromJd: number,
  toJd: number,
  stepDays: number,
): VedicAstrologyEvent[] {
  const events: VedicAstrologyEvent[] = [];
  for (const body of STATION_BODIES) {
    const speed = (jd: number) =>
      swissEphemerisService.calculateBody(jd, body, options.ayanamsha).speedLongitude;
    let previousJd = fromJd;
    let previousSpeed = speed(previousJd);
    for (let jd = fromJd + stepDays; jd <= toJd + stepDays; jd += stepDays) {
      const currentJd = Math.min(jd, toJd + stepDays);
      const currentSpeed = speed(currentJd);
      const becomingRetrograde = previousSpeed > 0 && currentSpeed <= 0;
      const becomingDirect = previousSpeed < 0 && currentSpeed >= 0;
      if (becomingRetrograde || becomingDirect) {
        const stationJd = refineSpeedStation(speed, previousJd, currentJd);
        const longitude = swissEphemerisService.calculateBody(
          stationJd,
          body,
          options.ayanamsha,
        ).longitude;
        pushLimited(
          events,
          makeEvent(
            {
              jd: stationJd,
              category: "retrograde",
              eventType: becomingRetrograde ? "retrograde-station" : "direct-station",
              name: `${BODY_LABELS[body]} ${becomingRetrograde ? "turns retrograde" : "turns direct"}`,
              planets: [BODY_LABELS[body]],
              sign: SIGNS[Math.floor(norm360(longitude) / 30)] || "Aries",
              nakshatra: nakshatraForLongitude(longitude).name,
              description: `Apparent geocentric longitude speed changes sign at ${norm360(longitude).toFixed(2)}° sidereal.`,
              calculationContext:
                "Apparent geocentric speed from Swiss Ephemeris; station time refined to speed = 0 by bisection.",
              visibilityScope: "global",
            },
            options.timezone,
          ),
        );
      }
      previousJd = currentJd;
      previousSpeed = currentSpeed;
    }
  }
  return events;
}

function generateConjunctions(
  options: VedicCalendarOptions,
  fromJd: number,
  toJd: number,
  stepDays: number,
): VedicAstrologyEvent[] {
  const events: VedicAstrologyEvent[] = [];
  const longitude = (body: CalculationBody, jd: number) =>
    swissEphemerisService.calculateBody(jd, body, options.ayanamsha).longitude;

  for (let a = 0; a < CONJUNCTION_BODIES.length; a += 1) {
    for (let b = a + 1; b < CONJUNCTION_BODIES.length; b += 1) {
      const first = CONJUNCTION_BODIES[a]!;
      const second = CONJUNCTION_BODIES[b]!;
      const separation = (jd: number) =>
        signedDifference(longitude(first, jd), longitude(second, jd));
      let previousJd = fromJd;
      let previous = separation(previousJd);
      for (let jd = fromJd + stepDays; jd <= toJd + stepDays; jd += stepDays) {
        const currentJd = Math.min(jd, toJd + stepDays);
        const current = separation(currentJd);
        const crossed = (previous < 0 && current >= 0) || (previous > 0 && current <= 0);
        if (crossed && Math.abs(previous) < 6 && Math.abs(current) < 6) {
          const conjunctionJd = refineLongitudinalCrossing(
            separation,
            previousJd,
            currentJd,
            0,
            previous,
          );
          const firstLongitude = longitude(first, conjunctionJd);
          pushLimited(
            events,
            makeEvent(
              {
                jd: conjunctionJd,
                category: "conjunction",
                eventType: "exact-conjunction",
                name: `${BODY_LABELS[first]} conjunct ${BODY_LABELS[second]}`,
                planets: [BODY_LABELS[first], BODY_LABELS[second]],
                sign: SIGNS[Math.floor(norm360(firstLongitude) / 30)] || "Aries",
                nakshatra: nakshatraForLongitude(firstLongitude).name,
                description: `Exact sidereal longitude conjunction of ${BODY_LABELS[first]} and ${BODY_LABELS[second]} (0° angular separation).`,
                calculationContext:
                  "Swiss Ephemeris sidereal longitudes; zero separation refined numerically. Broader aspects are not reported as conjunctions.",
                visibilityScope: "global",
              },
              options.timezone,
            ),
          );
        }
        previousJd = currentJd;
        previous = current;
      }
    }
  }
  return events;
}

function generatePanchangaEvents(
  options: VedicCalendarOptions,
  fromJd: number,
  toJd: number,
  stepDays: number,
): VedicAstrologyEvent[] {
  const events: VedicAstrologyEvent[] = [];
  const difference = (jd: number) => {
    const positions = swissEphemerisService.calculatePlanets(jd, options.ayanamsha);
    return positions.moon.longitude - positions.sun.longitude;
  };
  const moonLongitude = (jd: number) =>
    swissEphemerisService.calculateBody(jd, "moon", options.ayanamsha).longitude;
  const combinedLongitude = (jd: number) => {
    const positions = swissEphemerisService.calculatePlanets(jd, options.ayanamsha);
    return positions.sun.longitude + positions.moon.longitude;
  };

  const addCrossings = (
    kind: "Tithi" | "Nakshatra" | "Yoga" | "Karana",
    span: number,
    sampler: (jd: number) => number,
    label: (boundary: number, direction: 1 | -1) => string,
  ) => {
    const samples = buildSamples(fromJd, toJd, stepDays, sampler);
    const startIndex = samples.findIndex((sample) => sample.jd >= fromJd);
    for (const crossing of detectCrossings(samples, span)) {
      const crossingIndex = samples.findIndex((sample) => sample.jd === crossing.jd);
      const leftJd = samples[Math.max(startIndex, crossingIndex - 1)]!.jd;
      const jd = refineLongitudinalCrossing(
        sampler,
        leftJd,
        crossing.jd,
        crossing.boundary,
        crossing.reference,
      );
      const next = label(crossing.boundary, crossing.direction);
      pushLimited(
        events,
        makeEvent(
          {
            jd,
            category: "panchanga",
            eventType: `${kind.toLowerCase()}-transition`,
            name: `${kind} · ${next} begins`,
            planets: ["Sun", "Moon"],
            description: `${kind} boundary crossing at the computed instant; the previous value remains active until this time.`,
            calculationContext:
              "Swiss Ephemeris sidereal Sun/Moon longitudes; boundary refined numerically, not assigned to the whole day.",
            visibilityScope: "global",
          },
          options.timezone,
        ),
      );
    }
  };

  addCrossings("Tithi", 12, difference, tithiTransitionName);
  addCrossings("Nakshatra", 360 / 27, moonLongitude, nakshatraTransitionName);
  addCrossings("Yoga", 360 / 27, combinedLongitude, yogaTransitionName);
  addCrossings("Karana", 6, difference, karanaTransitionName);
  return events;
}

function generateLunarPhases(
  options: VedicCalendarOptions,
  fromJd: number,
  toJd: number,
  stepDays: number,
): VedicAstrologyEvent[] {
  const events: VedicAstrologyEvent[] = [];
  const difference = (jd: number) => {
    const positions = swissEphemerisService.calculatePlanets(jd, options.ayanamsha);
    return positions.moon.longitude - positions.sun.longitude;
  };
  const samples = buildSamples(fromJd, toJd, stepDays, difference);
  const crossings = detectCrossings(samples, 180);
  for (const crossing of crossings) {
    const crossingIndex = samples.findIndex((sample) => sample.jd === crossing.jd);
    const left = samples[Math.max(0, crossingIndex - 1)]!;
    const jd = refineLongitudinalCrossing(
      difference,
      left.jd,
      crossing.jd,
      crossing.boundary,
      crossing.reference,
    );
    const phase =
      Math.abs((((crossing.boundary % 360) + 360) % 360) - 180) < 1 ? "Purnima" : "Amavasya";
    pushLimited(
      events,
      makeEvent(
        {
          jd,
          category: "lunar",
          eventType: phase === "Purnima" ? "full-moon" : "new-moon",
          name: phase === "Purnima" ? "Purnima · full Moon" : "Amavasya · new Moon",
          planets: ["Sun", "Moon"],
          description:
            phase === "Purnima"
              ? "Sun–Moon longitude difference reaches 180° (sidereal lunar fullness)."
              : "Sun–Moon longitude difference reaches 0° (sidereal new Moon).",
          calculationContext:
            "Swiss Ephemeris sidereal longitudes; phase instant refined from the Sun–Moon longitude difference.",
          visibilityScope: "global",
        },
        options.timezone,
      ),
    );
  }
  return events;
}

function generateEclipses(options: VedicCalendarOptions, fromJd: number, toJd: number) {
  const events: VedicAstrologyEvent[] = [];
  const seen = new Set<string>();

  const addEclipse = (jd: number, kind: "solar" | "lunar", flag: number) => {
    const key = `${kind}-${jd.toFixed(4)}`;
    if (seen.has(key)) return;
    seen.add(key);
    pushLimited(
      events,
      makeEvent(
        {
          jd,
          category: "eclipse",
          eventType: kind === "solar" ? "solar-eclipse" : "lunar-eclipse",
          name: eclipseTypeName(flag, kind),
          planets: kind === "solar" ? ["Sun", "Moon"] : ["Sun", "Moon", "Rahu/Ketu"],
          description: `Maximum of a ${kind} eclipse found by Swiss Ephemeris global eclipse search.`,
          calculationContext:
            "Swiss Ephemeris global eclipse search. Visibility at the selected location is not asserted.",
          visibilityScope: "global",
        },
        options.timezone,
      ),
    );
  };

  let cursor = fromJd;
  for (let index = 0; index < 24; index += 1) {
    const result = swissEphemerisService.findSolarEclipse(cursor);
    if (!result || result.jd > toJd) break;
    addEclipse(result.jd, "solar", result.type);
    cursor = result.jd + 1;
  }

  cursor = fromJd;
  for (let index = 0; index < 24; index += 1) {
    const result = swissEphemerisService.findLunarEclipse(cursor);
    if (!result || result.jd > toJd) break;
    addEclipse(result.jd, "lunar", result.type);
    cursor = result.jd + 1;
  }

  return events;
}

function buildDailyPanchanga(options: VedicCalendarOptions, events: VedicAstrologyEvent[]) {
  const days = Math.min(31, Math.max(1, options.dailyDays ?? 14));
  const first = localParts(options.from.getTime(), options.timezone).date;
  const [year, month, day] = first.split("-").map(Number);
  const daily: DailyPanchanga[] = [];

  for (let index = 0; index < days; index += 1) {
    const midnight = Date.UTC(year!, month! - 1, day! + index, 0, 0, 0);
    const dateLabel = new Date(midnight).toISOString().slice(0, 10);
    const dayJd = jdFromMs(midnight);
    let basis: DailyPanchanga["basis"] = "sunrise";
    let referenceJd = dayJd;
    let sunriseIso: string | null = null;
    try {
      const sunrise = swissEphemerisService.calculateRiseSet(
        dayJd,
        options.latitude,
        options.longitude,
        "sun",
      );
      if (sunrise.rise !== null) {
        referenceJd = sunrise.rise;
        sunriseIso = new Date(jdToUnixMs(sunrise.rise)).toISOString();
      } else {
        basis = "local-midnight-fallback";
      }
    } catch {
      basis = "local-midnight-fallback";
    }

    const positions = swissEphemerisService.calculatePlanets(referenceJd, options.ayanamsha);
    const difference = positions.moon.longitude - positions.sun.longitude;
    const transitions: PanchangaTransition[] = events
      .filter((event) => event.category === "panchanga" && event.localDate === dateLabel)
      .map((event) => ({
        atIso: event.startIso,
        kind: event.eventType.split("-")[0] as PanchangaTransition["kind"],
        from: "previous value",
        to: event.name.split("·").slice(1).join("·").trim() || event.name,
      }));

    daily.push({
      localDate: dateLabel,
      timezone: options.timezone,
      basis,
      tithi: tithiForDifference(difference),
      nakshatra: nakshatraForLongitude(positions.moon.longitude),
      yoga: nityaYogaFor({ sun: positions.sun.longitude, moon: positions.moon.longitude }),
      karana: karanaForDifference(difference),
      sunriseIso,
      transitions,
    });
  }

  return daily;
}

export function computeVedicCalendar(input: VedicCalendarOptions): VedicCalendarPayload {
  swissEphemerisService.initialize(process.env.SWISS_EPHEMERIS_PATH);
  const from = input.from.getTime();
  const to = Math.max(input.to.getTime(), from);
  const rangeDays = (to - from) / 86400000;
  if (rangeDays > 730) {
    throw new Error("Astrology event window cannot exceed 730 days");
  }

  const cacheKey = JSON.stringify({
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    ayanamsha: input.ayanamsha,
    include: input.include ?? null,
    dailyDays: input.dailyDays ?? 14,
  });
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const include = new Set<VedicEventCategory>(
    input.include ?? ["transit", "retrograde", "conjunction", "lunar", "eclipse", "panchanga"],
  );
  const fromJd = jdFromMs(from);
  const toJd = jdFromMs(to);
  const stepDays = rangeDays > 365 ? 0.5 : 0.25;
  const generated: VedicAstrologyEvent[] = [];

  if (include.has("transit")) generated.push(...generateTransits(input, fromJd, toJd, stepDays));
  if (include.has("retrograde")) generated.push(...generateStations(input, fromJd, toJd, stepDays));
  if (include.has("conjunction"))
    generated.push(...generateConjunctions(input, fromJd, toJd, stepDays));
  if (include.has("panchanga"))
    generated.push(...generatePanchangaEvents(input, fromJd, toJd, stepDays));
  if (include.has("lunar")) generated.push(...generateLunarPhases(input, fromJd, toJd, stepDays));
  if (include.has("eclipse")) generated.push(...generateEclipses(input, fromJd, toJd));

  const events = generated
    .filter((event) => include.has(event.category))
    .sort((a, b) => a.startMs - b.startMs || a.name.localeCompare(b.name));

  const value: VedicCalendarPayload = {
    generatedAt: new Date().toISOString(),
    config: {
      zodiac: "sidereal",
      ayanamsha: input.ayanamsha,
      timezone: input.timezone,
      latitude: input.latitude,
      longitude: input.longitude,
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
      engine: "swiss-ephemeris",
    },
    events,
    dailyPanchanga: buildDailyPanchanga(input, events),
    limitations: [
      "Events are astronomical/calculation-driven; astrological meaning is interpretation and is not generated here.",
      "Eclipse entries are global astronomical maxima and do not assert visibility at the selected location.",
      "Rashi ingress uses whole-sign sidereal boundaries with the configured ayanamsha; other traditions may use different boundary conventions.",
      "Panchanga values can change during the day; daily cards show sunrise values plus the exact transition times.",
    ],
  };

  if (cache.size >= 50) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(cacheKey, { expiresAt: Date.now() + 10 * 60 * 1000, value });
  return value;
}
