import { ChartPlanet } from "./chart-builder";
import {
  NAKSHATRAS,
  VIMSHOTTARI_LORDS,
  SIGNS,
} from "./vedic-constants";

export type NakshatraPlanetInfo = {
  planet: string;
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  sign: string;
  house: number;
  signId: number;
  longitude: number;
  nakshatraDispositor: string;
  dispositorRelationship: "friend" | "enemy" | "neutral" | "own" | "exalted" | "debilitated";
  dignity: string | null;
};

export type TaraBalaResult = {
  planet: string;
  taraName: string;
  taraGroup: "janma" | "sampat" | "vipat" | "kshema" | "pratyak" | "sadhaka" | "naidhana" | "mitra" | "paramamitra";
  nakshatraFromMoon: number;
  auspicious: boolean;
  description: string;
};

export type NakshatraYogaResult = {
  id: string;
  name: string;
  sanskritName: string;
  category: "nakshatra";
  planets: string[];
  nakshatras: string[];
  nakshatraLords: string[];
  condition: string;
  classicalReference: string;
  interpretation: string;
  present: boolean;
  strength: number;
};

const FRIENDLY_SIGNS: Record<string, string[]> = {
  Sun: ["Aries", "Leo", "Sagittarius", "Scorpio"],
  Moon: ["Taurus", "Cancer", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Pisces"],
  Mars: ["Aries", "Scorpio", "Capricorn", "Leo", "Sagittarius", "Pisces"],
  Mercury: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
  Jupiter: ["Sagittarius", "Pisces", "Cancer", "Aries", "Leo", "Scorpio"],
  Venus: ["Taurus", "Libra", "Pisces", "Gemini", "Virgo", "Capricorn", "Aquarius"],
  Saturn: ["Capricorn", "Aquarius", "Libra", "Gemini", "Virgo", "Taurus"],
  Rahu: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
  Ketu: ["Sagittarius", "Pisces", "Cancer", "Aries", "Leo", "Scorpio"],
};

const ENEMY_SIGNS: Record<string, string[]> = {
  Sun: ["Libra", "Aquarius", "Gemini", "Taurus"],
  Moon: [],
  Mars: ["Gemini", "Virgo", "Libra", "Taurus"],
  Mercury: ["Cancer", "Leo", "Scorpio", "Pisces"],
  Jupiter: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
  Venus: ["Aries", "Scorpio", "Leo", "Sagittarius", "Cancer"],
  Saturn: ["Aries", "Leo", "Scorpio", "Sagittarius", "Pisces", "Cancer"],
  Rahu: ["Cancer", "Leo", "Scorpio", "Pisces"],
  Ketu: ["Gemini", "Virgo", "Taurus", "Libra", "Capricorn", "Aquarius"],
};

const EXALTATION_SIGNS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mars: "Capricorn",
  Mercury: "Virgo",
  Jupiter: "Cancer",
  Venus: "Pisces",
  Saturn: "Libra",
};

const DEBILITATION_SIGNS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries",
};

const OWN_SIGNS: Record<string, string[]> = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mars: ["Aries", "Scorpio"],
  Mercury: ["Gemini", "Virgo"],
  Jupiter: ["Sagittarius", "Pisces"],
  Venus: ["Taurus", "Libra"],
  Saturn: ["Capricorn", "Aquarius"],
  Rahu: ["Aquarius", "Virgo"],
  Ketu: ["Scorpio", "Pisces"],
};

function getNakshatraIndex(nakshatra: string): number {
  return NAKSHATRAS.indexOf(nakshatra as (typeof NAKSHATRAS)[number]);
}

function getNakshatraLord(nakshatra: string): string {
  const index = getNakshatraIndex(nakshatra);
  if (index < 0) return "Ketu";
  return VIMSHOTTARI_LORDS[index % 9] ?? "Ketu";
}

