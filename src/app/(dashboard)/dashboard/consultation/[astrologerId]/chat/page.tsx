"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowUp, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AstrologerPortrait } from "@/features/consultation/components/astrologer-portrait";
import {
  SageDiscourseShell,
  SageEmptyInvite,
  SageMessageTurn,
  SageOrnamentLine,
} from "@/features/wisdom/components/sage-discourse";
import { getVirtualAstrologer } from "@/domain/consultation/virtual-astrologers";
import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { consultationPaths, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  failed?: boolean;
};

export default function ConsultationChatPage() {
  const params = useParams<{ astrologerId: string }>();
  const searchParams = useSearchParams();
  const astrologer = getVirtualAstrologer(params.astrologerId);
  const topicParam = searchParams.get("topic") || "";

  const guideLike = useMemo(
    () =>
      astrologer
        ? {
            id: astrologer.id,
            displayName: astrologer.displayName,
            monogram: astrologer.monogram,
            accent: astrologer.accent,
            shortPhilosophy: astrologer.shortBlurb,
            gender: astrologer.gender,
          }
        : null,
    [astrologer],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(
    topicParam ? `Please advise on ${topicParam} from my kundli.` : "",
  );
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

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

  async function send(message: string) {
    if (!astrologer || !message.trim() || busy) return;
    setMessages((m) => [
      ...m,
      { role: "user", content: message.trim() },
      { role: "assistant", content: "", pending: true },
    ]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/consultation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologerId: astrologer.id,
          message: message.trim(),
          conversationId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setConversationId(json.data.conversationId);
      setMessages((m) => {
        const next = m.filter((x) => !x.pending);
        return [...next, { role: "assistant", content: json.data.answer }];
      });
    } catch {
      setMessages((m) => {
        const withoutPending = m.filter((x) => !x.pending);
        return [
          ...withoutPending,
          {
            role: "assistant",
            content: "Could not complete this consultation. Please try again.",
            failed: true,
          },
        ];
      });
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await send(input);
  }

  const starterPrompts = topicParam
    ? [`Advise me on ${topicParam}`]
    : [
        "What does my current Mahadasha mean for career?",
        "Which remedies suit my chart right now?",
        "How do Venus and the 7th house show in relationships for me?",
      ];

  return (
    <div className="lg:dashboard-fill-h mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-3 sm:gap-4 md:gap-5 lg:flex-row lg:gap-8">
      <aside className="border-border/50 from-card/60 via-muted/20 relative shrink-0 space-y-3 overflow-hidden rounded-2xl border bg-gradient-to-b to-transparent p-3 sm:space-y-4 sm:rounded-3xl sm:p-4 lg:w-[17.5rem] lg:space-y-5 lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-7">
        <div className="relative space-y-3 sm:space-y-4 lg:space-y-5">
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
                className="ring-gold/30 shadow-gold relative !h-12 !w-12 ring-2 sm:!h-16 sm:!w-16 lg:!h-28 lg:!w-28"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gold/80 text-[10px] font-medium tracking-[0.16em] uppercase">
                {astrologer.title}
              </p>
              <h1 className="font-display text-lg leading-tight tracking-tight sm:text-xl lg:text-2xl">
                {astrologer.displayName}
              </h1>
              <p className="text-muted-foreground mt-0.5 hidden text-sm leading-snug sm:block">
                {astrologer.tradition}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-gold/25 shrink-0 lg:hidden"
            >
              <Link href={consultationPaths.voice(astrologer.id)}>
                <Mic className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Speak</span>
              </Link>
            </Button>
          </div>
          <SageOrnamentLine className="hidden lg:flex" />
          <p className="text-muted-foreground hidden text-xs leading-relaxed lg:block">
            AI astrologer inspired by {astrologer.tradition}. Answers use your stored kundli and
            classical remedy themes.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gold/25 hidden w-full lg:inline-flex"
          >
            <Link href={consultationPaths.voice(astrologer.id)}>
              <Mic className="h-3.5 w-3.5" />
              Speak with {astrologer.displayName}
            </Link>
          </Button>
          <div className="hidden lg:block">
            <p className="text-muted-foreground mb-2 text-[11px] font-medium tracking-[0.14em] uppercase">
              Topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {astrologer.topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="border-border/55 hover:border-gold/40 hover:bg-gold/8 rounded-full border px-2.5 py-1 text-xs transition-colors"
                  onClick={() => setInput(`Please advise on ${t.toLowerCase()} from my kundli.`)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden space-y-1.5 lg:block">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
              Sources
            </p>
            {astrologer.primarySources.map((s) => (
              <p key={s} className="text-muted-foreground/90 text-xs leading-relaxed">
                <span className="text-gold/60 mr-1">·</span>
                {s}
              </p>
            ))}
          </div>
        </div>
      </aside>

      <SageDiscourseShell className="border-border/50 shadow-soft dashboard-fill-h flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border sm:rounded-[1.75rem] lg:h-full lg:max-h-none">
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-2 sm:px-6 sm:pt-5">
          {messages.length === 0 ? (
            <SageEmptyInvite
              guide={guideLike}
              prompts={starterPrompts}
              onPrompt={(q) => void send(q)}
            />
          ) : null}

          {messages.map((m, i) => (
            <SageMessageTurn
              key={`${m.role}-${i}`}
              role={m.role}
              guide={guideLike}
              content={m.content}
              pending={m.pending}
              failed={m.failed}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="border-border/40 from-card/90 to-card/70 relative shrink-0 border-t bg-gradient-to-t px-3 pt-2.5 pb-2.5 backdrop-blur-md sm:px-5 sm:pt-3 sm:pb-3"
        >
          <div className="flex items-end gap-2.5">
            <label className="sr-only" htmlFor="consultation-input">
              Your question
            </label>
            <div
              className={cn(
                "border-border/60 focus-within:border-gold/45 focus-within:ring-gold/20",
                "bg-background/80 shadow-soft flex flex-1 items-end rounded-2xl border focus-within:ring-2",
              )}
            >
              <textarea
                id="consultation-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your kundli, timing, or remedies…"
                className="placeholder:text-muted-foreground/70 min-h-[2.75rem] flex-1 resize-none bg-transparent px-3.5 py-2.5 text-sm outline-none"
                disabled={busy}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="shadow-gold h-11 w-11 shrink-0 rounded-2xl"
              disabled={busy || !input.trim()}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-[10px] leading-relaxed sm:mt-2.5 sm:line-clamp-none">
            {VEDIC_AI_DISCLAIMER}
          </p>
        </form>
      </SageDiscourseShell>
    </div>
  );
}
