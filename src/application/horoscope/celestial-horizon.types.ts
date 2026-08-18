export type CelestialMode = "live" | "birth";

export type CelestialLocation = {
  label: string;
  timezone: string;
  latitude: number;
  longitude: number;
  source: "birth" | "device" | "query";
};

export type CelestialBody = {
  planet: string;
  sign: string;
  degreeInSign: string;
  longitude: number;
  nakshatra: string;
  nakshatraPada: number;
  houseFromCurrentLagna: number;
  houseFromNatalLagna: number | null;
  dignity: string | null;
  isRetrograde: boolean;
  altitude: number;
  azimuth: number;
  aboveHorizon: boolean;
  status: "rising" | "near-rising" | "setting" | "above" | "below";
};

export type CelestialPoint = {
  altitude: number;
  azimuth: number;
  siderealLongitude: number;
};

export type CelestialAscendant = {
  sign: string;
  degreeInSign: string;
  longitude: number;
  nakshatra: string;
  nakshatraPada: number;
  altitude: number;
  azimuth: number;
};

export type CelestialSnapshot = {
  timestamp: string;
  julianDay: number;
  mode: CelestialMode;
  location: CelestialLocation;
  ayanamsaDeg: number;
  engine: "swiss-ephemeris-lahiri";
  ascendant: CelestialAscendant;
  midheaven: CelestialAscendant | null;
  descendantAzimuth: number;
  moonNakshatra: string | null;
  moonSign: string | null;
  planets: CelestialBody[];
  eclipticPath: CelestialPoint[];
  natal?: {
    lagnaSign: string;
    moonSign: string | null;
    birthLabel: string;
  } | null;
  snapshot: {
    risingSign: string;
    currentNakshatra: string;
    closestToHorizon: string | null;
    strongestVisible: string | null;
    risingPlanets: string[];
    settingPlanets: string[];
  };
};