export function analyzeNakshatraPlanets(planets: ChartPlanet[]): NakshatraPlanetInfo[] {
  return planets.map((p) => {
    const nakshatraLord = getNakshatraLord(p.nakshatra);
    const dispositorSign = OWN_SIGNS[nakshatraLord]?.[0] || "Aries";
    const dispositorPlanet = planets.find((pl) => pl.planet === nakshatraLord);
    const nakshatraDispositor = dispositorPlanet?.planet || nakshatraLord;

    let dispositorRelationship: NakshatraPlanetInfo["dispositorRelationship"] = "neutral";
    const dispositorSignPlacement = dispositorPlanet?.sign || dispositorSign;

    if (EXALTATION_SIGNS[nakshatraLord] === dispositorSignPlacement) {
      dispositorRelationship = "exalted";
    } else if (DEBILITATION_SIGNS[nakshatraLord] === dispositorSignPlacement) {
      dispositorRelationship = "debilitated";
    } else if (OWN_SIGNS[nakshatraLord]?.includes(dispositorSignPlacement)) {
      dispositorRelationship = "own";
    } else if (FRIENDLY_SIGNS[nakshatraLord]?.includes(dispositorSignPlacement)) {
      dispositorRelationship = "friend";
    } else if (ENEMY_SIGNS[nakshatraLord]?.includes(dispositorSignPlacement)) {
      dispositorRelationship = "enemy";
    }

    return {
      planet: p.planet,
      nakshatra: p.nakshatra,
      nakshatraPada: p.nakshatraPada,
      nakshatraLord,
      sign: p.sign,
      house: p.house,
      signId: p.signId,
      longitude: p.longitude,
      nakshatraDispositor,
      dispositorRelationship,
      dignity: p.dignity,
    };
  });
}

