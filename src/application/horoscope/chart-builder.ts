import type { PlanetKey, PlanetPosition } from "@/lib/services/swiss-ephemeris";

import {
  HOUSE_LORDS,
  SIGNS,
  dignityForPlanet,
  dignityMark,
  formatDegreeInSign,
  longitudeToNakshatra,
  longitudeToSign,
  wholeSignHouse,
} from "./vedic-constants";
import {
  doesPlanetAspectHouse,
  getMutualAspect,
  isConjunct,
  isExchange,
  isRetrograde,
  isCombust,
  isExalted,
  isDebilitated,
  isInOwnSign,
  isInFriendlySign,
  getExaltationSign,
  getDebilitationSign,
  hasKendraTrikonaRelationship,
  isKendraHouse,
  isTrikonaHouse,
  getHouseFromMoon,
} from "./planetary-aspects";
import {
  analyzeNakshatraPlanets,
  calculateTaraBala,
  detectNakshatraYogas,
  getNakshatraAnalysisSummary,
} from "./nakshatra-yogas";
import {
  calculateJaiminiKaraka,
  calculateArudhaLagna,
  calculateArudhaPadas,
  calculateGhatiLagna,
  calculateHoraLagna,
  detectJaiminiYogas,
  getJaiminiAnalysis,
} from "./jaimini-yogas";

const DISPLAY_NAMES: Record<PlanetKey, string> = {
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
  ketu: "Ketu",
};

export type ChartPlanet = {
  planet: string;
  sign: string;
  signId: number;
  house: number;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraPada: number;
  dignity: string | null;
};

/** Compact glyph stored inside chart boxes (AstroSage-style). */
export type ChartPlanetGlyph = {
  planet: string;
  abbr: string;
  label: string;
  degree: string;
  degreeValue: number;
  dignity: string | null;
  mark: string;
  isRetrograde: boolean;
  house: number;
  signId: number;
};

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const CLASSICAL = new Set([
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
]);

export function toPlanetGlyph(p: ChartPlanet): ChartPlanetGlyph {
  const abbr = PLANET_ABBR[p.planet] ?? p.planet.slice(0, 2);
  const mark = dignityMark(p.dignity);
  const degree = formatDegreeInSign(p.longitude);
  const retro = p.isRetrograde ? "℞" : "";
  return {
    planet: p.planet,
    abbr,
    label: `${abbr}${mark}${retro}`,
    degree,
    degreeValue: (((p.longitude % 360) + 360) % 360) % 30,
    dignity: p.dignity,
    mark,
    isRetrograde: p.isRetrograde,
    house: p.house,
    signId: p.signId,
  };
}

export function buildPlanetRows(
  positions: Record<PlanetKey, PlanetPosition>,
  lagnaLongitude: number,
): ChartPlanet[] {
  const lagna = longitudeToSign(lagnaLongitude);
  return (Object.keys(positions) as PlanetKey[]).map((key) => {
    const pos = positions[key];
    const sign = longitudeToSign(pos.longitude);
    const nak = longitudeToNakshatra(pos.longitude);
    const name = DISPLAY_NAMES[key];
    return {
      planet: name,
      sign: sign.sign,
      signId: sign.signId,
      house: wholeSignHouse(sign.signId, lagna.signId),
      longitude: sign.longitude,
      latitude: pos.latitude,
      speed: pos.speedLongitude,
      isRetrograde: pos.speedLongitude < 0,
      nakshatra: nak.nakshatra,
      nakshatraPada: nak.nakshatraPada,
      dignity: ["Rahu", "Ketu", "Uranus", "Neptune", "Pluto"].includes(name)
        ? null
        : dignityForPlanet(name, sign.sign),
    };
  });
}

export function buildHouseLords(lagnaSignId: number): Record<string, string> {
  const lords: Record<string, string> = {};
  for (let i = 0; i < 12; i += 1) {
    const sign = SIGNS[(lagnaSignId + i) % 12] ?? "Aries";
    lords[String(i + 1)] = HOUSE_LORDS[sign];
  }
  return lords;
}

export function detectManglik(planets: ChartPlanet[]): {
  status: "NON_MANGLIK" | "PARTIAL" | "MANGLIK";
  notes: string;
} {
  const mars = planets.find((p) => p.planet === "Mars");
  if (!mars) return { status: "NON_MANGLIK", notes: "Mars not found in chart." };
  const manglikHouses = new Set([1, 2, 4, 7, 8, 12]);
  if (manglikHouses.has(mars.house)) {
    if (mars.house === 2 || mars.house === 8) {
      return {
        status: "PARTIAL",
        notes: `Mars in house ${mars.house} (${mars.sign}) — traditionally partial Manglik consideration.`,
      };
    }
    return {
      status: "MANGLIK",
      notes: `Mars in house ${mars.house} (${mars.sign}) — Manglik yoga indicated by classical house rule.`,
    };
  }
  return {
    status: "NON_MANGLIK",
    notes: `Mars in house ${mars.house} (${mars.sign}) — not in classical Manglik houses.`,
  };
}

export function detectDoshas(planets: ChartPlanet[], manglikStatus: string) {
  const rahu = planets.find((p) => p.planet === "Rahu");
  const ketu = planets.find((p) => p.planet === "Ketu");
  const classical = planets.filter((p) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(p.planet),
  );

  let kalaPresent = false;
  let kalaNotes = "Rahu–Ketu axis not available for Kaal Sarp scan.";
  if (rahu && ketu && classical.length >= 5) {
    const rSign = rahu.signId;
    const kSign = ketu.signId;
    const forward: number[] = [];
    for (let s = (rSign + 1) % 12; s !== kSign; s = (s + 1) % 12) forward.push(s);
    const backward: number[] = [];
    for (let s = (kSign + 1) % 12; s !== rSign; s = (s + 1) % 12) backward.push(s);
    const allIn = (arc: number[]) => classical.every((p) => arc.includes(p.signId));
    kalaPresent =
      (forward.length > 0 && allIn(forward)) || (backward.length > 0 && allIn(backward));
    kalaNotes = kalaPresent
      ? `All classical planets lie on one side of the Rahu (${rahu.sign})–Ketu (${ketu.sign}) axis.`
      : `Planets are distributed across the Rahu (${rahu.sign})–Ketu (${ketu.sign}) axis — full Kaal Sarp not indicated.`;
  }

  const manglikNotes =
    manglikStatus === "MANGLIK"
      ? "Mars occupies a classical Manglik house."
      : manglikStatus === "PARTIAL"
        ? "Mars in house 2 or 8 — traditionally partial Manglik consideration."
        : "Mars is outside classical Manglik houses.";

  return [
    {
      code: "MANGLIK",
      name: "Manglik Dosha",
      present: manglikStatus !== "NON_MANGLIK",
      severity:
        manglikStatus === "MANGLIK" ? "HIGH" : manglikStatus === "PARTIAL" ? "MEDIUM" : "NONE",
      notes: manglikNotes,
    },
    {
      code: "KALA_SARPA",
      name: "Kaal Sarp Dosha",
      present: kalaPresent,
      severity: kalaPresent ? "MEDIUM" : "NONE",
      notes: kalaNotes,
    },
  ];
}

interface YogaResult {
  code: string;
  name: string;
  category: "MARRIAGE" | "CAREER" | "WEALTH" | "HEALTH" | "GENERAL";
  strength: number;
  description: string;
  details?: {
    planets: string[];
    houses: number[];
    signs: string[];
    condition: string;
    classicalReference: string;
  };
}

function getAngularDistance(long1: number, long2: number): number {
  const diff = Math.abs(long1 - long2);
  return diff > 180 ? 360 - diff : diff;
}

