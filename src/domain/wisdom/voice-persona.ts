/**
 * Voice personas for AI Wisdom Guides.
 * These are respectful synthetic styles — never claims of historical authenticity.
 */

export type VoicePersona = {
  guideId: string;
  /** Preferred browser / server voice hints */
  tone: "calm" | "warm" | "precise" | "gentle" | "reflective";
  pace: "slow" | "measured" | "moderate";
  energy: "low" | "moderate";
  warmth: "low" | "moderate" | "high";
  /** OpenAI TTS voice id when server TTS is enabled */
  serverVoice?: "alloy" | "ash" | "coral" | "echo" | "fable" | "onyx" | "nova" | "sage" | "shimmer";
  /** speechSynthesis rate 0.7–1.1 */
  rate: number;
  pitch: number;
};

const DEFAULT_PERSONA: Omit<VoicePersona, "guideId"> = {
  tone: "calm",
  pace: "measured",
  energy: "low",
  warmth: "moderate",
  serverVoice: "sage",
  rate: 0.92,
  pitch: 1,
};

const PERSONAS: Record<string, Partial<VoicePersona>> = {
  chanakya: { tone: "precise", pace: "measured", warmth: "low", serverVoice: "onyx", rate: 0.9 },
  vidura: { tone: "gentle", pace: "slow", warmth: "high", serverVoice: "sage", rate: 0.88 },
  krishna: { tone: "warm", pace: "measured", warmth: "high", serverVoice: "coral", rate: 0.9 },
  bhishma: { tone: "precise", pace: "slow", warmth: "low", serverVoice: "onyx", rate: 0.86 },
  dronacharya: {
    tone: "precise",
    pace: "measured",
    warmth: "low",
    serverVoice: "echo",
    rate: 0.92,
  },
  patanjali: { tone: "calm", pace: "slow", warmth: "moderate", serverVoice: "sage", rate: 0.85 },
  "adi-shankaracharya": {
    tone: "reflective",
    pace: "measured",
    warmth: "moderate",
    serverVoice: "fable",
    rate: 0.9,
  },
  "swami-vivekananda": {
    tone: "warm",
    pace: "moderate",
    energy: "moderate",
    warmth: "high",
    serverVoice: "ash",
    rate: 0.95,
  },
  "ramana-maharshi": {
    tone: "gentle",
    pace: "slow",
    warmth: "moderate",
    serverVoice: "sage",
    rate: 0.82,
  },
  vasistha: { tone: "calm", pace: "measured", serverVoice: "sage" },
  vishwamitra: { tone: "precise", pace: "measured", serverVoice: "echo" },
  vyasa: { tone: "reflective", pace: "measured", serverVoice: "fable" },
  valmiki: { tone: "warm", pace: "measured", serverVoice: "coral" },
  yajnavalkya: { tone: "reflective", pace: "slow", serverVoice: "sage" },
};

export function getVoicePersona(guideId: string): VoicePersona {
  return {
    guideId,
    ...DEFAULT_PERSONA,
    ...PERSONAS[guideId],
  };
}

export const VOICE_PRIVACY_NOTICE =
  "Your microphone audio is processed only to power this conversation. VedaMilan does not permanently store raw voice recordings. Transcripts are kept with your wisdom conversation unless you delete them. This is an AI-generated voice designed to accompany the wisdom experience — not the voice of a historical figure.";