export function calculateTaraBala(moonNakshatra: string, planets: ChartPlanet[]): TaraBalaResult[] {
  const moonNakIndex = getNakshatraIndex(moonNakshatra);
  if (moonNakIndex < 0) return [];

  const results: TaraBalaResult[] = [];

  for (const planet of planets) {
    if (!["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(planet.planet)) {
      continue;
    }

    const planetNakIndex = getNakshatraIndex(planet.nakshatra);
    if (planetNakIndex < 0) continue;

    let distance = planetNakIndex - moonNakIndex;
    if (distance < 0) distance += 27;
    distance += 1;

    let taraName = "";
    let taraGroup: TaraBalaResult["taraGroup"] = "janma";
    let auspicious = false;
    let description = "";

    if (distance >= 1 && distance <= 3) {
      taraName = "Janma Tara";
      taraGroup = "janma";
      auspicious = false;
      description = "Birth nakshatra group - self-development, identity formation";
    } else if (distance >= 4 && distance <= 6) {
      taraName = "Sampat Tara";
      taraGroup = "sampat";
      auspicious = true;
      description = "Wealth nakshatra group - prosperity, resources, accumulation";
    } else if (distance >= 7 && distance <= 9) {
      taraName = "Vipat Tara";
      taraGroup = "vipat";
      auspicious = false;
      description = "Danger nakshatra group - obstacles, challenges, transformation";
    } else if (distance >= 10 && distance <= 12) {
      taraName = "Kshema Tara";
      taraGroup = "kshema";
      auspicious = true;
      description = "Security nakshatra group - protection, stability, well-being";
    } else if (distance >= 13 && distance <= 15) {
      taraName = "Pratyak Tara";
      taraGroup = "pratyak";
      auspicious = false;
      description = "Obstacle nakshatra group - direct challenges, confrontation";
    } else if (distance >= 16 && distance <= 18) {
      taraName = "Sadhaka Tara";
      taraGroup = "sadhaka";
      auspicious = true;
      description = "Achievement nakshatra group - accomplishment, spiritual practice";
    } else if (distance >= 19 && distance <= 21) {
      taraName = "Naidhana/Vadha Tara";
      taraGroup = "naidhana";
      auspicious = false;
      description = "Destruction nakshatra group - endings, dissolution, release";
    } else if (distance >= 22 && distance <= 24) {
      taraName = "Mitra Tara";
      taraGroup = "mitra";
      auspicious = true;
      description = "Friend nakshatra group - support, friendship, alliances";
    } else if (distance >= 25 && distance <= 27) {
      taraName = "Param Mitra Tara";
      taraGroup = "paramamitra";
      auspicious = true;
      description = "Great friend nakshatra group - divine support, supreme assistance";
    }

    results.push({
      planet: planet.planet,
      taraName,
      taraGroup,
      nakshatraFromMoon: distance,
      auspicious,
      description,
    });
  }

  return results;
}

export function detectNakshatraYogas(planets: ChartPlanet[]): NakshatraYogaResult[] {
  const yogas: NakshatraYogaResult[] = [];
  const moon = planets.find((p) => p.planet === "Moon");
  if (!moon) return yogas;

  const nakshatraInfo = analyzeNakshatraPlanets(planets);

  // Yoga 1: Nakshatra Parivartana (Exchange of Nakshatra Lords)
  for (let i = 0; i < nakshatraInfo.length; i++) {
    for (let j = i + 1; j < nakshatraInfo.length; j++) {
      const p1 = nakshatraInfo[i];
      const p2 = nakshatraInfo[j];
      if (!p1 || !p2) continue;

      if (p1.nakshatraLord === p2.planet && p2.nakshatraLord === p1.planet) {
        yogas.push({
          id: "NAKSHATRA_PARIVARTANA",
          name: "Nakshatra Parivartana Yoga",
          sanskritName: "Nakshatra Parivartana Yoga",
          category: "nakshatra",
          planets: [p1.planet, p2.planet],
          nakshatras: [p1.nakshatra, p2.nakshatra],
          nakshatraLords: [p1.nakshatraLord, p2.nakshatraLord],
          condition: `${p1.planet} in ${p1.nakshatra} (lord: ${p1.nakshatraLord}) and ${p2.planet} in ${p2.nakshatra} (lord: ${p2.nakshatraLord}) exchange nakshatra lordship`,
          classicalReference: "Classical: Mutual exchange of nakshatra lords creates powerful linkage",
          interpretation: "Strong linkage between the two planets' nakshatra significations. Enhances both planets' results.",
          present: true,
          strength: 85,
        });
      }
    }
  }

  // Yoga 2: Nakshatra Dispositor Strength
  const strongDispositor = nakshatraInfo.filter((p) =>
    p.dispositorRelationship === "own" || p.dispositorRelationship === "exalted"
  );
  if (strongDispositor.length >= 2) {
    yogas.push({
      id: "NAKSHATRA_DISPOSITOR_STRENGTH",
      name: "Nakshatra Dispositor Strength",
      sanskritName: "Nakshatra Dispositor Bala",
      category: "nakshatra",
      planets: strongDispositor.map((p) => p.planet),
      nakshatras: strongDispositor.map((p) => p.nakshatra),
      nakshatraLords: strongDispositor.map((p) => p.nakshatraLord),
      condition: `${strongDispositor.length} planets have nakshatra lords in own or exalted signs`,
      classicalReference: "Classical: Nakshatra lord in own/exalted sign strengthens the planet's results",
      interpretation: "Planets with strong nakshatra dispositors give enhanced results in their domains.",
      present: true,
      strength: 70 + strongDispositor.length * 5,
    });
  }

  // Yoga 3: Chandra Nakshatra Lord Placement
  const moonNakLord = getNakshatraLord(moon.nakshatra);
  const moonNakLordPlanet = planets.find((p) => p.planet === moonNakLord);
  if (moonNakLordPlanet) {
    const moonNakLordInKendra = [1, 4, 7, 10].includes(moonNakLordPlanet.house);
    const moonNakLordInTrikona = [1, 5, 9].includes(moonNakLordPlanet.house);
    const moonNakLordInOwnExalted = OWN_SIGNS[moonNakLord]?.includes(moonNakLordPlanet.sign) || EXALTATION_SIGNS[moonNakLord] === moonNakLordPlanet.sign;

    if (moonNakLordInKendra || moonNakLordInTrikona || moonNakLordInOwnExalted) {
      yogas.push({
        id: "CHANDRA_NAKSHATRA_LORD_STRENGTH",
        name: "Chandra Nakshatra Lord Strength",
        sanskritName: "Chandra Nakshatra Swami Bala",
        category: "nakshatra",
        planets: [moonNakLord],
        nakshatras: [moon.nakshatra],
        nakshatraLords: [moonNakLord],
        condition: `Moon's nakshatra lord (${moonNakLord}) in ${moonNakLordPlanet.sign} (H${moonNakLordPlanet.house}) ${moonNakLordInKendra ? "in Kendra" : moonNakLordInTrikona ? "in Trikona" : "in own/exalted"}`,
        classicalReference: "Classical: Moon's nakshatra lord well-placed gives emotional stability and mental strength",
        interpretation: "Strong Moon nakshatra lord supports emotional well-being, mental clarity, and public recognition.",
        present: true,
        strength: moonNakLordInOwnExalted ? 90 : moonNakLordInKendra ? 80 : 75,
      });
    }
  }

  // Yoga 4: Tara Bala Summary - Auspicious Tara predominance
  const taraBala = calculateTaraBala(moon.nakshatra, planets);
  const auspiciousCount = taraBala.filter((t) => t.auspicious).length;
  const inauspiciousCount = taraBala.filter((t) => !t.auspicious).length;

  if (auspiciousCount >= 5) {
    yogas.push({
      id: "TARA_BALA_AUSPICIOUS",
      name: "Tara Bala - Auspicious Predominance",
      sanskritName: "Tara Bala Shubha",
      category: "nakshatra",
      planets: taraBala.filter((t) => t.auspicious).map((t) => t.planet),
      nakshatras: taraBala.filter((t) => t.auspicious).map((t) => {
        const p = planets.find((pl) => pl.planet === t.planet);
        return p?.nakshatra || "";
      }).filter(Boolean),
      nakshatraLords: taraBala.filter((t) => t.auspicious).map((t) => getNakshatraLord(
        planets.find((pl) => pl.planet === t.planet)?.nakshatra || ""
      )),
      condition: `${auspiciousCount} planets in auspicious Tara groups (Sampat, Kshema, Sadhaka, Mitra, Param Mitra)`,
      classicalReference: "Classical: Majority of planets in auspicious Tara from Moon supports overall well-being",
      interpretation: "Most planets in favorable Tara positions from Moon indicates general support for life endeavors.",
      present: true,
      strength: 60 + auspiciousCount * 3,
    });
  } else if (inauspiciousCount >= 5) {
    yogas.push({
      id: "TARA_BALA_INAUSPICIOUS",
      name: "Tara Bala - Challenging Predominance",
      sanskritName: "Tara Bala Ashubha",
      category: "nakshatra",
      planets: taraBala.filter((t) => !t.auspicious).map((t) => t.planet),
      nakshatras: taraBala.filter((t) => !t.auspicious).map((t) => {
        const p = planets.find((pl) => pl.planet === t.planet);
        return p?.nakshatra || "";
      }).filter(Boolean),
      nakshatraLords: taraBala.filter((t) => !t.auspicious).map((t) => getNakshatraLord(
        planets.find((pl) => pl.planet === t.planet)?.nakshatra || ""
      )),
      condition: `${inauspiciousCount} planets in challenging Tara groups (Janma, Vipat, Pratyak, Naidhana)`,
      classicalReference: "Classical: Majority of planets in challenging Tara from Moon indicates karmic lessons",
      interpretation: "Many planets in difficult Tara positions suggests areas requiring conscious effort and transformation.",
      present: true,
      strength: 40,
    });
  }

  // Yoga 5: Pushkara Navamsa / Nakshatra alignment
  const pushkaraNakshatras = ["Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni"];
  const pushkaraPlanets = planets.filter((p) => pushkaraNakshatras.includes(p.nakshatra));
  if (pushkaraPlanets.length >= 3) {
    yogas.push({
      id: "PUSHKARA_NAKSHATRA",
      name: "Pushkara Nakshatra Yoga",
      sanskritName: "Pushkara Nakshatra Yoga",
      category: "nakshatra",
      planets: pushkaraPlanets.map((p) => p.planet),
      nakshatras: pushkaraPlanets.map((p) => p.nakshatra),
      nakshatraLords: pushkaraPlanets.map((p) => getNakshatraLord(p.nakshatra)),
      condition: `${pushkaraPlanets.length} planets in Pushkara nakshatras (nourishing/fortunate group)`,
      classicalReference: "Jataka Parijata / classical: Planets in Pushkara nakshatras give favorable results",
      interpretation: "Multiple planets in nourishing nakshatras supports growth, protection, and positive outcomes.",
      present: true,
      strength: 70 + pushkaraPlanets.length * 3,
    });
  }

  // Yoga 6: Nakshatra Lord Conjunction
  const nakshatraLordConjunctions = nakshatraInfo.filter((p) => {
    const lordPlanet = planets.find((pl) => pl.planet === p.nakshatraLord);
    return lordPlanet && lordPlanet.house === p.house;
  });
  if (nakshatraLordConjunctions.length > 0) {
    for (const nc of nakshatraLordConjunctions) {
      const lordPlanet = planets.find((pl) => pl.planet === nc.nakshatraLord)!;
      yogas.push({
        id: "NAKSHATRA_LORD_CONJUNCTION",
        name: `Nakshatra Lord Conjunction (${nc.planet})`,
        sanskritName: "Nakshatra Swami Samyoga",
        category: "nakshatra",
        planets: [nc.planet, nc.nakshatraLord],
        nakshatras: [nc.nakshatra],
        nakshatraLords: [nc.nakshatraLord],
        condition: `${nc.planet} in ${nc.nakshatra} conjunct its nakshatra lord ${nc.nakshatraLord} in H${nc.house}`,
        classicalReference: "Classical: Planet conjunct its nakshatra lord intensifies the planet's results",
        interpretation: "Planet conjunct its nakshatra lord gives intensified, focused results in that planet's domain.",
        present: true,
        strength: 80,
      });
    }
  }

  // Yoga 7: Atmakaraka in Pushkara Nakshatra (Jaimini)
  const atmakaraka = planets.reduce<ChartPlanet | undefined>(
    (max, p) => (!max || p.longitude > max.longitude ? p : max),
    undefined,
  );
  if (atmakaraka && pushkaraNakshatras.includes(atmakaraka.nakshatra)) {
    yogas.push({
      id: "ATMAKARAKA_PUSHKARA",
      name: "Atmakaraka in Pushkara Nakshatra",
      sanskritName: "Atmakaraka Pushkara",
      category: "nakshatra",
      planets: [atmakaraka.planet],
      nakshatras: [atmakaraka.nakshatra],
      nakshatraLords: [getNakshatraLord(atmakaraka.nakshatra)],
      condition: `Atmakaraka (${atmakaraka.planet}) in Pushkara nakshatra ${atmakaraka.nakshatra}`,
      classicalReference: "Jaimini / Classical: Soul planet in nourishing nakshatra supports life purpose",
      interpretation: "The soul's indicator in a nourishing nakshatra supports spiritual growth and life fulfillment.",
      present: true,
      strength: 88,
    });
  }

  return yogas;
}

export function getNakshatraAnalysisSummary(planets: ChartPlanet[]) {
  const moon = planets.find((p) => p.planet === "Moon");
  if (!moon) return null;

  const nakshatraInfo = analyzeNakshatraPlanets(planets);
  const taraBala = calculateTaraBala(moon.nakshatra, planets);
  const nakshatraYogas = detectNakshatraYogas(planets);

  return {
    moonNakshatra: moon.nakshatra,
    moonNakshatraPada: moon.nakshatraPada,
    moonNakshatraLord: getNakshatraLord(moon.nakshatra),
    planets: nakshatraInfo,
    taraBala,
    nakshatraYogas,
  };
}