export function detectYogas(planets: ChartPlanet[], lagnaSign: string): YogaResult[] {
  const yogas: YogaResult[] = [];

  const byName = (name: string) => planets.find((p) => p.planet === name);
  const jupiter = byName("Jupiter");
  const venus = byName("Venus");
  const moon = byName("Moon");
  const mercury = byName("Mercury");
  const sun = byName("Sun");
  const mars = byName("Mars");
  const saturn = byName("Saturn");

  const lagnaSignId = Math.max(0, SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]));
  const houseLords = buildHouseLords(lagnaSignId);

  const lordOf = (house: number) => houseLords[String(house)];
  const placement = (lordName: string | undefined) =>
    lordName ? planets.find((p) => p.planet === lordName) : undefined;

  // ============================================
  // 1. KENDRA-TRIKONA RAJA YOGA
  // ============================================
  // Association between Kendra lords (1, 4, 7, 10) and Trikona lords (1, 5, 9)
  // Through: Conjunction, Mutual Aspect, Exchange (Parivartana), or Kendra-Trikona placement
  const kendraLords = [1, 4, 7, 10].map(lordOf).filter(Boolean) as string[];
  const trikonaLords = [1, 5, 9].map(lordOf).filter(Boolean) as string[];

  for (const kLordName of kendraLords) {
    for (const tLordName of trikonaLords) {
      if (kLordName === tLordName) continue; // Same planet ruling both
      
      const kLord = placement(kLordName);
      const tLord = placement(tLordName);
      if (!kLord || !tLord) continue;

      let condition = "";
      let strength = 0;

      // Check conjunction (same house)
      if (isConjunct(kLord, tLord)) {
        condition = `Conjunction in house ${kLord.house} (${kLord.sign})`;
        strength = 90;
      }
      // Check mutual aspect (Parashari drishti)
      else if (getMutualAspect(kLord.planet, tLord.planet, kLord.house, tLord.house)) {
        condition = `Mutual aspect: ${kLord.planet} in H${kLord.house} aspects ${tLord.planet} in H${tLord.house} and vice versa`;
        strength = 85;
      }
      // Check exchange (Parivartana Yoga)
      else if (isExchange(kLord, tLord, lagnaSignId, houseLords)) {
        condition = `Parivartana (exchange): ${kLord.planet} in ${kLord.sign} (lord of ${tLord.sign}), ${tLord.planet} in ${tLord.sign} (lord of ${kLord.sign})`;
        strength = 95;
      }
      // Check Kendra-Trikona relationship
      else if (hasKendraTrikonaRelationship(kLord.house, tLord.house)) {
        condition = `Kendra-Trikona association: ${kLord.planet} in H${kLord.house} (${isKendraHouse(kLord.house) ? "Kendra" : isTrikonaHouse(kLord.house) ? "Trikona" : "Other"}), ${tLord.planet} in H${tLord.house} (${isKendraHouse(tLord.house) ? "Kendra" : isTrikonaHouse(tLord.house) ? "Trikona" : "Other"})`;
        strength = 75;
      }

      if (condition) {
        yogas.push({
          code: "RAJA_YOGA",
          name: "Raja Yoga (Kendra-Trikona)",
          category: "CAREER",
          strength,
          description: `${kLordName} (kendra lord) and ${tLordName} (trikona lord) associate via ${condition}. Classically supports recognition, authority, and life elevation when dasha supports.`,
          details: {
            planets: [kLordName, tLordName],
            houses: [kLord.house, tLord.house],
            signs: [kLord.sign, tLord.sign],
            condition,
            classicalReference: "BPHS 41.1-41.3: Kendra lord and Trikona lord association forms Raja Yoga",
          },
        });
        break;
      }
    }
    if (yogas.some((y) => y.code === "RAJA_YOGA")) break;
  }

  // ============================================
  // 2. DHARMA-KARMADHIPATI YOGA (9th & 10th Lords)
  // ============================================
  const ninthLord = placement(lordOf(9));
  const tenthLord = placement(lordOf(10));
  
  if (ninthLord && tenthLord && ninthLord.planet !== tenthLord.planet) {
    let condition = "";
    let strength = 0;

    if (isConjunct(ninthLord, tenthLord)) {
      condition = `Conjunction in house ${ninthLord.house} (${ninthLord.sign})`;
      strength = 90;
    }
    else if (getMutualAspect(ninthLord.planet, tenthLord.planet, ninthLord.house, tenthLord.house)) {
      condition = `Mutual aspect: ${ninthLord.planet} in H${ninthLord.house} aspects ${tenthLord.planet} in H${tenthLord.house} and vice versa`;
      strength = 85;
    }
    else if (isExchange(ninthLord, tenthLord, lagnaSignId, houseLords)) {
      condition = `Parivartana: ${ninthLord.planet} in ${ninthLord.sign} (lord of ${tenthLord.sign}), ${tenthLord.planet} in ${tenthLord.sign} (lord of ${ninthLord.sign})`;
      strength = 95;
    }
    else if (hasKendraTrikonaRelationship(ninthLord.house, tenthLord.house)) {
      condition = `Kendra-Trikona association between 9th lord (H${ninthLord.house}) and 10th lord (H${tenthLord.house})`;
      strength = 75;
    }

    if (condition) {
      yogas.push({
        code: "DHARMA_KARMADHIPATI",
        name: "Dharma-Karmadhipati Yoga",
        category: "CAREER",
        strength,
        description: `9th lord (${ninthLord.planet}) and 10th lord (${tenthLord.planet}) associate via ${condition}. Connects fortune, dharma, and profession — supports purposeful vocation and public standing.`,
        details: {
          planets: [ninthLord.planet, tenthLord.planet],
          houses: [ninthLord.house, tenthLord.house],
          signs: [ninthLord.sign, tenthLord.sign],
          condition,
          classicalReference: "BPHS 41.33: 9th and 10th lord association forms Dharma-Karmadhipati Yoga",
        },
      });
    }
  }

  // ============================================
  // 3. GAJAKESARI YOGA (Jupiter in Kendra from Moon)
  // ============================================
  if (jupiter && moon) {
    const fromMoon = ((jupiter.house - moon.house + 12) % 12) + 1;
    const angularDist = getAngularDistance(jupiter.longitude, moon.longitude);
    
    // Jupiter in kendra from Moon (1, 4, 7, 10 houses from Moon)
    // Also check degree proximity for stronger yoga (< 30° for conjunction-like effect)
    if ([1, 4, 7, 10].includes(fromMoon)) {
      let condition = `Jupiter in ${["1st", "4th", "7th", "10th"][[1,4,7,10].indexOf(fromMoon)]} from Moon`;
      let strength = 78;
      
      // If also conjunct or very close in degrees, increase strength
      if (angularDist < 10) {
        condition += ` (close conjunction: ${angularDist.toFixed(1)}°)`;
        strength = 90;
      } else if (angularDist < 20) {
        condition += ` (near conjunction: ${angularDist.toFixed(1)}°)`;
        strength = 85;
      }
      
      yogas.push({
        code: "GAJAKESARI",
        name: "Gaja Kesari Yoga",
        category: "WEALTH",
        strength,
        description: `${condition}. Moon in H${moon.house} (${moon.sign}), Jupiter in H${jupiter.house} (${jupiter.sign}). Favors wisdom, reputation, prosperity, and dignified speech.`,
        details: {
          planets: ["Moon", "Jupiter"],
          houses: [moon.house, jupiter.house],
          signs: [moon.sign, jupiter.sign],
          condition,
          classicalReference: "BPHS: Jupiter in Kendra from Moon forms Gaja Kesari Yoga",
        },
      });
    }
  }

  // ============================================
  // 4. BUDHADITYA YOGA (Sun-Mercury Conjunction)
  // ============================================
  if (sun && mercury && isConjunct(sun, mercury)) {
    const angularDist = getAngularDistance(sun.longitude, mercury.longitude);
    let strength = 70;
    let condition = `Conjunction in house ${sun.house} (${sun.sign})`;
    
    if (angularDist < 5) {
      condition += ` (very tight: ${angularDist.toFixed(1)}°)`;
      strength = 85;
    } else if (angularDist < 15) {
      condition += ` (${angularDist.toFixed(1)}° apart)`;
      strength = 78;
    }
    
    // Check if combust
    const combust = isCombust(mercury, sun);
    if (combust) {
      condition += " — Mercury combust";
      strength = Math.max(50, strength - 15);
    }

    yogas.push({
      code: "BUDHADITYA",
      name: "Budhaditya Yoga",
      category: "CAREER",
      strength,
      description: `${condition}. Supports intellect, communication, analytical skill, and professional clarity.`,
      details: {
        planets: ["Sun", "Mercury"],
        houses: [sun.house, mercury.house],
        signs: [sun.sign, mercury.sign],
        condition,
        classicalReference: "BPHS: Sun-Mercury conjunction forms Budhaditya Yoga",
      },
    });
  }

  // ============================================
  // 5. CHANDRA-MANGAL YOGA (Moon-Mars Conjunction/Association)
  // ============================================
  if (moon && mars) {
    let condition = "";
    let strength = 0;
    
    if (isConjunct(moon, mars)) {
      condition = `Conjunction in house ${moon.house} (${moon.sign})`;
      strength = 75;
    } else if (getMutualAspect(moon.planet, mars.planet, moon.house, mars.house)) {
      condition = `Mutual aspect: Moon in H${moon.house} aspects Mars in H${mars.house} and vice versa`;
      strength = 65;
    } else if (hasKendraTrikonaRelationship(moon.house, mars.house)) {
      condition = `Kendra-Trikona association between Moon (H${moon.house}) and Mars (H${mars.house})`;
      strength = 60;
    }
    
    if (condition) {
      yogas.push({
        code: "CHANDRA_MANGAL",
        name: "Chandra-Mangal Yoga",
        category: "WEALTH",
        strength,
        description: `${condition}. Moon (${moon.sign}) and Mars (${mars.sign}) associate — supports wealth acquisition, entrepreneurship, and material success.`,
        details: {
          planets: ["Moon", "Mars"],
          houses: [moon.house, mars.house],
          signs: [moon.sign, mars.sign],
          condition,
          classicalReference: "Classical texts: Moon-Mars association gives wealth and property",
        },
      });
    }
  }

  // ============================================
  // 6. PANCHA MAHAPURUSHA YOGAS
  // ============================================
  // Ruchaka (Mars), Bhadra (Mercury), Hamsa (Jupiter), Malavya (Venus), Shasha (Saturn)
  // Planet in own/exaltation sign AND in Kendra (1, 4, 7, 10)
  const mahapurushaPlanets = [
    { planet: mars, name: "Mars", yoga: "RUCHAKA", display: "Ruchaka Yoga", category: "CAREER" as const },
    { planet: mercury, name: "Mercury", yoga: "BHADRA", display: "Bhadra Yoga", category: "CAREER" as const },
    { planet: jupiter, name: "Jupiter", yoga: "HAMSA", display: "Hamsa Yoga", category: "WEALTH" as const },
    { planet: venus, name: "Venus", yoga: "MALAVYA", display: "Malavya Yoga", category: "MARRIAGE" as const },
    { planet: saturn, name: "Saturn", yoga: "SHASHA", display: "Shasha Yoga", category: "CAREER" as const },
  ];

  for (const mp of mahapurushaPlanets) {
    if (!mp.planet) continue;
    
    const p = mp.planet;
    const inKendra = isKendraHouse(p.house);
    const inOwnOrExalted = isInOwnSign(p) || isExalted(p);
    
    if (inKendra && inOwnOrExalted) {
      let condition = `${mp.name} in ${p.sign} (${isExalted(p) ? "exalted" : "own sign"}) in Kendra house ${p.house}`;
      let strength = 85;
      
      if (isExalted(p)) {
        condition += " — exalted";
        strength = 95;
      } else if (isInOwnSign(p)) {
        condition += " — own sign";
        strength = 88;
      }
      
      // Check for cancellation (debilitated in navamsa, combust, etc.)
      if (isCombust(p, sun)) {
        condition += " — combust";
        strength = Math.max(60, strength - 20);
      }
      if (isRetrograde(p) && mp.name !== "Saturn") {
        condition += " — retrograde";
        strength = Math.max(70, strength - 10);
      }
      
      yogas.push({
        code: mp.yoga,
        name: mp.display,
        category: mp.category,
        strength,
        description: `${condition}. One of the five great Mahapurusha yogas — bestows exceptional qualities related to ${mp.name.toLowerCase()}: ${getMahapurushaMeaning(mp.name)}.`,
        details: {
          planets: [mp.name],
          houses: [p.house],
          signs: [p.sign],
          condition,
          classicalReference: `BPHS: ${mp.name} in own/exaltation sign in Kendra forms ${mp.display}`,
        },
      });
    }
  }

  // ============================================
  // 7. NEECHA BHANGA RAJA YOGA
  // ============================================
  // Cancellation of debilitation with Raja Yoga results
  // Conditions (any one):
  // 1. Debilitated planet's sign lord is in Kendra from Lagna or Moon
  // 2. Debilitated planet's exaltation lord is in Kendra from Lagna or Moon  
  // 3. Debilitated planet is conjunct/exalted planet
  // 4. Debilitated planet is in Kendra from Lagna/Moon
  // 5. Debilitated planet's sign lord aspects the debilitated planet
  
  const classicalPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  
  for (const planetName of classicalPlanets) {
    const planet = byName(planetName);
    if (!planet || !isDebilitated(planet)) continue;
    
    const debilSign = getDebilitationSign(planetName);
    const exaltSign = getExaltationSign(planetName);
    if (!debilSign || !exaltSign) continue;
    
    const debilSignLord = HOUSE_LORDS[debilSign as (typeof SIGNS)[number]];
    const exaltSignLord = HOUSE_LORDS[exaltSign as (typeof SIGNS)[number]];
    
    const debilLordPlanet = placement(debilSignLord);
    const exaltLordPlanet = placement(exaltSignLord);
    
    let condition = "";
    let strength = 0;
    let cancelled = false;
    
    // Condition 1: Debilitated planet's sign lord in Kendra from Lagna
    if (debilLordPlanet && isKendraHouse(debilLordPlanet.house)) {
      condition = `${debilSignLord} (lord of ${debilSign}, ${planetName}'s debilitation sign) in Kendra house ${debilLordPlanet.house} from Lagna`;
      cancelled = true;
      strength = 80;
    }
    // Condition 2: Debilitated planet's sign lord in Kendra from Moon
    else if (debilLordPlanet && moon && isKendraHouse(getHouseFromMoon(debilLordPlanet.house, moon.house))) {
      condition = `${debilSignLord} (lord of ${debilSign}) in Kendra from Moon`;
      cancelled = true;
      strength = 78;
    }
    // Condition 3: Exaltation lord in Kendra from Lagna
    else if (exaltLordPlanet && isKendraHouse(exaltLordPlanet.house)) {
      condition = `${exaltSignLord} (lord of ${exaltSign}, ${planetName}'s exaltation sign) in Kendra house ${exaltLordPlanet.house} from Lagna`;
      cancelled = true;
      strength = 82;
    }
    // Condition 4: Exaltation lord in Kendra from Moon
    else if (exaltLordPlanet && moon && isKendraHouse(getHouseFromMoon(exaltLordPlanet.house, moon.house))) {
      condition = `${exaltSignLord} (lord of ${exaltSign}) in Kendra from Moon`;
      cancelled = true;
      strength = 80;
    }
    // Condition 5: Debilitated planet conjunct exalted planet
    else {
      for (const otherName of classicalPlanets) {
        if (otherName === planetName) continue;
        const other = byName(otherName);
        if (!other) continue;
        if (isConjunct(planet, other) && isExalted(other)) {
          condition = `${planetName} (debilitated in ${planet.sign}) conjunct ${otherName} (exalted in ${other.sign})`;
          cancelled = true;
          strength = 85;
          break;
        }
      }
    }
    // Condition 6: Debilitated planet itself in Kendra from Lagna
    if (!cancelled && isKendraHouse(planet.house)) {
      condition = `${planetName} debilitated in ${planet.sign} but placed in Kendra house ${planet.house} from Lagna`;
      cancelled = true;
      strength = 70;
    }
    // Condition 7: Debilitated planet in Kendra from Moon
    if (!cancelled && moon && isKendraHouse(getHouseFromMoon(planet.house, moon.house))) {
      condition = `${planetName} debilitated in ${planet.sign} but in Kendra from Moon`;
      cancelled = true;
      strength = 68;
    }
    // Condition 8: Sign lord aspects the debilitated planet
    if (!cancelled && debilLordPlanet && doesPlanetAspectHouse(debilSignLord, debilLordPlanet.house, planet.house)) {
      condition = `${debilSignLord} (lord of ${debilSign}) aspects debilitated ${planetName} in H${planet.house}`;
      cancelled = true;
      strength = 75;
    }
    
    if (cancelled) {
      yogas.push({
        code: "NEECHA_BHANGA",
        name: `Neecha Bhanga Raja Yoga (${planetName})`,
        category: "CAREER",
        strength,
        description: `${planetName} debilitated in ${planet.sign} (H${planet.house}) — cancellation: ${condition}. Debilitation transformed into Raja Yoga giving exceptional results during ${planetName} dasha.`,
        details: {
          planets: [planetName, debilSignLord, exaltSignLord].filter(Boolean),
          houses: [planet.house, debilLordPlanet?.house, exaltLordPlanet?.house].filter((h): h is number => h !== undefined),
          signs: [planet.sign, debilSign, exaltSign],
          condition,
          classicalReference: "BPHS: Neecha Bhanga conditions — debilitation cancelled by Kendra placement of sign/exaltation lord, conjunction with exalted planet, etc.",
        },
      });
    }
  }

  // ============================================
  // 8. VIPAREETA RAJA YOGA
  // ============================================
  // Harsha: 6th lord in 6, 8, 12
  // Sarala: 8th lord in 6, 8, 12  
  // Vimala: 12th lord in 6, 8, 12
  const dusthanaHouses = new Set([6, 8, 12]);
  
  const vipareetaYogas = [
    { house: 6, name: "HARSHA", display: "Harsha Yoga", lord: lordOf(6) },
    { house: 8, name: "SARALA", display: "Sarala Yoga", lord: lordOf(8) },
    { house: 12, name: "VIMALA", display: "Vimala Yoga", lord: lordOf(12) },
  ];
  
  for (const vy of vipareetaYogas) {
    const lordPlanet = placement(vy.lord);
    if (!lordPlanet) continue;
    
    if (dusthanaHouses.has(lordPlanet.house)) {
      const dusthanaName = lordPlanet.house === 6 ? "6th" : lordPlanet.house === 8 ? "8th" : "12th";
      let condition = `${vy.lord} (${vy.display.split(" ")[0]} lord) placed in ${dusthanaName} house (H${lordPlanet.house} in ${lordPlanet.sign})`;
      let strength = 75;
      
      // Check if the lord is also in own/exalted sign in dusthana (stronger)
      if (isInOwnSign(lordPlanet) || isExalted(lordPlanet)) {
        condition += ` — ${isExalted(lordPlanet) ? "exalted" : "own sign"}`;
        strength = 85;
      }
      
      yogas.push({
        code: vy.name,
        name: vy.display,
        category: "CAREER",
        strength,
        description: `${condition}. Vipareeta Raja Yoga — dusthana lord in dusthana transforms obstacles into success, victory over enemies, and unexpected gains.`,
        details: {
          planets: [vy.lord ?? ""],
          houses: [vy.house, lordPlanet.house],
          signs: [SIGNS[(lagnaSignId + vy.house - 1) % 12] ?? "", lordPlanet.sign],
          condition,
          classicalReference: `BPHS: ${vy.house}th lord in 6, 8, or 12 forms ${vy.display}`,
        },
      });
    }
  }

  // ============================================
  // 9. DHANA YOGAS (Wealth Yogas)
  // ============================================
  // 2nd & 11th lords association
  // 2nd & 5th lords association
  // 2nd & 9th lords association
  // 5th & 9th lords association (Lakshmi Yoga)
  // 11th lord in Kendra/Trikona
  
  const dhanaPairs = [
    { h1: 2, h2: 11, name: "2nd-11th" },
    { h1: 2, h2: 5, name: "2nd-5th" },
    { h1: 2, h2: 9, name: "2nd-9th" },
    { h1: 5, h2: 9, name: "5th-9th (Lakshmi)" },
    { h1: 11, h2: 9, name: "11th-9th" },
  ];
  
  for (const pair of dhanaPairs) {
    const lord1 = placement(lordOf(pair.h1));
    const lord2 = placement(lordOf(pair.h2));
    
    if (!lord1 || !lord2 || lord1.planet === lord2.planet) continue;
    
    let condition = "";
    let strength = 0;
    
    if (isConjunct(lord1, lord2)) {
      condition = `Conjunction in H${lord1.house} (${lord1.sign})`;
      strength = 85;
    } else if (getMutualAspect(lord1.planet, lord2.planet, lord1.house, lord2.house)) {
      condition = `Mutual aspect between ${lord1.planet} (H${lord1.house}) and ${lord2.planet} (H${lord2.house})`;
      strength = 80;
    } else if (isExchange(lord1, lord2, lagnaSignId, houseLords)) {
      condition = `Parivartana between ${lord1.planet} and ${lord2.planet}`;
      strength = 90;
    } else if (hasKendraTrikonaRelationship(lord1.house, lord2.house)) {
      condition = `Kendra-Trikona association between ${lord1.planet} (H${lord1.house}) and ${lord2.planet} (H${lord2.house})`;
      strength = 70;
    }
    
    if (condition) {
      yogas.push({
        code: "DHANA_YOGA",
        name: `Dhana Yoga (${pair.name} lords)`,
        category: "WEALTH",
        strength,
        description: `${lordOf(pair.h1)} (${pair.h1}th lord) and ${lordOf(pair.h2)} (${pair.h2}th lord) associate via ${condition}. Supports wealth accumulation, financial gains, and resource acquisition.`,
        details: {
          planets: [lord1.planet, lord2.planet],
          houses: [lord1.house, lord2.house],
          signs: [lord1.sign, lord2.sign],
          condition,
          classicalReference: `Classical: ${pair.h1}th and ${pair.h2}th lord association forms Dhana Yoga`,
        },
      });
    }
  }
  
  // 11th lord in Kendra/Trikona (strong Dhana Yoga)
  const eleventhLord = placement(lordOf(11));
  if (eleventhLord && (isKendraHouse(eleventhLord.house) || isTrikonaHouse(eleventhLord.house))) {
    const sign11 = SIGNS[(lagnaSignId + 10) % 12] ?? "";
    yogas.push({
      code: "DHANA_YOGA",
      name: "Dhana Yoga (11th lord in Kendra/Trikona)",
      category: "WEALTH",
      strength: 78,
      description: `11th lord (${eleventhLord.planet}) placed in ${isKendraHouse(eleventhLord.house) ? "Kendra" : "Trikona"} house ${eleventhLord.house} (${eleventhLord.sign}). Strong indicator of gains, income, and fulfillment of desires.`,
      details: {
        planets: [eleventhLord.planet],
        houses: [11, eleventhLord.house],
        signs: [sign11, eleventhLord.sign],
        condition: `11th lord in ${isKendraHouse(eleventhLord.house) ? "Kendra" : "Trikona"}`,
        classicalReference: "Classical: 11th lord in Kendra/Trikona gives abundant gains",
      },
    });
  }

  // ============================================
  // 10. GENERAL BENEFIC PLACEMENTS (Supportive, not Raja Yogas)
  // ============================================
  if (jupiter && [1, 4, 5, 7, 9, 10].includes(jupiter.house)) {
    yogas.push({
      code: "GURU_BHAVA",
      name: "Benefic Jupiter placement",
      category: "GENERAL",
      strength: 70,
      description: `Jupiter in house ${jupiter.house} (${jupiter.sign}) supports growth, counsel, and dharmic expansion.`,
      details: {
        planets: ["Jupiter"],
        houses: [jupiter.house],
        signs: [jupiter.sign],
        condition: `Jupiter in house ${jupiter.house}`,
        classicalReference: "Benefic Jupiter in good houses supports overall well-being",
      },
    });
  }
  
  if (venus && [1, 2, 4, 5, 7, 11].includes(venus.house)) {
    yogas.push({
      code: "VENUS_HARMONY",
      name: "Venus relationship support",
      category: "MARRIAGE",
      strength: 65,
      description: `Venus in house ${venus.house} (${venus.sign}) favors affection, aesthetics, and relational harmony.`,
      details: {
        planets: ["Venus"],
        houses: [venus.house],
        signs: [venus.sign],
        condition: `Venus in house ${venus.house}`,
        classicalReference: "Venus in benefic houses supports relationships and comforts",
      },
    });
  }
  
  if (moon && moon.dignity === "Own") {
    yogas.push({
      code: "MOON_OWN",
      name: "Moon in own sign",
      category: "HEALTH",
      strength: 60,
      description: "Moon in Cancer supports emotional steadiness and nurturing capacity.",
      details: {
        planets: ["Moon"],
        houses: [moon.house],
        signs: [moon.sign],
        condition: "Moon in Cancer (own sign)",
        classicalReference: "Moon in own sign gives mental peace and emotional balance",
      },
    });
  }

  if (mars && [1, 10].includes(mars.house) && mars.dignity !== "Debilitated") {
    yogas.push({
      code: "RUCHAKA_HINT",
      name: "Ruchaka-like Mars strength",
      category: "CAREER",
      strength: 62,
      description: `Mars in house ${mars.house} (${mars.sign}) shows assertive drive and competitive stamina.`,
      details: {
        planets: ["Mars"],
        houses: [mars.house],
        signs: [mars.sign],
        condition: `Mars in house ${mars.house}`,
        classicalReference: "Mars in Kendra (1, 10) gives courage and leadership",
      },
    });
  }

  if (lagnaSign) {
    yogas.push({
      code: "LAGNA_SET",
      name: "Ascendant established",
      category: "GENERAL",
      strength: 50,
      description: `Lagna set as ${lagnaSign} — personality and path are read from this rising sign.`,
      details: {
        planets: [],
        houses: [1],
        signs: [lagnaSign],
        condition: `Lagna in ${lagnaSign}`,
        classicalReference: "Ascendant is the foundation of the chart",
      },
    });
  }

  // ============================================
  // 11. LUNAR YOGAS (from Moon)
  // ============================================

  if (moon) {
    // ADHI YOGA: Benefics in 6th, 7th, 8th from Moon
    const beneficsFromMoon = ["Jupiter", "Venus", "Mercury"].filter((name) => {
      const p = byName(name);
      if (!p) return false;
      const fromMoon = getHouseFromMoon(p.house, moon.house);
      return [6, 7, 8].includes(fromMoon);
    });
    if (beneficsFromMoon.length >= 2) {
      const houses = beneficsFromMoon.map((name) => {
        const p = byName(name)!;
        return getHouseFromMoon(p.house, moon.house);
      });
      yogas.push({
        code: "ADHI",
        name: "Adhi Yoga",
        category: "WEALTH",
        strength: 75 + beneficsFromMoon.length * 5,
        description: `Benefics (${beneficsFromMoon.join(", ")}) in houses ${houses.join(", ")} from Moon. Gives leadership, prosperity, comfort, and high status.`,
        details: {
          planets: beneficsFromMoon,
          houses: houses.map((h) => moon.house + h - 1 > 12 ? moon.house + h - 13 : moon.house + h - 1),
          signs: beneficsFromMoon.map((name) => byName(name)!.sign),
          condition: `${beneficsFromMoon.length} benefics in 6th, 7th, 8th from Moon`,
          classicalReference: "BPHS 14.10-12: Benefics in 6, 7, 8 from Moon form Adhi Yoga",
        },
      });
    }

    // SUNAPHA YOGA: Planet (not Sun/Rahu/Ketu) in 2nd from Moon
    const sunaphaPlanets = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].filter((name) => {
      const p = byName(name);
      if (!p) return false;
      return getHouseFromMoon(p.house, moon.house) === 2;
    });
    if (sunaphaPlanets.length > 0) {
      for (const name of sunaphaPlanets) {
        const p = byName(name)!;
        yogas.push({
          code: "SUNAPHA",
          name: `Sunapha Yoga (${name})`,
          category: "WEALTH",
          strength: 65,
          description: `${name} in 2nd house from Moon. Gives self-earned wealth, good speech, and happiness.`,
          details: {
            planets: [name],
            houses: [p.house],
            signs: [p.sign],
            condition: `${name} in 2nd from Moon`,
            classicalReference: "BPHS 14.3-4: Planet in 2nd from Moon forms Sunapha Yoga",
          },
        });
      }
    }

    // ANAPHA YOGA: Planet (not Sun/Rahu/Ketu) in 12th from Moon
    const anaphaPlanets = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].filter((name) => {
      const p = byName(name);
      if (!p) return false;
      return getHouseFromMoon(p.house, moon.house) === 12;
    });
    if (anaphaPlanets.length > 0) {
      for (const name of anaphaPlanets) {
        const p = byName(name)!;
        yogas.push({
          code: "ANAPHA",
          name: `Anapha Yoga (${name})`,
          category: "WEALTH",
          strength: 65,
          description: `${name} in 12th house from Moon. Gives wealth, good reputation, and material comforts.`,
          details: {
            planets: [name],
            houses: [p.house],
            signs: [p.sign],
            condition: `${name} in 12th from Moon`,
            classicalReference: "BPHS 14.5-6: Planet in 12th from Moon forms Anapha Yoga",
          },
        });
      }
    }

    // DURUDHARA YOGA: Planets in both 2nd and 12th from Moon
    if (sunaphaPlanets.length > 0 && anaphaPlanets.length > 0) {
      yogas.push({
        code: "DURUDHARA",
        name: "Durudhara Yoga",
        category: "WEALTH",
        strength: 85,
        description: `Planets in both 2nd (${sunaphaPlanets.join(", ")}) and 12th (${anaphaPlanets.join(", ")}) from Moon. Combines Sunapha and Anapha — great wealth and enjoyment.`,
        details: {
          planets: [...sunaphaPlanets, ...anaphaPlanets],
          houses: [...sunaphaPlanets, ...anaphaPlanets].map((name) => byName(name)!.house),
          signs: [...sunaphaPlanets, ...anaphaPlanets].map((name) => byName(name)!.sign),
          condition: `Planets in both 2nd and 12th from Moon`,
          classicalReference: "BPHS 14.7-8: Planets in both 2nd and 12th from Moon form Durudhara Yoga",
        },
      });
    }

    // KEMA DRUMA YOGA: No planet in 2nd/12th from Moon, no planet conjunct Moon
    const planetsAroundMoon = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].filter((name) => {
      const p = byName(name);
      if (!p) return false;
      const fromMoon = getHouseFromMoon(p.house, moon.house);
      return fromMoon === 1 || fromMoon === 2 || fromMoon === 12;
    });
    if (planetsAroundMoon.length === 0) {
      // Check cancellation conditions
      let cancelled = false;
      let cancellationReason = "";
      
      // Moon in Kendra from Lagna
      if (isKendraHouse(moon.house)) {
        cancelled = true;
        cancellationReason = "Moon in Kendra from Lagna";
      }
      // Moon in own/exalted sign
      else if (isInOwnSign(moon) || isExalted(moon)) {
        cancelled = true;
        cancellationReason = `Moon in ${isExalted(moon) ? "exalted" : "own"} sign`;
      }
      // Benefic aspect on Moon
      else if (jupiter && doesPlanetAspectHouse("Jupiter", jupiter.house, moon.house)) {
        cancelled = true;
        cancellationReason = "Jupiter aspects Moon";
      }
      else if (venus && doesPlanetAspectHouse("Venus", venus.house, moon.house)) {
        cancelled = true;
        cancellationReason = "Venus aspects Moon";
      }
      // Jupiter/Venus in Kendra from Moon
      else if (jupiter && isKendraHouse(getHouseFromMoon(jupiter.house, moon.house))) {
        cancelled = true;
        cancellationReason = "Jupiter in Kendra from Moon";
      }
      else if (venus && isKendraHouse(getHouseFromMoon(venus.house, moon.house))) {
        cancelled = true;
        cancellationReason = "Venus in Kendra from Moon";
      }

      yogas.push({
        code: "KEMADRUMA",
        name: cancelled ? "Kemadruma Yoga (Cancelled)" : "Kemadruma Yoga",
        category: "HEALTH",
        strength: cancelled ? 30 : 70,
        description: `No planet in 2nd, 12th, or conjunct Moon. ${cancelled ? `Cancelled: ${cancellationReason}.` : "Gives struggles, loneliness, financial difficulty."} Check for other cancellation factors.`,
        details: {
          planets: ["Moon"],
          houses: [moon.house],
          signs: [moon.sign],
          condition: cancelled ? `Kemadruma cancelled: ${cancellationReason}` : "No planets around Moon",
          classicalReference: "BPHS 14.9: No planets around Moon forms Kemadruma Yoga",
        },
      });
    }
  }

  // ============================================
  // 12. SOLAR YOGAS (from Sun)
  // ============================================

  if (sun) {
    // VASI YOGA: Planet (not Moon/Rahu/Ketu) in 12th from Sun
    const vasiPlanets = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].filter((name) => {
      const p = byName(name);
      if (!p) return false;
      const fromSun = ((p.house - sun.house + 12) % 12) + 1;
      return fromSun === 12;
    });
    if (vasiPlanets.length > 0) {
      for (const name of vasiPlanets) {
        const p = byName(name)!;
        yogas.push({
          code: "VASI",
          name: `Vasi Yoga (${name})`,
          category: "CAREER",
          strength: 65,
          description: `${name} in 12th house from Sun. Gives intelligence, wealth, and royal favor.`,
          details: {
            planets: [name],
            houses: [p.house],
            signs: [p.sign],
            condition: `${name} in 12th from Sun`,
            classicalReference: "BPHS 14.13-14: Planet in 12th from Sun forms Vasi Yoga",
          },
        });
      }
    }

    // VESI YOGA: Planet (not Moon/Rahu/Ketu) in 2nd from Sun
    const vesiPlanets = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].filter((name) => {
      const p = byName(name);
      if (!p) return false;
      const fromSun = ((p.house - sun.house + 12) % 12) + 1;
      return fromSun === 2;
    });
    if (vesiPlanets.length > 0) {
      for (const name of vesiPlanets) {
        const p = byName(name)!;
        yogas.push({
          code: "VESI",
          name: `Vesi Yoga (${name})`,
          category: "CAREER",
          strength: 65,
          description: `${name} in 2nd house from Sun. Gives wealth, courage, and charitable nature.`,
          details: {
            planets: [name],
            houses: [p.house],
            signs: [p.sign],
            condition: `${name} in 2nd from Sun`,
            classicalReference: "BPHS 14.15-16: Planet in 2nd from Sun forms Vesi Yoga",
          },
        });
      }
    }

    // UBHAYACHARI YOGA: Planets in both 2nd and 12th from Sun
    if (vasiPlanets.length > 0 && vesiPlanets.length > 0) {
      yogas.push({
        code: "UBHAYACHARI",
        name: "Ubhayachari Yoga",
        category: "CAREER",
        strength: 85,
        description: `Planets in both 12th (${vasiPlanets.join(", ")}) and 2nd (${vesiPlanets.join(", ")}) from Sun. Combines Vasi and Vesi — great intelligence and wealth.`,
        details: {
          planets: [...vasiPlanets, ...vesiPlanets],
          houses: [...vasiPlanets, ...vesiPlanets].map((name) => byName(name)!.house),
          signs: [...vasiPlanets, ...vesiPlanets].map((name) => byName(name)!.sign),
          condition: `Planets in both 2nd and 12th from Sun`,
          classicalReference: "BPHS 14.17-18: Planets in both 2nd and 12th from Sun form Ubhayachari Yoga",
        },
      });
    }
  }

  // ============================================
  // 13. SARASWATI YOGA
  // ============================================
  if (jupiter && mercury && venus) {
    const jupiterStrong = isInOwnSign(jupiter) || isExalted(jupiter) || isInFriendlySign(jupiter);
    const jupiterInGoodHouse = isKendraHouse(jupiter.house) || isTrikonaHouse(jupiter.house);
    const mercuryInGoodHouse = isKendraHouse(mercury.house) || isTrikonaHouse(mercury.house);
    const venusInGoodHouse = isKendraHouse(venus.house) || isTrikonaHouse(venus.house);
    const fromMoon = moon ? (isKendraHouse(getHouseFromMoon(jupiter.house, moon.house)) || isTrikonaHouse(getHouseFromMoon(jupiter.house, moon.house))) : false;
    const mercuryFromMoon = moon ? (isKendraHouse(getHouseFromMoon(mercury.house, moon.house)) || isTrikonaHouse(getHouseFromMoon(mercury.house, moon.house))) : false;
    const venusFromMoon = moon ? (isKendraHouse(getHouseFromMoon(venus.house, moon.house)) || isTrikonaHouse(getHouseFromMoon(venus.house, moon.house))) : false;

    // From Lagna or Moon
    const fromLagna = jupiterStrong && jupiterInGoodHouse && mercuryInGoodHouse && venusInGoodHouse;
    const fromMoonCondition = moon && jupiterStrong && fromMoon && mercuryFromMoon && venusFromMoon;

    if (fromLagna || fromMoonCondition) {
      yogas.push({
        code: "SARASWATI",
        name: "Saraswati Yoga",
        category: "CAREER",
        strength: fromLagna && fromMoonCondition ? 90 : 80,
        description: `Jupiter (${jupiter.sign}), Venus (${venus.sign}), Mercury (${mercury.sign}) in Kendra/Trikona ${fromLagna ? "from Lagna" : ""}${fromLagna && fromMoonCondition ? " and " : ""}${fromMoonCondition ? "from Moon" : ""}. Jupiter strong. Bestows learning, eloquence, artistic talent, wisdom.`,
        details: {
          planets: ["Jupiter", "Venus", "Mercury"],
          houses: [jupiter.house, venus.house, mercury.house],
          signs: [jupiter.sign, venus.sign, mercury.sign],
          condition: `Jupiter, Venus, Mercury in Kendra/Trikona ${fromLagna ? "from Lagna" : ""}${fromLagna && fromMoonCondition ? " and " : ""}${fromMoonCondition ? "from Moon" : ""}`,
          classicalReference: "BPHS 41.50-52: Jupiter, Venus, Mercury in Kendra/Trikona with Jupiter strong forms Saraswati Yoga",
        },
      });
    }
  }

  // ============================================
  // 14. LAKSHMI YOGA
  // ============================================
  // ninthLord already declared above (Dharma-Karmadhipati section)
  if (ninthLord && venus) {
    const ninthLordStrong = isInOwnSign(ninthLord) || isExalted(ninthLord);
    const ninthLordInGoodHouse = isKendraHouse(ninthLord.house) || isTrikonaHouse(ninthLord.house);
    const venusStrong = isInOwnSign(venus) || isExalted(venus);
    const venusInGoodHouse = isKendraHouse(venus.house) || isTrikonaHouse(venus.house);

    if (ninthLordStrong && ninthLordInGoodHouse && venusStrong && venusInGoodHouse) {
      yogas.push({
        code: "LAKSHMI",
        name: "Lakshmi Yoga",
        category: "WEALTH",
        strength: 88,
        description: `9th lord (${ninthLord.planet}) in ${ninthLord.sign} (${isExalted(ninthLord) ? "exalted" : "own sign"}) in Kendra/Trikona, and Venus (${venus.sign}) in ${venus.sign} (${isExalted(venus) ? "exalted" : "own sign"}) in Kendra/Trikona. Gives abundant wealth and prosperity.`,
        details: {
          planets: [ninthLord.planet, "Venus"],
          houses: [9, ninthLord.house, venus.house],
          signs: [SIGNS[(lagnaSignId + 8) % 12] ?? "", ninthLord.sign, venus.sign],
          condition: "9th lord and Venus in own/exalted in Kendra/Trikona",
          classicalReference: "BPHS 41.46-48: 9th lord and Venus in Kendra/Trikona in own/exalted signs form Lakshmi Yoga",
        },
      });
    }
  }

  // ============================================
  // 15. PARIVARTANA YOGA (Exchange)
  // ============================================
  // Already detected via isExchange in other yogas, but list explicitly
  const classicalPlanetsForExchange: readonly string[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  for (let i = 0; i < classicalPlanetsForExchange.length; i++) {
    for (let j = i + 1; j < classicalPlanetsForExchange.length; j++) {
      const p1Name = classicalPlanetsForExchange[i]!;
      const p2Name = classicalPlanetsForExchange[j]!;
      const p1 = byName(p1Name);
      const p2 = byName(p2Name);
      if (!p1 || !p2) continue;
      if (isExchange(p1, p2, lagnaSignId, houseLords)) {
        const sign1 = p1.sign;
        const sign2 = p2.sign;
        yogas.push({
          code: "PARIVARTANA",
          name: `Parivartana Yoga (${p1Name}-${p2Name})`,
          category: "CAREER",
          strength: 90,
          description: `${p1Name} in ${sign1} (lord of ${sign2}), ${p2Name} in ${sign2} (lord of ${sign1}). Exchange creates strong linkage between houses ${p1.house} and ${p2.house}.`,
          details: {
            planets: [p1Name, p2Name],
            houses: [p1.house, p2.house],
            signs: [sign1, sign2],
            condition: `Exchange between ${p1Name} and ${p2Name}`,
            classicalReference: "BPHS 31.10-12: Exchange of signs forms Parivartana Yoga",
          },
        });
      }
    }
  }

  // ============================================
  // 16. AMALA YOGA
  // ============================================
  // Benefic in 10th from Lagna
  const beneficsIn10thFromLagna = ["Jupiter", "Venus", "Mercury"].filter((name) => {
    const p = byName(name);
    return p && p.house === 10;
  });
  if (beneficsIn10thFromLagna.length > 0) {
    for (const name of beneficsIn10thFromLagna) {
      const p = byName(name)!;
      yogas.push({
        code: "AMALA",
        name: `Amala Yoga (${name} in 10th from Lagna)`,
        category: "CAREER",
        strength: 75,
        description: `${name} in 10th house from Lagna. Gives pure reputation, lasting fame, and virtuous career.`,
        details: {
          planets: [name],
          houses: [10],
          signs: [p.sign],
          condition: `${name} in 10th from Lagna`,
          classicalReference: "BPHS 41.49: Benefic in 10th from Lagna forms Amala Yoga",
        },
      });
    }
  }
  // Benefic in 10th from Moon
  if (moon) {
    const beneficsIn10thFromMoon = ["Jupiter", "Venus", "Mercury"].filter((name) => {
      const p = byName(name);
      return p && getHouseFromMoon(p.house, moon.house) === 10;
    });
    if (beneficsIn10thFromMoon.length > 0) {
      for (const name of beneficsIn10thFromMoon) {
        const p = byName(name)!;
        yogas.push({
          code: "AMALA",
          name: `Amala Yoga (${name} in 10th from Moon)`,
          category: "CAREER",
          strength: 75,
          description: `${name} in 10th house from Moon. Gives pure reputation, lasting fame, and virtuous career.`,
          details: {
            planets: [name],
            houses: [p.house],
            signs: [p.sign],
            condition: `${name} in 10th from Moon`,
            classicalReference: "BPHS 41.49: Benefic in 10th from Moon forms Amala Yoga",
          },
        });
      }
    }
  }

  // ============================================
  // 17. PUSHKALA YOGA
  // ============================================
  const lagnaLord = placement(lordOf(1));
  if (lagnaLord && moon) {
    const lagnaLordStrong = isInOwnSign(lagnaLord) || isExalted(lagnaLord) || isInFriendlySign(lagnaLord);
    const moonInKendraTrikona = isKendraHouse(getHouseFromMoon(moon.house, lagnaLord.house)) || isTrikonaHouse(getHouseFromMoon(moon.house, lagnaLord.house));
    const beneficInKendra = ["Jupiter", "Venus", "Mercury"].some((name) => {
      const p = byName(name);
      return p && isKendraHouse(p.house);
    });

    if (lagnaLordStrong && moonInKendraTrikona && beneficInKendra) {
      yogas.push({
        code: "PUSHKALA",
        name: "Pushkala Yoga",
        category: "CAREER",
        strength: 88,
        description: `Lagna lord (${lagnaLord.planet}) strong, Moon in Kendra/Trikona from Lagna lord, benefic in Kendra. Gives high status, prosperity, king-like position.`,
        details: {
          planets: [lagnaLord.planet, "Moon", "Benefic"],
          houses: [1, lagnaLord.house, moon.house],
          signs: [lagnaLord.sign, moon.sign],
          condition: "Lagna lord strong, Moon in Kendra/Trikona from Lagna, benefic in Kendra",
          classicalReference: "Jataka Parijata 12.5-7: Pushkala Yoga conditions",
        },
      });
    }
  }

  // ============================================
  // 18. SHUBHA KARTARI YOGA (Benefic Hemming)
  // ============================================
  const benefics = ["Jupiter", "Venus", "Mercury"];
  for (let house = 1; house <= 12; house++) {
    const prevHouse = house === 1 ? 12 : house - 1;
    const nextHouse = house === 12 ? 1 : house + 1;
    
    const prevBenefic = benefics.find((name) => {
      const p = byName(name);
      return p && p.house === prevHouse;
    });
    const nextBenefic = benefics.find((name) => {
      const p = byName(name);
      return p && p.house === nextHouse;
    });

    if (prevBenefic && nextBenefic) {
      // Check what's in the hemmed house
      const hemmedPlanets = planets.filter((p) => p.house === house && CLASSICAL.has(p.planet));
      if (hemmedPlanets.length > 0) {
        for (const hp of hemmedPlanets) {
          yogas.push({
            code: "SHUBHA_KARTARI",
            name: `Shubha Kartari Yoga (${hp.planet} in H${house})`,
            category: "GENERAL",
            strength: 70,
            description: `${hp.planet} in house ${house} hemmed between ${prevBenefic} (H${prevHouse}) and ${nextBenefic} (H${nextHouse}). Protection and enhancement of ${hp.planet}'s significations.`,
            details: {
              planets: [hp.planet, prevBenefic, nextBenefic],
              houses: [house, prevHouse, nextHouse],
              signs: [hp.sign, byName(prevBenefic)!.sign, byName(nextBenefic)!.sign],
              condition: `Benefics on both sides of ${hp.planet} in H${house}`,
              classicalReference: "BPHS 31.15-16: Benefic hemming forms Shubha Kartari Yoga",
            },
          });
        }
      } else {
        // Hemmed house itself
        yogas.push({
          code: "SHUBHA_KARTARI",
          name: `Shubha Kartari Yoga (House ${house})`,
          category: "GENERAL",
          strength: 65,
          description: `House ${house} hemmed between ${prevBenefic} (H${prevHouse}) and ${nextBenefic} (H${nextHouse}). Protection and enhancement of house ${house} significations.`,
          details: {
            planets: [prevBenefic, nextBenefic],
            houses: [house, prevHouse, nextHouse],
            signs: [SIGNS[(lagnaSignId + house - 1) % 12] ?? "", byName(prevBenefic)!.sign, byName(nextBenefic)!.sign],
            condition: `Benefics on both sides of house ${house}`,
            classicalReference: "BPHS 31.15-16: Benefic hemming forms Shubha Kartari Yoga",
          },
        });
      }
    }
  }

  // ============================================
  // 19. PAPA KARTARI YOGA (Malefic Hemming)
  // ============================================
  const malefics = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];
  for (let house = 1; house <= 12; house++) {
    const prevHouse = house === 1 ? 12 : house - 1;
    const nextHouse = house === 12 ? 1 : house + 1;
    
    const prevMalefic = malefics.find((name) => {
      const p = byName(name);
      return p && p.house === prevHouse;
    });
    const nextMalefic = malefics.find((name) => {
      const p = byName(name);
      return p && p.house === nextHouse;
    });

    if (prevMalefic && nextMalefic) {
      const hemmedPlanets = planets.filter((p) => p.house === house && CLASSICAL.has(p.planet));
      if (hemmedPlanets.length > 0) {
        for (const hp of hemmedPlanets) {
          yogas.push({
            code: "PAPA_KARTARI",
            name: `Papa Kartari Yoga (${hp.planet} in H${house})`,
            category: "HEALTH",
            strength: 70,
            description: `${hp.planet} in house ${house} hemmed between ${prevMalefic} (H${prevHouse}) and ${nextMalefic} (H${nextHouse}). Stress and challenges for ${hp.planet}'s significations.`,
            details: {
              planets: [hp.planet, prevMalefic, nextMalefic],
              houses: [house, prevHouse, nextHouse],
              signs: [hp.sign, byName(prevMalefic)!.sign, byName(nextMalefic)!.sign],
              condition: `Malefics on both sides of ${hp.planet} in H${house}`,
              classicalReference: "BPHS 31.17-18: Malefic hemming forms Papa Kartari Yoga",
            },
          });
        }
      } else {
        yogas.push({
          code: "PAPA_KARTARI",
          name: `Papa Kartari Yoga (House ${house})`,
          category: "HEALTH",
          strength: 65,
          description: `House ${house} hemmed between ${prevMalefic} (H${prevHouse}) and ${nextMalefic} (H${nextHouse}). Stress and challenges for house ${house} significations.`,
          details: {
            planets: [prevMalefic, nextMalefic],
            houses: [house, prevHouse, nextHouse],
            signs: [SIGNS[(lagnaSignId + house - 1) % 12] ?? "", byName(prevMalefic)!.sign, byName(nextMalefic)!.sign],
            condition: `Malefics on both sides of house ${house}`,
            classicalReference: "BPHS 31.17-18: Malefic hemming forms Papa Kartari Yoga",
          },
        });
      }
    }
  }

  // ============================================
  // 20. NABHASA YOGAS (Sky/Structural Yogas)
  // ============================================
  
  // Ashraya Yogas - based on sign modalities
  const movableSigns = new Set([0, 3, 6, 9]); // Aries, Cancer, Libra, Capricorn
  const fixedSigns = new Set([1, 4, 7, 10]); // Taurus, Leo, Scorpio, Aquarius
  const dualSigns = new Set([2, 5, 8, 11]); // Gemini, Virgo, Sagittarius, Pisces
  
  const classicalPlanetSigns = planets
    .filter((p) => CLASSICAL.has(p.planet))
    .map((p) => p.signId);
  
  const inMovable = classicalPlanetSigns.filter((s) => movableSigns.has(s)).length;
  const inFixed = classicalPlanetSigns.filter((s) => fixedSigns.has(s)).length;
  const inDual = classicalPlanetSigns.filter((s) => dualSigns.has(s)).length;
  
  if (inMovable === classicalPlanetSigns.length && classicalPlanetSigns.length >= 5) {
    yogas.push({
      code: "NABHASA_ASHRAYA",
      name: "Rajju Yoga (Ashraya)",
      category: "GENERAL",
      strength: 60,
      description: `All classical planets in movable signs (Aries, Cancer, Libra, Capricorn). Native is active, restless, travels, initiates change.`,
      details: {
        planets: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.planet),
        houses: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.house),
        signs: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.sign),
        condition: "All planets in movable signs",
        classicalReference: "BPHS 15.1-5: All planets in movable signs form Rajju Yoga",
      },
    });
  } else if (inFixed === classicalPlanetSigns.length && classicalPlanetSigns.length >= 5) {
    yogas.push({
      code: "NABHASA_ASHRAYA",
      name: "Musala Yoga (Ashraya)",
      category: "GENERAL",
      strength: 60,
      description: `All classical planets in fixed signs (Taurus, Leo, Scorpio, Aquarius). Native is stable, determined, resistant to change, accumulates.`,
      details: {
        planets: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.planet),
        houses: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.house),
        signs: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.sign),
        condition: "All planets in fixed signs",
        classicalReference: "BPHS 15.6-10: All planets in fixed signs form Musala Yoga",
      },
    });
  } else if (inDual === classicalPlanetSigns.length && classicalPlanetSigns.length >= 5) {
    yogas.push({
      code: "NABHASA_ASHRAYA",
      name: "Nala Yoga (Ashraya)",
      category: "GENERAL",
      strength: 60,
      description: `All classical planets in dual signs (Gemini, Virgo, Sagittarius, Pisces). Native is adaptable, intellectual, versatile, communicative.`,
      details: {
        planets: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.planet),
        houses: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.house),
        signs: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.sign),
        condition: "All planets in dual signs",
        classicalReference: "BPHS 15.11-15: All planets in dual signs form Nala Yoga",
      },
    });
  }

  // Dala Yogas - distribution between two halves
  const _firstHalf = classicalPlanetSigns.filter((s) => s <= 5).length; // Aries to Virgo
  const _secondHalf = classicalPlanetSigns.filter((s) => s >= 6).length; // Libra to Pisces
  
  // Maala: Benefics in Kendra, malefics in Kendra (simplified: benefics in 1,4,7,10)
  const beneficsInKendra = ["Jupiter", "Venus", "Mercury"].filter((name) => {
    const p = byName(name);
    return p && isKendraHouse(p.house);
  });
  const maleficsInKendra = ["Mars", "Saturn", "Sun"].filter((name) => {
    const p = byName(name);
    return p && isKendraHouse(p.house);
  });
  
  if (beneficsInKendra.length >= 2 && maleficsInKendra.length === 0) {
    yogas.push({
      code: "NABHASA_DALA",
      name: "Maala Yoga (Dala)",
      category: "WEALTH",
      strength: 75,
      description: `Benefics (${beneficsInKendra.join(", ")}) in Kendra houses, no malefics in Kendra. Garland of benefics — prosperity, happiness, success.`,
      details: {
        planets: [...beneficsInKendra, "Moon"].filter(Boolean),
        houses: beneficsInKendra.map((name) => byName(name)!.house),
        signs: beneficsInKendra.map((name) => byName(name)!.sign),
        condition: "Benefics in Kendra, no malefics in Kendra",
        classicalReference: "BPHS 15.21-25: Benefics in Kendra form Maala Yoga",
      },
    });
  } else if (maleficsInKendra.length >= 2 && beneficsInKendra.length === 0) {
    yogas.push({
      code: "NABHASA_DALA",
      name: "Sarpa Yoga (Dala)",
      category: "HEALTH",
      strength: 70,
      description: `Malefics (${maleficsInKendra.join(", ")}) in Kendra houses, no benefics in Kendra. Serpent yoga — struggles, obstacles, but can give spiritual depth.`,
      details: {
        planets: [...maleficsInKendra, "Moon"].filter(Boolean),
        houses: maleficsInKendra.map((name) => byName(name)!.house),
        signs: maleficsInKendra.map((name) => byName(name)!.sign),
        condition: "Malefics in Kendra, no benefics in Kendra",
        classicalReference: "BPHS 15.26-30: Malefics in Kendra form Sarpa Yoga",
      },
    });
  }

  // Akriti Yogas - geometric patterns
  const _kendrasOccupied = [1, 4, 7, 10].filter((h) => planets.some((p) => CLASSICAL.has(p.planet) && p.house === h)).length;
  const _kendrasWithBenefics = [1, 4, 7, 10].filter((h) => ["Jupiter", "Venus", "Mercury", "Moon"].some((name) => {
    const p = byName(name);
    return p && p.house === h;
  })).length;
  const _kendrasWithMalefics = [1, 4, 7, 10].filter((h) => ["Mars", "Saturn", "Sun"].some((name) => {
    const p = byName(name);
    return p && p.house === h;
  })).length;
  
  // Gada: Planets in two adjacent Kendras
  const adjacentKendras = [[1,4], [4,7], [7,10], [10,1]] as const;
  for (const [k1, k2] of adjacentKendras) {
    const p1 = planets.find((p) => CLASSICAL.has(p.planet) && p.house === k1);
    const p2 = planets.find((p) => CLASSICAL.has(p.planet) && p.house === k2);
    if (p1 && p2) {
      const planet1: ChartPlanet = p1;
      const planet2: ChartPlanet = p2;
      yogas.push({
        code: "NABHASA_AKRITI",
        name: `Gada Yoga (Kendras ${k1}-${k2})`,
        category: "CAREER",
        strength: 65,
        description: `Planets in adjacent Kendras ${k1} and ${k2}. Mace yoga — authority, leadership, structural power.`,
        details: {
          planets: [p1.planet, p2.planet],
          houses: [k1, k2],
          signs: [p1.sign, p2.sign],
          condition: `Planets in adjacent Kendras ${k1} and ${k2}`,
          classicalReference: "BPHS 15.36-40: Planets in adjacent Kendras form Gada Yoga",
        },
      });
      break; // Only report one Gada
    }
  }
  
  // Shakata: Planets only in 1st and 7th
  const planetsIn1and7 = planets.filter((p) => CLASSICAL.has(p.planet) && (p.house === 1 || p.house === 7));
  const planetsOnlyIn1and7 = planetsIn1and7.length === classicalPlanetSigns.length && classicalPlanetSigns.length >= 3;
  if (planetsOnlyIn1and7) {
    yogas.push({
      code: "NABHASA_AKRITI",
      name: "Shakata Yoga (Akriti)",
      category: "HEALTH",
      strength: 60,
      description: `All planets only in 1st and 7th houses. Cart yoga — ups and downs, travel, instability but eventual progress.`,
      details: {
        planets: planetsIn1and7.map((p) => p.planet),
        houses: [1, 7],
        signs: planetsIn1and7.map((p) => p.sign),
        condition: "All planets in 1st and 7th houses only",
        classicalReference: "BPHS 15.41-45: Planets in 1st and 7th only form Shakata Yoga",
      },
    });
  }

  // Sankhya Yogas - number of houses occupied
  const occupiedHouses = new Set(planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.house)).size;
  const sankhyaNames: Record<number, { name: string; desc: string; ref: string }> = {
    7: { name: "Veena Yoga", desc: "Planets in 7 houses. Lute yoga — artistic, musical, harmonious life.", ref: "BPHS 15.51-55" },
    6: { name: "Damini Yoga", desc: "Planets in 6 houses. Lightning yoga — brilliant, sudden success, electrifying.", ref: "BPHS 15.56-60" },
    5: { name: "Pasha Yoga", desc: "Planets in 5 houses. Noose yoga — entanglements, but also focus and mastery.", ref: "BPHS 15.61-65" },
    4: { name: "Kedara Yoga", desc: "Planets in 4 houses. Field yoga — agricultural, grounded, productive.", ref: "BPHS 15.66-70" },
    3: { name: "Shula Yoga", desc: "Planets in 3 houses. Spear yoga — piercing focus, specialization, intensity.", ref: "BPHS 15.71-75" },
    2: { name: "Yuga Yoga", desc: "Planets in 2 houses. Pair yoga — duality, partnerships, complementary skills.", ref: "BPHS 15.76-80" },
    1: { name: "Gola Yoga", desc: "All planets in 1 house. Ball yoga — extreme concentration, obsession, single-minded.", ref: "BPHS 15.81-85" },
  };
  
  const sk = sankhyaNames[occupiedHouses as keyof typeof sankhyaNames];
  if (sk) {
    yogas.push({
      code: "NABHASA_SANKHYA",
      name: sk.name,
      category: "GENERAL",
      strength: 55 + (7 - occupiedHouses) * 3,
      description: `${sk.desc} (${occupiedHouses} houses occupied by classical planets).`,
      details: {
        planets: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.planet),
        houses: Array.from(new Set(planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.house))),
        signs: planets.filter((p) => CLASSICAL.has(p.planet)).map((p) => p.sign),
        condition: `Classical planets occupy ${occupiedHouses} houses`,
        classicalReference: `${sk.ref}: ${occupiedHouses} houses occupied`,
      },
    });
  }

  // ============================================
  // 21. NAKSHATRA YOGAS
  // ============================================
  const nakshatraYogas = detectNakshatraYogas(planets);
  for (const ny of nakshatraYogas) {
    if (ny.present) {
      yogas.push({
        code: ny.id,
        name: ny.name,
        category: "GENERAL",
        strength: ny.strength,
        description: `${ny.condition}. ${ny.interpretation}`,
        details: {
          planets: ny.planets,
          houses: ny.planets.map((pName) => byName(pName)?.house).filter((h): h is number => h !== undefined),
          signs: ny.planets.map((pName) => byName(pName)?.sign).filter((s): s is string => s !== undefined),
          condition: ny.condition,
          classicalReference: ny.classicalReference,
        },
      });
    }
  }

  // ============================================
  // 22. JAIMINI YOGAS
  // ============================================
  // Note: Jaimini yogas require birth time for Ghati/Hora Lagna
  // We'll detect what we can without birth time
  const jaiminiYogas = detectJaiminiYogas(planets, lagnaSignId, 0);
  for (const jy of jaiminiYogas) {
    if (jy.present) {
      yogas.push({
        code: jy.id,
        name: jy.name,
        category: "GENERAL",
        strength: jy.strength,
        description: `${jy.condition}. ${jy.interpretation}`,
        details: {
          planets: jy.planets,
          houses: jy.planets.map((pName) => byName(pName)?.house).filter((h): h is number => h !== undefined),
          signs: jy.planets.map((pName) => byName(pName)?.sign).filter((s): s is string => s !== undefined),
          condition: jy.condition,
          classicalReference: jy.classicalReference,
        },
      });
    }
  }

  // Deduplicate by code
  const seen = new Set<string>();
  return yogas.filter((y) => {
    if (seen.has(y.code)) return false;
    seen.add(y.code);
    return true;
  });
}

