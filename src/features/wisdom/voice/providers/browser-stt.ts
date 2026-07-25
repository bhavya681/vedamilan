"use client";

import type { SpeechToTextProvider, VoiceLanguageCode } from "@/features/wisdom/voice/types";
import { mapSpeechLocale } from "@/features/wisdom/voice/types";

type RecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: RecognitionCtor;
      webkitSpeechRecognition?: RecognitionCtor;
    };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/** Browser SpeechRecognition STT — Chrome, Edge, Safari (webkit). */
export class BrowserSpeechToTextProvider implements SpeechToTextProvider {
  readonly id = "browser-speech-recognition";
  private recognition: SpeechRecognition | null = null;
  private stoppedIntentionally = false;

  isSupported(): boolean {
    return Boolean(getRecognitionCtor());
  }

  start(options: {
    language: VoiceLanguageCode;
    onPartial?: (text: string) => void;
    onFinal: (text: string) => void;
    onError?: (error: Error) => void;
    onEnd?: () => void;
  }): void {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      options.onError?.(new Error("Speech recognition is not supported in this browser."));
      return;
    }

    this.abort();
    this.stoppedIntentionally = false;
    const recognition = new Ctor();
    this.recognition = recognition;
    recognition.lang = mapSpeechLocale(options.language);
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript || "";
        if (result?.isFinal) finalText += transcript;
        else interim += transcript;
      }
      if (interim) options.onPartial?.(interim.trim());
      if (finalText.trim()) options.onFinal(finalText.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        options.onEnd?.();
        return;
      }
      if (event.error === "not-allowed") {
        options.onError?.(new Error("Microphone permission denied."));
        return;
      }
      options.onError?.(new Error(event.error || "Speech recognition failed."));
    };

    recognition.onend = () => {
      if (!this.stoppedIntentionally) options.onEnd?.();
    };

    try {
      recognition.start();
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error("Could not start microphone."));
    }
  }

  stop(): void {
    this.stoppedIntentionally = true;
    try {
      this.recognition?.stop();
    } catch {
      /* ignore */
    }
    this.recognition = null;
  }

  abort(): void {
    this.stoppedIntentionally = true;
    try {
      this.recognition?.abort();
    } catch {
      /* ignore */
    }
    this.recognition = null;
  }
}
