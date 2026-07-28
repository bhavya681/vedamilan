"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowUp, BookmarkPlus, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import {
  SageDiscourseShell,
  SageEmptyInvite,
  SageMessageTurn,
  SageOrnamentLine,
} from "@/features/wisdom/components/sage-discourse";
import { getWisdomGuide } from "@/domain/wisdom/guides";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  failed?: boolean;
};

export default function WisdomChatPage() {
  const params = useParams<{ guideId: string }>();
  const searchParams = useSearchParams();
  const guide = getWisdomGuide(params.guideId);
  const topicParam = searchParams.get("topic") || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(topicParam ? `I want to reflect on ${topicParam}.` : "");
  const [topic] = useState(topicParam);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [includeLifeContext, setIncludeLifeContext] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [reflectPrompt, setReflectPrompt] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

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

  async function send(message: string) {
    if (!guide || !message.trim() || busy) return;
    const userMsg: ChatMessage = { role: "user", content: message.trim() };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "", pending: true }]);
    setInput("");
    setBusy(true);
    setReflectPrompt(null);
    setSavedNote(null);
    try {
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guide.id,
          message: message.trim(),
          conversationId,
          topic: topic || undefined,
          includeLifeContext,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setConversationId(json.data.conversationId);
      setMessages((m) => {
        const next = m.filter((x) => !x.pending);
        return [...next, { role: "assistant", content: json.data.answer }];
      });
      setReflectPrompt("What part of this situation feels most difficult for you?");
    } catch {
      setMessages((m) => {
        const withoutPending = m.filter((x) => !x.pending);
        return [
          ...withoutPending,
          {
            role: "assistant",
            content: "Could not complete this reflection. Please try again.",
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

  async function saveInsight(content: string) {
    if (!guide) return;
    try {
      const res = await fetch("/api/wisdom/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guide.id,
          guideName: guide.displayName,
          category: "Other",
          insight: content,
          question: messages.filter((m) => m.role === "user").at(-1)?.content || "",
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setSavedNote("Saved to your Wisdom Journal");
    } catch {
      setSavedNote("Could not save — try again");
    }
  }

  const starterPrompts = topic
    ? [`Reflect with me on ${topic}`]
    : [
        "How should I handle conflict with care?",
        "How do I choose between two paths?",
        "What makes a strong marriage?",
      ];

  return (
    <div className="lg:dashboard-fill-h mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-3 sm:gap-4 md:gap-5 lg:flex-row lg:gap-8">
      <aside className="border-border/50 from-card/60 via-muted/20 relative shrink-0 space-y-3 overflow-hidden rounded-2xl border bg-gradient-to-b to-transparent p-3 sm:space-y-4 sm:rounded-3xl sm:p-4 lg:w-[17.5rem] lg:space-y-5 lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-7">
        <div className="pointer-events-none absolute inset-0 opacity-30 lg:hidden" aria-hidden>
          <div className="sage-discourse-wash absolute inset-0" />
        </div>
        <div className="relative space-y-3 sm:space-y-4 lg:space-y-5">
          <Link
            href={`${routes.vedicWisdom}/${guide.id}`}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            ← {guide.displayName}
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 lg:flex-col lg:items-start">
            <div className="relative shrink-0">
              <div className="from-gold/25 absolute -inset-2 rounded-full bg-gradient-to-b to-transparent blur-sm" />
              <WisdomPortrait
                guide={guide}
                size="lg"
                className="ring-gold/30 shadow-gold relative !h-12 !w-12 ring-2 sm:!h-16 sm:!w-16 lg:!h-28 lg:!w-28"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gold/80 text-[10px] font-medium tracking-[0.16em] uppercase">
                {guide.role}
              </p>
              <h1 className="font-display text-lg leading-tight tracking-tight sm:text-xl lg:text-2xl">
                {guide.displayName}
              </h1>
              <p className="text-muted-foreground mt-0.5 hidden text-sm leading-snug sm:block">
                {guide.domain}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-gold/25 shrink-0 lg:hidden"
            >
              <Link
                href={`${routes.vedicWisdom}/${guide.id}/voice`}
                aria-label={`Speak with ${guide.displayName}`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Speak</span>
              </Link>
            </Button>
          </div>
          <SageOrnamentLine className="hidden lg:flex" />
          <p className="text-muted-foreground hidden text-xs leading-relaxed lg:block">
            AI guide inspired by teachings traditionally associated with {guide.displayName}. Ask a
            real question — answers should match what you asked.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gold/25 hidden w-full lg:inline-flex"
          >
            <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>
              <Mic className="h-3.5 w-3.5" />
              Speak with {guide.displayName}
            </Link>
          </Button>
          <div className="hidden lg:block">
            <p className="text-muted-foreground mb-2 text-[11px] font-medium tracking-[0.14em] uppercase">
              Contemplations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="border-border/55 hover:border-gold/40 hover:bg-gold/8 rounded-full border px-2.5 py-1 text-xs transition-colors"
                  onClick={() => setInput(`Help me reflect on ${t.toLowerCase()}.`)}
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
            {guide.primarySources.map((s) => (
              <p key={s} className="text-muted-foreground/90 text-xs leading-relaxed">
                <span className="text-gold/60 mr-1">·</span>
                {s}
              </p>
            ))}
          </div>
          <label className="border-border/45 bg-card/40 hidden cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-xs leading-relaxed lg:flex">
            <input
              type="checkbox"
              className="accent-gold mt-0.5"
              checked={includeLifeContext}
              onChange={(e) => setIncludeLifeContext(e.target.checked)}
            />
            <span className="text-muted-foreground">
              Include gentle profile context for personalized reflection (never used for destiny
              claims).
            </span>
          </label>
        </div>
      </aside>

      <SageDiscourseShell className="border-border/50 shadow-soft dashboard-fill-h flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border sm:rounded-[1.75rem] lg:h-full lg:max-h-none">
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-2 sm:px-6 sm:pt-5">
          {messages.length === 0 ? (
            <SageEmptyInvite
              guide={guide}
              prompts={starterPrompts}
              onPrompt={(q) => void send(q)}
            />
          ) : null}

          {messages.map((m, i) => (
            <SageMessageTurn
              key={`${m.role}-${i}`}
              role={m.role}
              guide={guide}
              content={m.content}
              pending={m.pending}
              failed={m.failed}
              footer={
                m.role === "assistant" && !m.failed && !m.pending ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-gold/30 h-8 text-xs"
                    onClick={() => void saveInsight(m.content)}
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    Save insight
                  </Button>
                ) : null
              }
            />
          ))}

          {reflectPrompt ? (
            <div className="border-gold/15 from-gold/5 mt-4 space-y-3 rounded-2xl border bg-gradient-to-br to-transparent px-4 py-4">
              <p className="text-gold/80 text-[10px] font-medium tracking-[0.18em] uppercase">
                Continue the discourse
              </p>
              <p className="font-display text-lg leading-snug sm:text-xl">{reflectPrompt}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-gold/30"
                onClick={() => {
                  setInput(reflectPrompt);
                  setReflectPrompt("What outcome would align with your values?");
                }}
              >
                Offer a reply
              </Button>
            </div>
          ) : null}

          {savedNote ? (
            <p className="text-muted-foreground pt-2 text-xs tracking-wide">{savedNote}</p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="border-border/40 from-card/90 to-card/70 relative shrink-0 border-t bg-gradient-to-t px-3 pt-2.5 pb-2.5 backdrop-blur-md sm:px-5 sm:pt-3 sm:pb-3"
        >
          <div className="flex items-end gap-2.5">
            <label className="sr-only" htmlFor="wisdom-input">
              Your question
            </label>
            <div
              className={cn(
                "border-border/60 focus-within:border-gold/45 focus-within:ring-gold/20",
                "bg-background/80 shadow-soft flex flex-1 items-end rounded-2xl border focus-within:ring-2",
              )}
            >
              <textarea
                id="wisdom-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Offer your question with sincerity…"
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
            {WISDOM_AI_DISCLAIMER}
          </p>
        </form>
      </SageDiscourseShell>
    </div>
  );
}
