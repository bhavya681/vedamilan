"use client";

import type { TextToSpeechProvider, VoiceConfig } from "@/features/wisdom/voice/types";
import { mapSpeechLocale } from "@/features/wisdom/voice/types";
import type { VoicePersona } from "@/domain/wisdom/voice-persona";

function pickVoice(language: string, preferred?: SpeechSynthesisVoice[]) {
  const voices =
    preferred || (typeof window !== "undefined" ? window.speechSynthesis.getVoices() : []);
  const langPrefix = language.slice(0, 2).toLowerCase();
  return (
    voices.find(
      (v) => v.lang.toLowerCase().startsWith(langPrefix) && /natural|neural|premium/i.test(v.name),
    ) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  );
}

/** Browser speechSynthesis TTS — always available as fallback. */
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
    const cleaned = text
      .replace(/\*\*/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/\n{2,}/g, ". ")
      .trim();

    await new Promise<void>((resolve) => {
      const utter = new SpeechSynthesisUtterance(cleaned);
      this.utterance = utter;
      const locale = mapSpeechLocale(config.language === "auto" ? "en" : config.language);
      utter.lang = locale;
      utter.rate = config.rate ?? this.persona?.rate ?? 0.92;
      utter.pitch = config.pitch ?? this.persona?.pitch ?? 1;
      const voice = pickVoice(locale);
      if (voice) utter.voice = voice;

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

      // Chrome sometimes needs voices loaded asynchronously
      const speakNow = () => window.speechSynthesis.speak(utter);
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) {
        window.speechSynthesis.onvoiceschanged = () => {
          const v = pickVoice(locale);
          if (v) utter.voice = v;
          speakNow();
        };
        // Fallback if event never fires
        setTimeout(speakNow, 250);
      } else {
        speakNow();
      }
    });
  }
}

/**
 * Prefers server OpenAI TTS when available; falls back to browser synthesis.
 * Audio is played from a blob URL and never uploaded for storage.
 */
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

    const cleaned = text
      .replace(/\*\*/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/Vedic Wisdom provides educational[\s\S]*$/i, "")
      .trim()
      .slice(0, 3500);

    try {
      const res = await fetch("/api/wisdom/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleaned,
          voice: this.persona.serverVoice || "sage",
          language: config.language,
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
