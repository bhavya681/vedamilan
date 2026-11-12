import { ChartPlanet } from "./chart-builder";
import { SIGNS, longitudeToSign } from "./vedic-constants";

export type JaiminiKaraka = {
  planet: string;
  name: string;
  longitude: number;
  sign: string;
  signId: number;
  house: number;
};

export type JaiminiLagna = {
  name: string;
  sign: string;
  signId: number;
  longitude: number;
};

export type JaiminiYogaResult = {
  id: string;
  name: string;
  sanskritName: string;
  category: "jaimini";
  planets: string[];
  condition: string;
  classicalReference: string;
  interpretation: string;
  present: boolean;
  strength: number;
};

const KARAKA_NAMES = [
  { name: "Atmakaraka", short: "AK" },
  { name: "Amatyakaraka", short: "AMK" },
  { name: "Bhratrikaraka", short: "BK" },
  { name: "Matrikaraka", short: "MK" },
  { name: "Putrakaraka", short: "PK" },
  { name: "Gnatikaraka", short: "GK" },
  { name: "Darakaraka", short: "DK" },
] as const;

export function calculateJaiminiKaraka(planets: ChartPlanet[]): JaiminiKaraka[] {
  const classicalPlanets = planets.filter((p) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(p.planet)
  );

  const sortedByLongitude = [...classicalPlanets].sort((a, b) => b.longitude - a.longitude);

  return sortedByLongitude.map((p, index) => ({
    planet: p.planet,
    name: KARAKA_NAMES[index]?.name || `Karaka ${index + 1}`,
    longitude: p.longitude,
    sign: p.sign,
    signId: p.signId,
    house: p.house,
  }));
}

export function calculateArudhaLagna(planets: ChartPlanet[], lagnaSignId: number): JaiminiLagna {
  const lagnaLord = getHouseLord(1, lagnaSignId);
  const lagnaLordPlanet = planets.find((p) => p.planet === lagnaLord);

  if (!lagnaLordPlanet) {
    return { name: "Arudha Lagna", sign: "Aries", signId: 0, longitude: 0 };
  }

  const lagnaLordHouse = lagnaLordPlanet.house;
  const arudhaHouse = ((lagnaLordHouse - 1 + (lagnaLordHouse - 1)) % 12) + 1;

  const arudhaSignId = (lagnaSignId + arudhaHouse - 1) % 12;
  return {
    name: "Arudha Lagna",
    sign: SIGNS[arudhaSignId] ?? "Aries",
    signId: arudhaSignId,
    longitude: arudhaSignId * 30,
  };
}

export function calculateArudhaPadas(planets: ChartPlanet[], lagnaSignId: number): Record<number, JaiminiLagna> {
  const padas: Record<number, JaiminiLagna> = {};

  for (let house = 1; house <= 12; house++) {
    const houseLord = getHouseLord(house, lagnaSignId);
    const houseLordPlanet = planets.find((p) => p.planet === houseLord);

    if (!houseLordPlanet) {
      padas[house] = {
        name: `A${house}`,
        sign: SIGNS[house - 1] ?? "Aries",
        signId: house - 1,
        longitude: (house - 1) * 30,
      };
      continue;
    }

    const lordHouse = houseLordPlanet.house;
    const arudhaHouse = ((lordHouse - 1 + (lordHouse - 1)) % 12) + 1;
    const arudhaSignId = (lagnaSignId + arudhaHouse - 1) % 12;

    padas[house] = {
      name: `A${house}`,
      sign: SIGNS[arudhaSignId] ?? "Aries",
      signId: arudhaSignId,
      longitude: arudhaSignId * 30,
    };
  }

  return padas;
}

export function calculateGhatiLagna(lagnaLongitude: number, sunLongitude: number, birthTime: Date): JaiminiLagna {
  const sunriseHour = 6;
  const birthHour = birthTime.getHours() + birthTime.getMinutes() / 60;
  const hoursFromSunrise = birthHour - sunriseHour;

  const ghatiLagnaLongitude = (lagnaLongitude + hoursFromSunrise * 15) % 360;
  const ghatiSign = longitudeToSign(ghatiLagnaLongitude);

  return {
    name: "Ghati Lagna",
    sign: ghatiSign.sign,
    signId: ghatiSign.signId,
    longitude: ghatiLagnaLongitude,
  };
}