function getMahapurushaMeaning(planet: string): string {
  const meanings: Record<string, string> = {
    Mars: "courage, leadership, victory, and physical prowess",
    Mercury: "intelligence, communication, commerce, and analytical brilliance",
    Jupiter: "wisdom, spirituality, prosperity, and righteous living",
    Venus: "luxury, beauty, artistic talent, and harmonious relationships",
    Saturn: "discipline, longevity, authority through hard work, and spiritual detachment",
  };
  return meanings[planet] || "exceptional qualities";
}

export function buildNorthChart(planets: ChartPlanet[], lagnaSignId: number, lagnaDegree = 0) {
  const houses: Record<string, ChartPlanetGlyph[]> = {};
  for (let i = 1; i <= 12; i += 1) houses[String(i)] = [];
  for (const p of planets) {
    if (!CLASSICAL.has(p.planet)) continue;
    const houseNo = wholeSignHouse(p.signId, lagnaSignId);
    const bucket = houses[String(houseNo)] ?? (houses[String(houseNo)] = []);
    bucket.push({ ...toPlanetGlyph(p), house: houseNo });
  }
  for (const key of Object.keys(houses)) {
    houses[key]?.sort((a, b) => a.degreeValue - b.degreeValue);
  }
  const deg = Math.floor(lagnaDegree);
  const min = Math.floor((lagnaDegree - deg) * 60);
  return {
    style: "NORTH" as const,
    lagnaSignId,
    lagnaDegree,
    lagnaLabel: `Asc ${deg}°${String(min).padStart(2, "0")}'`,
    houses,
  };
}

