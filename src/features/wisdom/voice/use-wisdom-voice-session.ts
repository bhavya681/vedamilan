"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getVoicePersona, VOICE_PRIVACY_NOTICE } from "@/domain/wisdom/voice-persona";
import { BrowserSpeechToTextProvider } from "@/features/wisdom/voice/providers/browser-stt";
import { HybridTextToSpeechProvider } from "@/features/wisdom/voice/providers/browser-tts";
import {
  VOICE_STATE_COPY,
  type TranscriptMessage,
  type VoiceLanguageCode,
  type VoiceSessionState,
} from "@/features/wisdom/voice/types";

type Options = {
  guideId: string;
  guideName: string;
  autoListen?: boolean;
};

let msgId = 0;
function nextId() {
  msgId += 1;
  return `vm_${Date.now()}_${msgId}`;
}

export function useWisdomVoiceSession({ guideId, guideName, autoListen = true }: Options) {
  const [state, setState] = useState<VoiceSessionState>("idle");
  const [language, setLanguage] = useState<VoiceLanguageCode>("en");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [includeLifeContext, setIncludeLifeContext] = useState(false);
  const [handsFree, setHandsFree] = useState(autoListen);

  const sttRef = useRef(new BrowserSpeechToTextProvider());
  const persona = useMemo(() => getVoicePersona(guideId), [guideId]);
  const ttsRef = useRef(new HybridTextToSpeechProvider(persona));
  const listenStartedAt = useRef(0);
  const stateRef = useRef(state);
  const sessionIdRef = useRef(sessionId);
  const conversationIdRef = useRef(conversationId);
  const languageRef = useRef(language);
  const handsFreeRef = useRef(handsFree);
  const micMutedRef = useRef(micMuted);
  const includeLifeContextRef = useRef(includeLifeContext);
  const beginListeningRef = useRef<() => void>(() => undefined);
  const [sttSupported, setSttSupported] = useState(false);

  useEffect(() => {
    stateRef.current = state;
    sessionIdRef.current = sessionId;
    conversationIdRef.current = conversationId;
    languageRef.current = language;
    handsFreeRef.current = handsFree;
    micMutedRef.current = micMuted;
    includeLifeContextRef.current = includeLifeContext;
  }, [state, sessionId, conversationId, language, handsFree, micMuted, includeLifeContext]);

  useEffect(() => {
    setSttSupported(sttRef.current.isSupported());
  }, []);

  useEffect(() => {
    ttsRef.current = new HybridTextToSpeechProvider(persona);
  }, [persona]);

  useEffect(() => {
    ttsRef.current.setMuted(speakerMuted);
  }, [speakerMuted]);

  const statusLabel = useMemo(() => {
    if (state === "speaking") return `${guideName} is responding…`;
    return VOICE_STATE_COPY[state];
  }, [state, guideName]);

  const endSession = useCallback(() => {
    sttRef.current.abort();
    ttsRef.current.interrupt();
    setState("ended");
    setPartial("");
  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    setState("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setState("permission_required");
      setError("Microphone access is required for voice wisdom.");
      return false;
    }

    if (!sttRef.current.isSupported()) {
      setState("error");
      setError("Voice input is not supported in this browser. Continue with text instead.");
      return false;
    }

    try {
      const res = await fetch("/api/wisdom/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId, language: languageRef.current }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Could not start voice session");
      setSessionId(json.data.sessionId);
      setRemainingSeconds(json.data.remainingSeconds ?? null);
      setState("idle");
      return true;
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Could not start voice session");
      return false;
    }
  }, [guideId]);

  const speakAnswer = useCallback(
    async (text: string) => {
      setState("speaking");
      await ttsRef.current.speak(
        text,
        {
          language: languageRef.current,
          rate: persona.rate,
          pitch: persona.pitch,
        },
        {
          onEnd: () => {
            if (stateRef.current === "ended") return;
            setState("idle");
            if (handsFreeRef.current && !micMutedRef.current) {
              setTimeout(() => {
                if (stateRef.current === "idle" || stateRef.current === "interrupted") {
                  beginListeningRef.current();
                }
              }, 350);
            }
          },
          onError: () => setState("idle"),
        },
      );
    },
    [persona.pitch, persona.rate],
  );

  const sendTurn = useCallback(
    async (text: string, source: "voice" | "text", speechSeconds = 8) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "user", content: trimmed, source, createdAt: Date.now() },
      ]);
      setPartial("");
      setState("thinking");
      try {
        const res = await fetch("/api/wisdom/voice/session", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guideId,
            message: trimmed,
            conversationId: conversationIdRef.current,
            sessionId: sessionIdRef.current,
            language: languageRef.current,
            includeLifeContext: includeLifeContextRef.current,
            speechSeconds,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Reflection failed");
        setConversationId(json.data.conversationId);
        setRemainingSeconds(json.data.remainingSeconds ?? null);
        const answer = json.data.answer as string;
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "assistant",
            content: answer,
            source: "voice",
            createdAt: Date.now(),
          },
        ]);
        await speakAnswer(answer);
      } catch (e) {
        setState("error");
        setError(e instanceof Error ? e.message : "Could not complete reflection");
      }
    },
    [guideId, speakAnswer],
  );

  const beginListening = useCallback(() => {
    if (micMutedRef.current) return;
    ttsRef.current.interrupt();
    if (stateRef.current === "speaking") setState("interrupted");
    else setState("listening");
    setPartial("");
    listenStartedAt.current = Date.now();
    sttRef.current.abort();
    sttRef.current.start({
      language: languageRef.current,
      onPartial: (t) => setPartial(t),
      onFinal: (t) => {
        setState("processing");
        const secs = Math.max(2, Math.round((Date.now() - listenStartedAt.current) / 1000));
        void sendTurn(t, "voice", secs);
      },
      onError: (err) => {
        if (/permission/i.test(err.message)) setState("permission_required");
        else setState("error");
        setError(err.message);
      },
      onEnd: () => {
        if (stateRef.current === "listening") setState("idle");
      },
    });
  }, [sendTurn]);

  useEffect(() => {
    beginListeningRef.current = beginListening;
  }, [beginListening]);

  const toggleMic = useCallback(async () => {
    if (stateRef.current === "ended") return;
    if (!sessionIdRef.current) {
      const ok = await startSession();
      if (!ok) return;
    }
    if (stateRef.current === "listening") {
      sttRef.current.stop();
      setState("idle");
      return;
    }
    if (stateRef.current === "speaking") {
      ttsRef.current.interrupt();
      setState("interrupted");
      beginListening();
      return;
    }
    beginListening();
  }, [beginListening, startSession]);

  const sendText = useCallback(
    async (text: string) => {
      if (!sessionIdRef.current) {
        const ok = await startSession();
        if (!ok) return;
      }
      ttsRef.current.interrupt();
      sttRef.current.abort();
      await sendTurn(text, "text", 3);
    },
    [sendTurn, startSession],
  );

  return {
    state,
    statusLabel,
    language,
    setLanguage,
    messages,
    partial,
    error,
    remainingSeconds,
    speakerMuted,
    setSpeakerMuted,
    micMuted,
    setMicMuted,
    showTranscript,
    setShowTranscript,
    includeLifeContext,
    setIncludeLifeContext,
    handsFree,
    setHandsFree,
    privacyNotice: VOICE_PRIVACY_NOTICE,
    sttSupported,
    startSession,
    toggleMic,
    sendText,
    endSession,
    interruptSpeaking: () => {
      ttsRef.current.interrupt();
      setState("interrupted");
      beginListening();
    },
  };
}
