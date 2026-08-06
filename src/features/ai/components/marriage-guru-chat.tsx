"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { Badge } from "@/components/ui/badge";
import {
  MARRIAGE_GURU_NAME,
  MARRIAGE_GURU_TAGLINE,
  AiGuruAvatar,
} from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date;
};

type MarriageWindow = {
  label: string;
  window: string;
  score: number;
  reason?: string;
};

type Bundle = {
  openingMessage: string;
  suggestedPrompts: string[];
  marriageWindows: MarriageWindow[];
  spouseTendencies?: {
    marriagePathLabel?: string;
    spouseOriginLabel?: string;
  } | null;
  marryNow?: {
    score: number;
    title: string;
    reason: string;
  } | null;
  currentMaha?: string | null;
  currentAntar?: string | null;
  hasChart: boolean;
  disclaimer: string;
};

function Bubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? <AiGuruAvatar size="sm" className="border-rose/30 mt-0.5" /> : null}
      <div
        className={cn(
          "max-w-[min(100%,20rem)] px-3 py-2 text-[13px] leading-relaxed sm:max-w-[min(100%,28rem)] sm:px-3.5 sm:py-2.5 sm:text-sm md:max-w-[min(100%,36rem)]",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
            : "border-border/60 bg-card rounded-2xl rounded-bl-md border",
        )}
      >
        {!isUser ? (
          <p className="text-rose mb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
            {MARRIAGE_GURU_NAME}
          </p>
        ) : null}
        <GuruMarkdown content={content} tone={isUser ? "user" : "assistant"} />
      </div>
    </div>
  );
}

export function MarriageGuruChat({ bundle }: { bundle: Bundle | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bundle?.openingMessage) {
      setMessages([{ role: "assistant", content: bundle.openingMessage, createdAt: new Date() }]);
    }
  }, [bundle?.openingMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError(null);
    setBusy(true);
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: message, createdAt: new Date() }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "MARRIAGE_GURU",
          message,
          conversationId,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || `${MARRIAGE_GURU_NAME} could not respond right now`);
        return;
      }
      setConversationId(json.data.conversationId);
      const answer =
        typeof json.data.answer === "string" && json.data.answer.trim()
          ? json.data.answer
          : "I could not form a short answer just now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, createdAt: new Date() },
      ]);
    } catch {
      setError("Connection issue — please try again");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(draft);
  }

  const userAsked = messages.some((m) => m.role === "user");
  const prompts = bundle?.suggestedPrompts || [];

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.75fr)] lg:gap-5">
      <section className="border-border/70 bg-card shadow-soft flex min-h-[min(52dvh,28rem)] flex-col overflow-hidden rounded-2xl border sm:min-h-[min(58dvh,32rem)]">
        <header className="border-border/50 shrink-0 border-b px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3">
            <AiGuruAvatar size="lg" className="border-rose/35" />
            <div className="min-w-0">
              <h2 className="font-display text-xl leading-none">{MARRIAGE_GURU_NAME}</h2>
              <p className="text-muted-foreground mt-1 truncate text-xs">
                {bundle?.currentMaha
                  ? `Dasha · ${bundle.currentMaha}${bundle.currentAntar ? ` / ${bundle.currentAntar}` : ""}`
                  : MARRIAGE_GURU_TAGLINE}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-3 px-2.5 py-3 sm:space-y-4 sm:px-4 sm:py-4">
            {messages.map((m, idx) => (
              <Bubble
                key={`${m.role}-${idx}-${String(m.createdAt)}`}
                role={m.role}
                content={m.content}
              />
            ))}
            {busy ? (
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <AiGuruAvatar size="sm" busy className="border-rose/30" />
                <span>{MARRIAGE_GURU_NAME} is thinking…</span>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {error ? <p className="text-destructive px-3 pb-2 text-xs sm:px-4">{error}</p> : null}

        <div className="border-border/50 shrink-0 border-t px-2.5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-2.5 sm:pb-3">
          {!userAsked && prompts.length ? (
            <div className="scrollbar-hidden mb-2 flex gap-2 overflow-x-auto pb-0.5">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={busy}
                  onClick={() => void sendMessage(prompt)}
                  className="border-border/60 bg-background hover:border-rose/35 hover:bg-rose/5 max-w-[14rem] shrink-0 rounded-xl border px-3 py-1.5 text-left text-[11px] leading-snug transition disabled:opacity-50 sm:max-w-none"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
          <form
            onSubmit={onSubmit}
            className="border-border/60 bg-background focus-within:border-rose/35 flex items-end gap-1.5 rounded-xl border p-1 sm:gap-2 sm:p-1.5"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about marriage timing, spouse themes, manglik…"
              rows={1}
              disabled={busy}
              className="placeholder:text-muted-foreground/70 max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm focus-visible:outline-none sm:min-h-[42px] sm:px-3 sm:py-2.5"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={busy || !draft.trim()}
              className="mb-0.5 h-9 w-9 shrink-0"
              aria-label="Send"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </section>

      <aside className="grid min-w-0 gap-3 sm:gap-4">
        {bundle?.marryNow ? (
          <GlassCard className="space-y-2 p-4">
            <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
              <Heart className="h-3.5 w-3.5" />
              Marry-now read
            </p>
            <p className="font-display text-lg">{bundle.marryNow.title}</p>
            <Badge variant="secondary" className="tabular-nums">
              {bundle.marryNow.score}/100
            </Badge>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {bundle.marryNow.reason}
            </p>
          </GlassCard>
        ) : null}

        {bundle?.spouseTendencies ? (
          <GlassCard className="space-y-2 p-4">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
              Chart leanings
            </p>
            <p className="text-sm font-medium">{bundle.spouseTendencies.marriagePathLabel}</p>
            <p className="text-muted-foreground text-xs">
              {bundle.spouseTendencies.spouseOriginLabel}
            </p>
          </GlassCard>
        ) : null}

        <GlassCard className="space-y-3 p-4">
          <p className="font-display text-base">Marriage windows</p>
          <ul className="space-y-2 text-sm">
            {(bundle?.marriageWindows || []).slice(0, 4).map((w, i) => (
              <li
                key={`${w.label}-${i}`}
                className="border-border/40 rounded-lg border px-2.5 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium">{w.label}</p>
                  <Badge variant="outline" className="shrink-0 text-[10px] tabular-nums">
                    {w.score}%
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-[11px]">{w.window}</p>
              </li>
            ))}
            {!bundle?.marriageWindows?.length ? (
              <p className="text-muted-foreground text-xs">
                Generate kundli and dasha to unlock marriage windows.
              </p>
            ) : null}
          </ul>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={routes.marriageTiming}>Full marriage timing</Link>
          </Button>
        </GlassCard>

        {bundle?.disclaimer ? (
          <p className="text-muted-foreground px-1 text-[10px] leading-relaxed">
            {bundle.disclaimer}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
