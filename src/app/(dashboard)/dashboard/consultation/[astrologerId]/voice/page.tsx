"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, MessageSquareText, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AstrologerPortrait } from "@/features/consultation/components/astrologer-portrait";
import {
  SageDiscourseShell,
  SageMessageTurn,
  SageOrnamentLine,
} from "@/features/wisdom/components/sage-discourse";
import { VoiceOrbVisualizer } from "@/features/wisdom/voice/voice-visualizer";
import { useWisdomVoiceSession } from "@/features/wisdom/voice/use-wisdom-voice-session";
import { getVirtualAstrologer } from "@/domain/consultation/virtual-astrologers";
import { consultationPaths, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import type { VoiceLanguageCode } from "@/features/wisdom/voice/types";

const LANGS: { code: VoiceLanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "es", label: "Español" },
  { code: "auto", label: "Auto" },
];

export default function ConsultationVoicePage() {
  const params = useParams<{ astrologerId: string }>();
  const astrologer = getVirtualAstrologer(params.astrologerId);
  const [textDraft, setTextDraft] = useState("");
  const [started, setStarted] = useState(false);

  const guideLike = useMemo(
    () =>
      astrologer
        ? {
            id: astrologer.id,
            displayName: astrologer.displayName,
            monogram: astrologer.monogram,
            accent: astrologer.accent,
          }
        : null,
    [astrologer],
  );

  const voice = useWisdomVoiceSession({
    guideId: params.astrologerId,
    guideName: astrologer?.displayName || "Astrologer",
    autoListen: true,
    sessionApi: "/api/consultation/voice/session",
    idKey: "astrologerId",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      voice.setShowTranscript(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!astrologer || !guideLike) {
    return (
      <div className="space-y-4 py-10">
        <p>Astrologer not found.</p>
        <Button asChild variant="outline">
          <Link href={routes.consultation}>Back to Consultation</Link>
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
    <div className="lg:dashboard-fill-h mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-3 sm:gap-4 lg:flex-row lg:gap-8">
      <aside className="border-border/50 shrink-0 space-y-3 lg:w-72 lg:space-y-4 lg:border-r lg:pr-7">
        <Link
          href={consultationPaths.astrologer(astrologer.id)}
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          ← {astrologer.displayName}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4 lg:flex-col lg:items-start">
          <div className="relative shrink-0">
            <div className="from-gold/25 absolute -inset-2 rounded-full bg-gradient-to-b to-transparent blur-sm" />
            <AstrologerPortrait
              astrologer={astrologer}
              size="lg"
              className="ring-gold/30 shadow-gold relative !h-12 !w-12 ring-2 sm:!h-16 sm:!w-16 lg:!h-24 lg:!w-24"
            />
          </div>
          <div className="min-w-0">
            <p className="text-gold/80 text-[10px] font-medium tracking-[0.16em] uppercase">
              Voice consultation
            </p>
            <h1 className="font-display text-lg tracking-tight sm:text-xl lg:text-2xl">
              {astrologer.displayName}
            </h1>
            <p className="text-muted-foreground mt-0.5 hidden text-sm sm:block">
              {astrologer.tradition}
            </p>
          </div>
        </div>
        <SageOrnamentLine className="hidden lg:flex" />
        <p className="text-muted-foreground hidden text-xs leading-relaxed lg:block">
          AI voice consultation inspired by {astrologer.tradition}. Chart facts come from your
          stored kundli — not invented speech.
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
        <div className="hidden space-y-3 lg:block">
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
            <Link href={consultationPaths.chat(astrologer.id)}>Continue with text</Link>
          </Button>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full lg:hidden">
          <Link href={consultationPaths.chat(astrologer.id)}>Continue with text</Link>
        </Button>
      </aside>

      <SageDiscourseShell className="border-border/50 shadow-soft dashboard-fill-h flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border sm:rounded-[1.75rem] lg:h-full lg:max-h-none">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-4 text-center sm:px-6 sm:py-6">
          <AstrologerPortrait
            astrologer={astrologer}
            size="xl"
            className="ring-gold/30 shadow-gold mb-5 hidden ring-2 sm:flex"
          />
          <p className="text-gold/80 font-display text-xs tracking-[0.28em] uppercase">
            Speak with the astrologer
          </p>
          <p className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">
            {astrologer.displayName}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{astrologer.tradition}</p>
          <SageOrnamentLine className="mx-auto mt-5 w-full max-w-xs" />
          <p className="text-muted-foreground mt-5 max-w-md text-sm" aria-live="polite">
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
                Speak with {astrologer.displayName}
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
                <Link href={consultationPaths.chat(astrologer.id)}>Continue with text</Link>
              </Button>
            </div>
          ) : null}
        </div>

        {(voice.showTranscript || voice.messages.length > 0) && voice.showTranscript ? (
          <div className="border-border/40 max-h-64 space-y-1 overflow-y-auto border-t px-4 pt-4 pb-2 sm:px-5 lg:max-h-[40vh]">
            <p className="text-gold/80 mb-2 text-[10px] font-medium tracking-[0.18em] uppercase">
              Live consultation
            </p>
            {voice.messages.length === 0 ? (
              <p className="text-muted-foreground font-display text-sm italic">
                Your conversation will appear here as you speak.
              </p>
            ) : (
              voice.messages.map((m) => (
                <SageMessageTurn key={m.id} role={m.role} guide={guideLike} content={m.content} />
              ))
            )}
          </div>
        ) : null}

        <form
          onSubmit={onTextSubmit}
          className="border-border/40 from-card/90 to-card/70 mt-auto flex gap-2.5 border-t bg-gradient-to-t px-4 pt-3 pb-3 backdrop-blur-md sm:px-5"
          aria-label="Type instead of speaking"
        >
          <input
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            placeholder="Or type your astrology question…"
            className="border-border/60 bg-background/80 focus-visible:border-gold/45 focus-visible:ring-gold/20 min-h-11 flex-1 rounded-2xl border px-3.5 text-sm outline-none focus-visible:ring-2"
          />
          <Button
            type="submit"
            size="icon"
            className="shadow-gold h-11 w-11 rounded-2xl"
            disabled={!textDraft.trim()}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </SageDiscourseShell>
    </div>
  );
}
