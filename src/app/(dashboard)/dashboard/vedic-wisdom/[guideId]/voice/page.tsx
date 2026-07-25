"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, MessageSquareText, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import { VoiceOrbVisualizer } from "@/features/wisdom/voice/voice-visualizer";
import { useWisdomVoiceSession } from "@/features/wisdom/voice/use-wisdom-voice-session";
import { getWisdomGuide } from "@/domain/wisdom/guides";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import type { VoiceLanguageCode } from "@/features/wisdom/voice/types";

const LANGS: { code: VoiceLanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "es", label: "Español" },
  { code: "auto", label: "Auto" },
];

export default function WisdomVoicePage() {
  const params = useParams<{ guideId: string }>();
  const guide = getWisdomGuide(params.guideId);
  const [textDraft, setTextDraft] = useState("");
  const [started, setStarted] = useState(false);

  const voice = useWisdomVoiceSession({
    guideId: params.guideId,
    guideName: guide?.displayName || "Guide",
    autoListen: true,
  });

  useEffect(() => {
    // Prefer transcript open on desktop
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      voice.setShowTranscript(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!guide) {
    return (
      <div className="space-y-4 py-10">
        <p>Guide not found.</p>
        <Button asChild variant="outline">
          <Link href={routes.vedicWisdom}>Back to Vedic Wisdom</Link>
        </Button>
      </div>
    );
  }

  async function onStart() {
    await voice.startSession();
    setStarted(true);
  }

  async function onTextSubmit(e: FormEvent) {
    e.preventDefault();
    if (!textDraft.trim()) return;
    const value = textDraft;
    setTextDraft("");
    if (!started) {
      await voice.startSession();
      setStarted(true);
    }
    await voice.sendText(value);
  }

  const micDisabled =
    voice.state === "connecting" ||
    voice.state === "thinking" ||
    voice.state === "processing" ||
    voice.micMuted ||
    voice.state === "ended";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-6xl flex-col gap-6 pb-[max(1rem,env(safe-area-inset-bottom))] lg:flex-row lg:gap-10">
      <aside className="border-border/60 space-y-4 lg:w-72 lg:shrink-0 lg:border-r lg:pr-8">
        <Link
          href={`${routes.vedicWisdom}/${guide.id}`}
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          ← {guide.displayName}
        </Link>
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <WisdomPortrait guide={guide} size="lg" />
          <div>
            <h1 className="font-display text-2xl">{guide.displayName}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{guide.domain}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          AI Wisdom Guide inspired by the teachings of {guide.displayName}. This is an AI-generated
          voice designed to accompany the wisdom experience.
        </p>
        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Voice language
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => voice.setLanguage(l.code)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  voice.language === l.code
                    ? "border-foreground/30 bg-foreground text-background"
                    : "border-border/60 hover:border-foreground/25",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={voice.includeLifeContext}
            onChange={(e) => voice.setIncludeLifeContext(e.target.checked)}
          />
          <span className="text-muted-foreground">
            Personalized wisdom context (gentle profile cues)
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={voice.handsFree}
            onChange={(e) => voice.setHandsFree(e.target.checked)}
          />
          <span className="text-muted-foreground">Hands-free listening after each reply</span>
        </label>
        {voice.remainingSeconds != null ? (
          <p className="text-muted-foreground text-xs">
            About {Math.max(0, Math.floor(voice.remainingSeconds / 60))} min remaining today
          </p>
        ) : null}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>Continue with text</Link>
        </Button>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
          <WisdomPortrait guide={guide} size="xl" className="mb-4 hidden sm:flex" />
          <p className="font-display text-2xl sm:text-3xl">{guide.displayName}</p>
          <p className="text-muted-foreground mt-1 text-sm">{guide.domain}</p>
          <p className="text-muted-foreground mt-6 max-w-md text-sm" aria-live="polite">
            {voice.statusLabel}
          </p>
          {voice.partial ? (
            <p className="text-foreground/80 mt-3 max-w-lg text-sm italic">“{voice.partial}”</p>
          ) : null}
          <VoiceOrbVisualizer state={voice.state} className="mt-6" />

          {!started ? (
            <div className="mt-8 space-y-3">
              <Button
                size="lg"
                onClick={() => void onStart()}
                disabled={voice.state === "connecting"}
              >
                <Mic className="h-4 w-4" />
                Speak with {guide.displayName}
              </Button>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed">
                {voice.privacyNotice}
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => void voice.toggleMic()}
                disabled={micDisabled && voice.state !== "speaking"}
                aria-label={
                  voice.state === "listening"
                    ? "Stop listening"
                    : voice.state === "speaking"
                      ? "Interrupt and speak"
                      : "Start speaking"
                }
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full transition-colors",
                  voice.state === "listening"
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : voice.state === "speaking"
                      ? "bg-gold/20 text-foreground ring-gold/40 ring-2"
                      : "bg-foreground text-background hover:bg-foreground/90",
                  micDisabled && voice.state !== "speaking" && "opacity-50",
                )}
              >
                {voice.micMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => voice.setMicMuted(!voice.micMuted)}
                  aria-pressed={voice.micMuted}
                >
                  {voice.micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {voice.micMuted ? "Unmute mic" : "Mute mic"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => voice.setSpeakerMuted(!voice.speakerMuted)}
                  aria-pressed={voice.speakerMuted}
                >
                  {voice.speakerMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  Speaker
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => voice.setShowTranscript(!voice.showTranscript)}
                >
                  <MessageSquareText className="h-4 w-4" />
                  Transcript
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={voice.endSession}>
                  <PhoneOff className="h-4 w-4" />
                  End
                </Button>
              </div>
            </div>
          )}

          {voice.error ? (
            <div className="border-destructive/30 bg-destructive/5 mt-6 max-w-md rounded-xl border px-4 py-3 text-left text-sm">
              <p>{voice.error}</p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>Continue with text</Link>
              </Button>
            </div>
          ) : null}
        </div>

        {(voice.showTranscript || voice.messages.length > 0) && voice.showTranscript ? (
          <div className="border-border/60 max-h-64 space-y-3 overflow-y-auto border-t pt-4 lg:max-h-[40vh]">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              Live transcript
            </p>
            {voice.messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">Your conversation will appear here.</p>
            ) : (
              voice.messages.map((m) => (
                <div key={m.id} className={cn(m.role === "user" ? "text-right" : "text-left")}>
                  <p className="text-muted-foreground mb-1 text-[10px] uppercase">
                    {m.role === "user" ? "You" : guide.displayName} · {m.source}
                  </p>
                  {m.role === "assistant" ? (
                    <div className="border-border/50 inline-block max-w-[min(100%,36rem)] rounded-xl border px-3 py-2 text-left">
                      <GuruMarkdown content={m.content} />
                    </div>
                  ) : (
                    <p className="bg-primary text-primary-foreground inline-block max-w-[min(100%,36rem)] rounded-xl px-3 py-2 text-sm">
                      {m.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : null}

        <form
          onSubmit={onTextSubmit}
          className="border-border/60 mt-3 flex gap-2 border-t pt-3"
          aria-label="Type instead of speaking"
        >
          <input
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            placeholder="Or type your reflection…"
            className="border-border bg-card focus-visible:ring-ring min-h-11 flex-1 rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
          />
          <Button type="submit" size="icon" className="h-11 w-11" disabled={!textDraft.trim()}>
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </section>
    </div>
  );
}
