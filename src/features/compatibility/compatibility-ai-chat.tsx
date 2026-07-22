"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, MessageCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt?: string | Date;
};

const SUGGESTED = [
  "How is our overall marriage potential?",
  "How might she/he think and feel in a relationship?",
  "What are our biggest strengths as a couple?",
  "Where should we communicate carefully?",
  "What does Shukra Milan say about our bond?",
];

function Bubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="from-gold/25 to-primary/20 text-gold mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br sm:h-8 sm:w-8">
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[min(100%,20rem)] px-3 py-2 text-[13px] leading-relaxed sm:max-w-[min(100%,28rem)] sm:px-3.5 sm:py-2.5 sm:text-sm md:max-w-[min(100%,36rem)]",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
            : "border-border/50 bg-card rounded-2xl rounded-bl-md border",
        )}
      >
        {!isUser ? (
          <p className="text-gold mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
            Compatibility AI
          </p>
        ) : null}
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
        ? `I can explain your compatibility with **${partnerName}** using the calculated report — marriage outlook, emotional style, strengths, and areas to discuss. What would you like to understand?`
        : "Ask anything about this compatibility report — marriage outlook, emotional style, strengths, or challenges. Answers stay grounded in your calculated charts.",
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
          ? `I can explain your compatibility with **${partnerName}** using the calculated report — marriage outlook, emotional style, strengths, and areas to discuss. What would you like to understand?`
          : "Ask anything about this compatibility report — marriage outlook, emotional style, strengths, or challenges.",
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
        setError(json.error?.message || "AI could not respond right now");
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
    <section className="border-border/50 bg-card/40 flex h-[min(58dvh,520px)] flex-col overflow-hidden rounded-2xl border sm:h-[min(62dvh,600px)] sm:rounded-[1.5rem] md:h-[min(68dvh,680px)] lg:h-[min(70dvh,720px)]">
      <header className="border-border/40 flex shrink-0 items-center gap-2.5 border-b px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <div className="from-gold/30 to-primary/20 text-gold flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-10 sm:w-10">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base leading-tight sm:text-lg">Ask about this match</p>
          <p className="text-muted-foreground truncate text-[11px] sm:text-xs">
            Chart-backed · AI explains, engines calculate
          </p>
        </div>
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
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Reading both charts…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {error ? <p className="text-destructive px-3 pb-2 text-xs sm:px-4">{error}</p> : null}

      <div className="border-border/40 shrink-0 border-t px-2.5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-2.5 sm:pb-3">
        {!userAsked ? (
          <div className="scrollbar-hidden mb-2 flex gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
            {SUGGESTED.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void sendMessage(prompt)}
                className="border-border/60 bg-card hover:border-gold/40 hover:bg-gold/8 max-w-[14rem] shrink-0 rounded-full border px-2.5 py-1.5 text-left text-[10px] leading-snug transition disabled:opacity-50 sm:max-w-none sm:px-3 sm:text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={onSubmit}
          className="border-border/50 bg-background focus-within:border-gold/40 flex items-end gap-1.5 rounded-2xl border p-1 sm:gap-2 sm:p-1.5"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about marriage, emotions, family…"
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
            className="mb-0.5 h-9 w-9 shrink-0 rounded-full"
            aria-label="Send"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </section>
  );
}
