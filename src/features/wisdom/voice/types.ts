export type VoiceSessionState =
  | "idle"
  | "connecting"
  | "permission_required"
  | "listening"
  | "processing"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "paused"
  | "error"
  | "ended";

export type VoiceLanguageCode = "en" | "hi" | "mr" | "es" | "auto";

export type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source: "voice" | "text";
  createdAt: number;
};

export type AudioInput = {
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  mimeType?: string;
};

export type TranscriptResult = {
  text: string;
  isFinal: boolean;
  language?: string;
};

export type VoiceConfig = {
  language: VoiceLanguageCode;
  rate?: number;
  pitch?: number;
  serverVoice?: string;
};

export interface SpeechToTextProvider {
  readonly id: string;
  isSupported(): boolean;
  start(options: {
    language: VoiceLanguageCode;
    onPartial?: (text: string) => void;
    onFinal: (text: string) => void;
    onError?: (error: Error) => void;
    onEnd?: () => void;
  }): void;
  stop(): void;
  abort(): void;
}

export interface TextToSpeechProvider {
  readonly id: string;
  isSupported(): boolean;
  speak(
    text: string,
    config: VoiceConfig,
    handlers?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void>;
  interrupt(): void;
  setMuted(muted: boolean): void;
}

export const VOICE_STATE_COPY: Record<VoiceSessionState, string> = {
  idle: "Tap the microphone and begin.",
  connecting: "Preparing your wisdom conversation…",
  permission_required: "Microphone access is needed for voice wisdom.",
  listening: "Listening…",
  processing: "I heard you.",
  thinking: "Reflecting…",
  speaking: "Responding…",
  interrupted: "Listening to you…",
  paused: "Paused.",
  error: "Something went wrong — you can continue with text.",
  ended: "Conversation ended.",
};

export function mapSpeechLocale(language: VoiceLanguageCode): string {
  switch (language) {
    case "hi":
      return "hi-IN";
    case "mr":
      return "mr-IN";
    case "es":
      return "es-ES";
    case "auto":
      return "en-IN";
    default:
      return "en-IN";
  }
}
