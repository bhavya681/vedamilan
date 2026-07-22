"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AI_GURU_NAME,
  AiGuruAvatar,
  AiGuruHeader,
  AiGuruLabel,
} from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt?: string | Date;
};

const SUGGESTED = [
  "Why is this person a strong match for me?",
  "What does our emotional alignment look like?",
  "Where should we communicate carefully?",
  "Should I explore this connection further?",
];

function Bubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? <AiGuruAvatar size="sm" className="mt-0.5" /> : null}
      <div
        className={cn(
          "max-w-[min(100%,20rem)] px-3 py-2 text-[13px] leading-relaxed sm:max-w-[min(100%,28rem)] sm:px-3.5 sm:py-2.5 sm:text-sm md:max-w-[min(100%,36rem)]",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
            : "border-border/60 bg-card rounded-2xl rounded-bl-md border",
        )}
      >
        {!isUser ? <AiGuruLabel className="mb-1.5" /> : null}
        <GuruMarkdown content={content} tone={isUser ? "user" : "assistant"} />
      </div>
    </div>
  );
}

export function CompatibilityAiChat({
  candidateUserId,
  partnerName,
}: {
  candidateUserId: string;
  partnerName?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: partnerName
        ? `Namaste. I am **${AI_GURU_NAME}**. I can help you understand your compatibility with **${partnerName}** — emotional patterns, strengths, and areas worth discussing with care.`
        : `Namaste. I am **${AI_GURU_NAME}**. Ask about this connection — emotional patterns, strengths, or areas worth discussing. My guidance stays grounded in your calculated charts.`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  useEffect(() => {
    setConversationId(undefined);
    setMessages([
      {
        role: "assistant",
        content: partnerName
          ? `Namaste. I am **${AI_GURU_NAME}**. I can help you understand your compatibility with **${partnerName}** — emotional patterns, strengths, and areas worth discussing with care.`
          : `Namaste. I am **${AI_GURU_NAME}**. Ask about this connection — emotional patterns, strengths, or areas worth discussing.`,
        createdAt: new Date().toISOString(),
      },
    ]);
    setError(null);
  }, [candidateUserId, partnerName]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || busy || !candidateUserId) return;
    setError(null);
    setBusy(true);
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: message, createdAt: new Date() }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "COMPATIBILITY",
          message,
          conversationId,
          candidateUserId,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || `${AI_GURU_NAME} could not respond right now`);
        setBusy(false);
        return;
      }
      setConversationId(json.data.conversationId);
      if (Array.isArray(json.data.messages) && json.data.messages.length) {
        setMessages(
          json.data.messages.filter(
            (m: ChatMessage) => m.role === "user" || m.role === "assistant",
          ),
        );
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.data.answer, createdAt: new Date() },
        ]);
      }
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

  return (
    <section className="border-border/70 bg-card shadow-soft flex h-[min(58dvh,520px)] flex-col overflow-hidden rounded-2xl border sm:h-[min(62dvh,600px)] md:h-[min(68dvh,680px)]">
      <header className="border-border/50 shrink-0 border-b px-3 py-3 sm:px-4">
        <AiGuruHeader
          subtitle={
            partnerName
              ? `Compatibility guidance for you and ${partnerName}`
              : "Sacred Vedic guidance for this connection"
          }
        />
      </header>

      <ScrollArea className="min-h-0 flex-1">
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
              <AiGuruAvatar size="sm" busy />
              <span>{AI_GURU_NAME} is reading both charts…</span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {error ? <p className="text-destructive px-3 pb-2 text-xs sm:px-4">{error}</p> : null}

      <div className="border-border/50 shrink-0 border-t px-2.5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-2.5 sm:pb-3">
        {!userAsked ? (
          <div className="scrollbar-hidden mb-2 flex gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
            {SUGGESTED.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void sendMessage(prompt)}
                className="border-border/60 bg-background hover:border-primary/35 hover:bg-primary/5 max-w-[14rem] shrink-0 rounded-xl border px-3 py-1.5 text-left text-[11px] leading-snug transition disabled:opacity-50 sm:max-w-none"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={onSubmit}
          className="border-border/60 bg-background focus-within:border-primary/35 flex items-end gap-1.5 rounded-xl border p-1 sm:gap-2 sm:p-1.5"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Ask ${AI_GURU_NAME} about this connection…`}
            rows={1}
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
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </section>
  );
}
