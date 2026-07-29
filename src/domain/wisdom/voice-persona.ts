/**
 * Voice personas for AI Wisdom Guides.
 * These are respectful synthetic styles — never claims of historical authenticity.
 */

export type OpenAiTtsVoice =
  "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer";

export type VoicePersona = {
  guideId: string;
  tone: "calm" | "warm" | "precise" | "gentle" | "reflective";
  pace: "slow" | "measured" | "moderate";
  energy: "low" | "moderate";
  warmth: "low" | "moderate" | "high";
  gender: "male" | "female" | "neutral";
  serverVoice?: OpenAiTtsVoice;
  rate: number;
  pitch: number;
};

const MALE_SERVER_VOICES: OpenAiTtsVoice[] = ["onyx", "echo", "ash", "fable"];
const FEMALE_SERVER_VOICES: OpenAiTtsVoice[] = ["nova", "coral", "shimmer", "sage"];

const DEFAULT_PERSONA: Omit<VoicePersona, "guideId"> = {
  tone: "calm",
  pace: "measured",
  energy: "low",
  warmth: "moderate",
  gender: "male",
  serverVoice: "onyx",
  rate: 0.92,
  pitch: 0.85,
};

const PERSONAS: Record<string, Partial<VoicePersona>> = {
  chanakya: { tone: "precise", pace: "measured", warmth: "low", serverVoice: "onyx", rate: 0.9 },
  vidura: { tone: "gentle", pace: "slow", warmth: "high", serverVoice: "onyx", rate: 0.88 },
  krishna: { tone: "warm", pace: "measured", warmth: "high", serverVoice: "onyx", rate: 0.9 },
  bhishma: { tone: "precise", pace: "slow", warmth: "low", serverVoice: "onyx", rate: 0.86 },
  dronacharya: {
    tone: "precise",
    pace: "measured",
    warmth: "low",
    serverVoice: "onyx",
    rate: 0.92,
  },
  patanjali: { tone: "calm", pace: "slow", warmth: "moderate", serverVoice: "onyx", rate: 0.85 },
  "adi-shankaracharya": {
    tone: "reflective",
    pace: "measured",
    warmth: "moderate",
    serverVoice: "onyx",
    rate: 0.9,
  },
  "swami-vivekananda": {
    tone: "warm",
    pace: "moderate",
    energy: "moderate",
    warmth: "high",
    serverVoice: "onyx",
    rate: 0.95,
  },
  "ramana-maharshi": {
    tone: "gentle",
    pace: "slow",
    warmth: "moderate",
    serverVoice: "onyx",
    rate: 0.82,
  },
  vasistha: { tone: "calm", pace: "measured", serverVoice: "onyx" },
  vishwamitra: { tone: "precise", pace: "measured", serverVoice: "onyx" },
  vyasa: { tone: "reflective", pace: "measured", serverVoice: "onyx" },
  valmiki: { tone: "warm", pace: "measured", serverVoice: "onyx" },
  yajnavalkya: { tone: "reflective", pace: "slow", serverVoice: "onyx" },
  // Virtual AI astrologers (Consultation) — Vedic × modern fusion personas
  "guru-orbit": {
    tone: "precise",
    pace: "measured",
    gender: "male",
    serverVoice: "onyx",
    rate: 0.9,
  },
  "karaka-kernel": {
    tone: "reflective",
    pace: "measured",
    gender: "male",
    serverVoice: "echo",
    rate: 0.9,
  },
  "budha-byte": {
    tone: "precise",
    pace: "moderate",
    gender: "male",
    serverVoice: "ash",
    rate: 0.94,
  },
  "nadi-nexus": {
    tone: "gentle",
    pace: "slow",
    gender: "female",
    serverVoice: "nova",
    warmth: "high",
    rate: 0.88,
    pitch: 1.05,
  },
  "rahu-guru": {
    tone: "precise",
    pace: "measured",
    gender: "male",
    serverVoice: "onyx",
    rate: 0.91,
  },
  "upaya-aura": {
    tone: "warm",
    pace: "measured",
    gender: "female",
    serverVoice: "coral",
    warmth: "high",
    rate: 0.92,
    pitch: 1.02,
  },
  "varsha-vault": {
    tone: "reflective",
    pace: "measured",
    gender: "male",
    serverVoice: "fable",
    rate: 0.9,
  },
  "shani-sync": {
    tone: "precise",
    pace: "moderate",
    gender: "male",
    serverVoice: "onyx",
    rate: 0.93,
  },
  "prashna-pulse": {
    tone: "precise",
    pace: "measured",
    gender: "female",
    serverVoice: "shimmer",
    rate: 0.94,
    pitch: 1.04,
  },
  "ketu-nova": {
    tone: "gentle",
    pace: "measured",
    gender: "female",
    serverVoice: "sage",
    warmth: "high",
    rate: 0.9,
    pitch: 1.03,
  },
  "wuxing-wire": {
    tone: "calm",
    pace: "measured",
    gender: "male",
    serverVoice: "echo",
    rate: 0.9,
  },
  "zodiac-zen": {
    tone: "warm",
    pace: "moderate",
    gender: "female",
    serverVoice: "nova",
    warmth: "high",
    rate: 0.95,
    pitch: 1.02,
  },
};

export function getVoicePersona(guideId: string): VoicePersona {
  return {
    guideId,
    ...DEFAULT_PERSONA,
    ...PERSONAS[guideId],
  };
}

/** Hindi/Marathi use female TTS for clear Indic speech; English keeps male. */
export function resolveSpeechGender(
  persona: VoicePersona,
  language?: string | null,
): "male" | "female" | "neutral" {
  if (language === "hi" || language === "mr") return "female";
  return persona.gender;
}

export function resolveServerVoice(
  persona: VoicePersona,
  language?: string | null,
): OpenAiTtsVoice {
  const isIndic = language === "hi" || language === "mr";
  if (isIndic) return "nova";
  if (persona.gender === "female") {
    const base = persona.serverVoice || "nova";
    return FEMALE_SERVER_VOICES.includes(base) ? base : "nova";
  }
  const base = persona.serverVoice || DEFAULT_PERSONA.serverVoice || "onyx";
  if (MALE_SERVER_VOICES.includes(base)) return base;
  return "onyx";
}

export const VOICE_PRIVACY_NOTICE =
  "Your microphone audio is processed only to power this conversation. VedaMilan does not permanently store raw voice recordings. Transcripts are kept with your wisdom conversation unless you delete them. This is an AI-generated voice designed to accompany the wisdom experience — not the voice of a historical figure.";