export function calculateHoraLagna(lagnaLongitude: number, sunLongitude: number, birthTime: Date): JaiminiLagna {
  const sunriseHour = 6;
  const birthHour = birthTime.getHours() + birthTime.getMinutes() / 60;
  const hoursFromSunrise = birthHour - sunriseHour;

  const horaLagnaLongitude = (lagnaLongitude + hoursFromSunrise * 30) % 360;
  const horaSign = longitudeToSign(horaLagnaLongitude);

  return {
    name: "Hora Lagna",
    sign: horaSign.sign,
    signId: horaSign.signId,
    longitude: horaLagnaLongitude,
  };
}

function getHouseLord(house: number, lagnaSignId: number): string {
  const signIndex = (lagnaSignId + house - 1) % 12;
  const sign = SIGNS[signIndex] ?? "Aries";

  const lords: Record<string, string> = {
    Aries: "Mars",
    Taurus: "Venus",
    Gemini: "Mercury",
    Cancer: "Moon",
    Leo: "Sun",
    Virgo: "Mercury",
    Libra: "Venus",
    Scorpio: "Mars",
    Sagittarius: "Jupiter",
    Capricorn: "Saturn",
    Aquarius: "Saturn",
    Pisces: "Jupiter",
  };

  return lords[sign] ?? "Mars";
}

function getJaiminiAspect(fromSignId: number, toSignId: number): boolean {
  const diff = (toSignId - fromSignId + 12) % 12;

  return diff === 0 || diff === 3 || diff === 5 || diff === 7 || diff === 9;
}