export function buildSouthChart(planets: ChartPlanet[], lagnaSignId: number, lagnaDegree = 0) {
  const deg = Math.floor(lagnaDegree);
  const min = Math.floor((lagnaDegree - deg) * 60);
  return {
    style: "SOUTH" as const,
    lagnaSignId,
    lagnaDegree,
    lagnaLabel: `Asc ${deg}°${String(min).padStart(2, "0")}'`,
    signs: SIGNS.map((sign, idx) => ({
      sign,
      signId: idx,
      house: wholeSignHouse(idx, lagnaSignId),
      planets: planets
        .filter((p) => p.signId === idx && CLASSICAL.has(p.planet))
        .map((p) => ({ ...toPlanetGlyph(p), house: wholeSignHouse(idx, lagnaSignId) }))
        .sort((a, b) => a.degreeValue - b.degreeValue),
    })),
  };
}

/** East Indian diamond: fixed rashis; house number = count from Lagna sign. */
export function buildEastChart(planets: ChartPlanet[], lagnaSignId: number, lagnaDegree = 0) {
  const south = buildSouthChart(planets, lagnaSignId, lagnaDegree);
  return { ...south, style: "EAST" as const };
}

export { analyzeNakshatraPlanets, calculateTaraBala, detectNakshatraYogas, getNakshatraAnalysisSummary } from "./nakshatra-yogas";
export {
  calculateJaiminiKaraka,
  calculateArudhaLagna,
  calculateArudhaPadas,
  calculateGhatiLagna,
  calculateHoraLagna,
  detectJaiminiYogas,
  getJaiminiAnalysis,
} from "./jaimini-yogas";