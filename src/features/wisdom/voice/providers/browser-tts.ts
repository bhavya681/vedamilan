"use client";

import type { TextToSpeechProvider, VoiceConfig } from "@/features/wisdom/voice/types";
import { mapSpeechLocale } from "@/features/wisdom/voice/types";
import { prepareSpeechText } from "@/features/wisdom/voice/prepare-speech-text";
import {
  resolveServerVoice,
  resolveSpeechGender,
  type VoicePersona,
} from "@/domain/wisdom/voice-persona";

const FEMALE_VOICE_HINT =
  /female|woman|girl|zira|swara|heera|neerja|kalpana|ananya|sonia|hazel|susan|karen|moira|tessa|fiona|veena|aria|jenny|sara|samantha|victoria|microsoft hindi(?!.*hemant)/i;

const MALE_VOICE_HINT =
  /male|man|boy|\bhemant\b|\bravi\b|\bprabhat\b|\bdinesh\b|\bdavid\b|\bmark\b|\bgeorge\b|\bdaniel\b|\bthomas\b|\brishi\b|\bashish\b|\bkumar\b/i;

function scoreVoice(
  voice: SpeechSynthesisVoice,
  langPrefix: string,
  preferFemale: boolean,
): number {
  const name = voice.name;
  const lang = voice.lang.toLowerCase();
  let score = 0;
  if (lang.startsWith(langPrefix)) score += 40;
  else if (lang.startsWith("en") && (lang.includes("in") || /en-in/i.test(lang))) score += 8;

  if (preferFemale) {
    if (FEMALE_VOICE_HINT.test(name)) score += 50;
    if (MALE_VOICE_HINT.test(name)) score -= 40;
    if (/swara|neerja|heera|kalpana|ananya|veena/i.test(name) && langPrefix === "hi") score += 30;
  } else {
    if (FEMALE_VOICE_HINT.test(name)) score -= 100;
    if (MALE_VOICE_HINT.test(name)) score += 50;
    if (/hemant/i.test(name) && langPrefix === "hi") score += 30;
  }

  if (/natural|neural|premium|online/i.test(name)) score += 8;
  return score;
}

function pickVoice(
  language: string,
  options?: { preferFemale?: boolean; preferred?: SpeechSynthesisVoice[] },
) {
  const voices =
    options?.preferred || (typeof window !== "undefined" ? window.speechSynthesis.getVoices() : []);
  if (!voices.length) return null;

  const langPrefix = language.slice(0, 2).toLowerCase();
  const preferFemale = Boolean(options?.preferFemale);

  const ranked = [...voices]
    .map((v) => ({ v, score: scoreVoice(v, langPrefix, preferFemale) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked[0]) return ranked[0].v;

  if (preferFemale) {
    return (
      voices.find(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) && FEMALE_VOICE_HINT.test(v.name),
      ) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
      voices.find((v) => v.default) ||
      voices[0] ||
      null
    );
  }

  return (
    voices.find(
      (v) => v.lang.toLowerCase().startsWith(langPrefix) && !FEMALE_VOICE_HINT.test(v.name),
    ) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  );
}

export class BrowserTextToSpeechProvider implements TextToSpeechProvider {
  readonly id = "browser-speech-synthesis";
  private utterance: SpeechSynthesisUtterance | null = null;
  private muted = false;
  private persona: VoicePersona | null = null;

  constructor(persona?: VoicePersona) {
    this.persona = persona || null;
  }

  setPersona(persona: VoicePersona) {
    this.persona = persona;
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.interrupt();
  }

  interrupt(): void {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    this.utterance = null;
  }

  async speak(
    text: string,
    config: VoiceConfig,
    handlers?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    if (!this.isSupported()) {
      handlers?.onError?.(new Error("Text-to-speech is not supported."));
      return;
    }
    if (this.muted) {
      handlers?.onEnd?.();
      return;
    }

    this.interrupt();
    const cleaned = prepareSpeechText(text);
    if (!cleaned) {
      handlers?.onEnd?.();
      return;
    }

    await new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(cleaned);
      this.utterance = utter;
      const langCode = config.language === "auto" ? "en" : config.language;
      const locale = mapSpeechLocale(langCode);
      const gender = this.persona
        ? resolveSpeechGender(this.persona, langCode)
        : langCode === "hi" || langCode === "mr"
          ? "female"
          : "male";
      const preferFemale = gender === "female";

      utter.lang = locale;
      utter.rate = config.rate ?? this.persona?.rate ?? 0.92;
      utter.pitch = preferFemale
        ? (config.pitch ?? 1.05)
        : (config.pitch ?? this.persona?.pitch ?? 0.85);

      const applyVoiceAndSpeak = () => {
        const v = pickVoice(locale, { preferFemale });
        if (v) utter.voice = v;
        window.speechSynthesis.speak(utter);
      };

      utter.onstart = () => handlers?.onStart?.();
      utter.onend = () => {
        this.utterance = null;
        handlers?.onEnd?.();
        resolve();
      };
      utter.onerror = () => {
        this.utterance = null;
        handlers?.onError?.(new Error("Speech playback failed."));
        resolve();
      };

      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) {
        window.speechSynthesis.onvoiceschanged = () => applyVoiceAndSpeak();
        setTimeout(applyVoiceAndSpeak, 250);
      } else {
        applyVoiceAndSpeak();
      }
    });
  }
}

export class HybridTextToSpeechProvider implements TextToSpeechProvider {
  readonly id = "hybrid-tts";
  private browser: BrowserTextToSpeechProvider;
  private audio: HTMLAudioElement | null = null;
  private muted = false;
  private objectUrl: string | null = null;
  private persona: VoicePersona;

  constructor(persona: VoicePersona) {
    this.persona = persona;
    this.browser = new BrowserTextToSpeechProvider(persona);
  }

  isSupported(): boolean {
    return this.browser.isSupported() || typeof Audio !== "undefined";
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.browser.setMuted(muted);
    if (muted) this.interrupt();
  }

  interrupt(): void {
    this.browser.interrupt();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  async speak(
    text: string,
    config: VoiceConfig,
    handlers?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    if (this.muted) {
      handlers?.onEnd?.();
      return;
    }

    const cleaned = prepareSpeechText(text);
    if (!cleaned) {
      handlers?.onEnd?.();
      return;
    }

    const voice = resolveServerVoice(this.persona, config.language);
    const gender = resolveSpeechGender(this.persona, config.language);

    try {
      const res = await fetch("/api/wisdom/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleaned,
          voice,
          language: config.language,
          gender,
        }),
      });

      if (res.ok && res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        this.interrupt();
        this.objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(this.objectUrl);
        this.audio = audio;
        handlers?.onStart?.();
        await new Promise<void>((resolve) => {
          audio.onended = () => {
            handlers?.onEnd?.();
            resolve();
          };
          audio.onerror = () => {
            handlers?.onError?.(new Error("Audio playback failed."));
            resolve();
          };
          void audio.play().catch(() => {
            handlers?.onError?.(new Error("Could not play audio."));
            resolve();
          });
        });
        return;
      }
    } catch {
      /* fall through to browser TTS */
    }

    await this.browser.speak(cleaned, config, handlers);
  }
}