export function detectJaiminiYogas(
  planets: ChartPlanet[],
  lagnaSignId: number,
  lagnaLongitude: number,
  birthTime?: Date
): JaiminiYogaResult[] {
  const yogas: JaiminiYogaResult[] = [];

  const karakas = calculateJaiminiKaraka(planets);
  const ak = karakas.find((k) => k.name === "Atmakaraka");
  const amk = karakas.find((k) => k.name === "Amatyakaraka");
  const pk = karakas.find((k) => k.name === "Putrakaraka");
  const dk = karakas.find((k) => k.name === "Darakaraka");

  const arudhaLagna = calculateArudhaLagna(planets, lagnaSignId);
  const arudhaPadas = calculateArudhaPadas(planets, lagnaSignId);

  // Yoga 1: Atmakaraka-Amatyakaraka Raja Sambandha
  if (ak && amk) {
    const sameSign = ak.signId === amk.signId;
    const mutualAspect = getJaiminiAspect(ak.signId, amk.signId) && getJaiminiAspect(amk.signId, ak.signId);
    const conjunction = ak.house === amk.house;
    const exchange = false; // Would need sign lordship check

    if (sameSign || mutualAspect || conjunction) {
      yogas.push({
        id: "JAIMINI_AK_AMK_SAMBANDHA",
        name: "Jaimini Raja Sambandha (AK-AMK)",
        sanskritName: "Atmakaraka-Amatyakaraka Sambandha",
        category: "jaimini",
        planets: [ak.planet, amk.planet],
        condition: `Atmakaraka (${ak.planet} in ${ak.sign}) and Amatyakaraka (${amk.planet} in ${amk.sign}) ${sameSign ? "in same sign" : mutualAspect ? "mutually aspect" : "conjoined"}`,
        classicalReference: "Jaimini Sutras 1.1-1.3: AK-AMK relationship indicates career and authority",
        interpretation: "Strong connection between soul purpose (AK) and career/profession (AMK). Indicates rise to authority and fulfillment of life purpose through vocation.",
        present: true,
        strength: sameSign ? 95 : mutualAspect ? 85 : 80,
      });
    }
  }

  // Yoga 2: Atmakaraka in Arudha Lagna
  if (ak && arudhaLagna) {
    if (ak.signId === arudhaLagna.signId) {
      yogas.push({
        id: "JAIMINI_AK_IN_ARUDHA_LAGNA",
        name: "Atmakaraka in Arudha Lagna",
        sanskritName: "Atmakaraka Arudha Lagna Yoga",
        category: "jaimini",
        planets: [ak.planet],
        condition: `Atmakaraka (${ak.planet}) placed in Arudha Lagna (${arudhaLagna.sign})`,
        classicalReference: "Jaimini Sutras: AK in Arudha Lagna gives fame and recognition",
        interpretation: "The soul's significator in the Arudha Lagna (manifestation point) brings public recognition, fame, and manifestation of soul purpose in the world.",
        present: true,
        strength: 90,
      });
    }
  }

  // Yoga 3: Atmakaraka aspecting Arudha Lagna
  if (ak && arudhaLagna) {
    if (getJaiminiAspect(ak.signId, arudhaLagna.signId)) {
      yogas.push({
        id: "JAIMINI_AK_ASPECT_ARUDHA_LAGNA",
        name: "Atmakaraka Aspecting Arudha Lagna",
        sanskritName: "Atmakaraka Arudha Drishti",
        category: "jaimini",
        planets: [ak.planet],
        condition: `Atmakaraka (${ak.planet} in ${ak.sign}) aspects Arudha Lagna (${arudhaLagna.sign})`,
        classicalReference: "Jaimini Sutras: AK aspect on Arudha Lagna supports public image",
        interpretation: "The soul planet's aspect on the manifestation point supports recognition and the fruition of one's karmic path.",
        present: true,
        strength: 75,
      });
    }
  }

  // Yoga 4: Amatyakaraka in 10th from Arudha Lagna
  if (amk) {
    const alSignId = arudhaLagna.signId;
    const tenthFromAL = (alSignId + 9) % 12;
    if (amk.signId === tenthFromAL) {
      yogas.push({
        id: "JAIMINI_AMK_IN_10TH_FROM_AL",
        name: "Amatyakaraka in 10th from Arudha Lagna",
        sanskritName: "Amatyakaraka Dashama Arudha",
        category: "jaimini",
        planets: [amk.planet],
        condition: `Amatyakaraka (${amk.planet}) in 10th house from Arudha Lagna (${SIGNS[tenthFromAL] ?? "Aries"})`,
        classicalReference: "Jaimini Sutras: AMK in 10th from AL gives career success and authority",
        interpretation: "The career significator in the 10th from the manifestation point gives professional success, authority, and public standing.",
        present: true,
        strength: 85,
      });
    }
  }

  // Yoga 5: Putrakaraka in 5th from Arudha Lagna
  if (pk) {
    const alSignId = arudhaLagna.signId;
    const fifthFromAL = (alSignId + 4) % 12;
    if (pk.signId === fifthFromAL) {
      yogas.push({
        id: "JAIMINI_PK_IN_5TH_FROM_AL",
        name: "Putrakaraka in 5th from Arudha Lagna",
        sanskritName: "Putrakaraka Panchama Arudha",
        category: "jaimini",
        planets: [pk.planet],
        condition: `Putrakaraka (${pk.planet}) in 5th house from Arudha Lagna (${SIGNS[fifthFromAL] ?? "Aries"})`,
        classicalReference: "Jaimini Sutras: PK in 5th from AL gives creative progeny and intelligence",
        interpretation: "The progeny/creativity significator in the 5th from manifestation supports creative expression, children, and intellectual pursuits.",
        present: true,
        strength: 75,
      });
    }
  }

  // Yoga 6: Darakaraka in 7th from Arudha Lagna
  if (dk) {
    const alSignId = arudhaLagna.signId;
    const seventhFromAL = (alSignId + 6) % 12;
    if (dk.signId === seventhFromAL) {
      yogas.push({
        id: "JAIMINI_DK_IN_7TH_FROM_AL",
        name: "Darakaraka in 7th from Arudha Lagna",
        sanskritName: "Darakaraka Saptama Arudha",
        category: "jaimini",
        planets: [dk.planet],
        condition: `Darakaraka (${dk.planet}) in 7th house from Arudha Lagna (${SIGNS[seventhFromAL] ?? "Aries"})`,
        classicalReference: "Jaimini Sutras: DK in 7th from AL gives relationship and partnership success",
        interpretation: "The spouse/partnership significator in the 7th from manifestation supports harmonious relationships and successful partnerships.",
        present: true,
        strength: 80,
      });
    }
  }

  // Yoga 7: Karakas in Kendra from Arudha Lagna
  const kendraFromAL = [arudhaLagna.signId, (arudhaLagna.signId + 3) % 12, (arudhaLagna.signId + 6) % 12, (arudhaLagna.signId + 9) % 12];
  const karakasInKendra = karakas.filter((k) => kendraFromAL.includes(k.signId));
  if (karakasInKendra.length >= 3) {
    yogas.push({
      id: "JAIMINI_KARAKAS_IN_KENDRA_AL",
      name: "Multiple Karakas in Kendra from Arudha Lagna",
      sanskritName: "Karakas Kendra Arudha",
      category: "jaimini",
      planets: karakasInKendra.map((k) => k.planet),
      condition: `${karakasInKendra.length} karakas in Kendra houses from Arudha Lagna`,
      classicalReference: "Jaimini Sutras: Karakas in Kendra from AL gives power and authority",
      interpretation: "Multiple karakas angular from the manifestation point gives structural strength, authority, and the ability to manifest results.",
      present: true,
      strength: 70 + karakasInKendra.length * 5,
    });
  }

  // Yoga 8: Atmakaraka in Swamsa (own sign in Navamsa would need D9)
  // For now, check if AK is in own sign in Rasi
  if (ak) {
    const ownSigns: Record<string, string[]> = {
      Sun: ["Leo"],
      Moon: ["Cancer"],
      Mars: ["Aries", "Scorpio"],
      Mercury: ["Gemini", "Virgo"],
      Jupiter: ["Sagittarius", "Pisces"],
      Venus: ["Taurus", "Libra"],
      Saturn: ["Capricorn", "Aquarius"],
    };
    if (ownSigns[ak.planet]?.includes(ak.sign)) {
      yogas.push({
        id: "JAIMINI_AK_IN_OWN_SIGN",
        name: "Atmakaraka in Own Sign (Swamsa)",
        sanskritName: "Atmakaraka Swamsa",
        category: "jaimini",
        planets: [ak.planet],
        condition: `Atmakaraka (${ak.planet}) in own sign ${ak.sign}`,
        classicalReference: "Jaimini Sutras: AK in own sign (Swamsa) gives spiritual progress and self-realization",
        interpretation: "The soul planet in its own sign indicates strong self-awareness, spiritual inclination, and the ability to manifest one's true nature.",
        present: true,
        strength: 88,
      });
    }
  }

  // Yoga 9: Raja Yoga from Karaka associations (any two karakas conjoined/aspecting)
  for (let i = 0; i < karakas.length; i++) {
    for (let j = i + 1; j < karakas.length; j++) {
      const k1 = karakas[i];
      const k2 = karakas[j];
      if (!k1 || !k2) continue;

      if (k1.house === k2.house) {
        yogas.push({
          id: `JAIMINI_${k1.name}_${k2.name}_CONJUNCTION`,
          name: `Jaimini Karaka Conjunction (${k1.name}-${k2.name})`,
          sanskritName: `${k1.name}-${k2.name} Sambandha`,
          category: "jaimini",
          planets: [k1.planet, k2.planet],
          condition: `${k1.name} (${k1.planet}) and ${k2.name} (${k2.planet}) conjunct in ${k1.sign} (H${k1.house})`,
          classicalReference: "Jaimini Sutras: Conjoined karakas create specific Raja Yogas",
          interpretation: `Association of ${k1.name} and ${k2.name} links their significations creating a specialized Raja Yoga.`,
          present: true,
          strength: 78,
        });
      } else if (getJaiminiAspect(k1.signId, k2.signId) && getJaiminiAspect(k2.signId, k1.signId)) {
        yogas.push({
          id: `JAIMINI_${k1.name}_${k2.name}_MUTUAL_ASPECT`,
          name: `Jaimini Karaka Mutual Aspect (${k1.name}-${k2.name})`,
          sanskritName: `${k1.name}-${k2.name} Drishti Sambandha`,
          category: "jaimini",
          planets: [k1.planet, k2.planet],
          condition: `${k1.name} (${k1.planet} in ${k1.sign}) and ${k2.name} (${k2.planet} in ${k2.sign}) mutually aspect`,
          classicalReference: "Jaimini Sutras: Mutually aspecting karakas create Raja Yoga",
          interpretation: `Mutual aspect between ${k1.name} and ${k2.name} creates a strong Raja Yoga linking their domains.`,
          present: true,
          strength: 72,
        });
      }
    }
  }

  // Yoga 10: Ghati Lagna / Hora Lagna associations (if birth time provided)
  if (birthTime) {
    const sun = planets.find((p) => p.planet === "Sun");
    if (sun) {
      const ghatiLagna = calculateGhatiLagna(lagnaLongitude, sun.longitude, birthTime);
      const horaLagna = calculateHoraLagna(lagnaLongitude, sun.longitude, birthTime);

      // Check if any karaka is in Ghati Lagna or Hora Lagna
      for (const k of karakas) {
        if (k.signId === ghatiLagna.signId) {
          yogas.push({
            id: `JAIMINI_${k.name}_IN_GHATI_LAGNA`,
            name: `${k.name} in Ghati Lagna`,
            sanskritName: `${k.name} Ghati Lagna`,
            category: "jaimini",
            planets: [k.planet],
            condition: `${k.name} (${k.planet}) in Ghati Lagna (${ghatiLagna.sign})`,
            classicalReference: "Jaimini Sutras: Karaka in Ghati Lagna gives power and authority",
            interpretation: `${k.name} in the power lagna (Ghati Lagna) gives authority, leadership, and the ability to overcome obstacles.`,
            present: true,
            strength: 82,
          });
        }
        if (k.signId === horaLagna.signId) {
          yogas.push({
            id: `JAIMINI_${k.name}_IN_HORA_LAGNA`,
            name: `${k.name} in Hora Lagna`,
            sanskritName: `${k.name} Hora Lagna`,
            category: "jaimini",
            planets: [k.planet],
            condition: `${k.name} (${k.planet}) in Hora Lagna (${horaLagna.sign})`,
            classicalReference: "Jaimini Sutras: Karaka in Hora Lagna gives wealth and resources",
            interpretation: `${k.name} in the wealth lagna (Hora Lagna) gives financial prosperity and resource accumulation.`,
            present: true,
            strength: 80,
          });
        }
      }
    }
  }

  return yogas;
}

export function getJaiminiAnalysis(planets: ChartPlanet[], lagnaSignId: number, lagnaLongitude: number, birthTime?: Date) {
  const karakas = calculateJaiminiKaraka(planets);
  const arudhaLagna = calculateArudhaLagna(planets, lagnaSignId);
  const arudhaPadas = calculateArudhaPadas(planets, lagnaSignId);
  const yogas = detectJaiminiYogas(planets, lagnaSignId, lagnaLongitude, birthTime);

  let ghatiLagna: JaiminiLagna | null = null;
  let horaLagna: JaiminiLagna | null = null;

  if (birthTime) {
    const sun = planets.find((p) => p.planet === "Sun");
    if (sun) {
      ghatiLagna = calculateGhatiLagna(lagnaLongitude, sun.longitude, birthTime);
      horaLagna = calculateHoraLagna(lagnaLongitude, sun.longitude, birthTime);
    }
  }

  return {
    karakas,
    arudhaLagna,
    arudhaPadas,
    ghatiLagna,
    horaLagna,
    yogas,
  };
}