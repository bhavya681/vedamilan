"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowUp, BookmarkPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
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

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-6xl flex-col gap-6 lg:flex-row lg:gap-10">
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
          AI guide inspired by teachings traditionally associated with {guide.displayName}.
        </p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>
            Speak with {guide.displayName}
          </Link>
        </Button>
        <div className="hidden lg:block">
          <p className="text-muted-foreground mb-2 text-[11px] font-medium tracking-wide uppercase">
            Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {guide.topics.map((t) => (
              <button
                key={t}
                type="button"
                className="border-border/60 hover:border-foreground/25 rounded-md border px-2 py-1 text-xs"
                onClick={() => setInput(`Help me reflect on ${t.toLowerCase()}.`)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden space-y-1 lg:block">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Sources
          </p>
          {guide.primarySources.map((s) => (
            <p key={s} className="text-xs leading-relaxed">
              · {s}
            </p>
          ))}
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={includeLifeContext}
            onChange={(e) => setIncludeLifeContext(e.target.checked)}
          />
          <span className="text-muted-foreground">
            Include gentle profile context for personalized reflection (never used for destiny
            claims).
          </span>
        </label>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.length === 0 ? (
            <div className="border-border/60 space-y-3 border-y py-8">
              <p className="text-muted-foreground text-sm">Your question</p>
              <p className="font-display text-xl leading-snug sm:text-2xl">
                What would you like to understand more clearly?
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {(topic
                  ? [`Reflect with me on ${topic}`]
                  : [
                      "How should I handle conflict with care?",
                      "How do I choose between two paths?",
                      "What makes a strong marriage?",
                    ]
                ).map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="border-border/60 hover:border-foreground/25 rounded-md border px-3 py-1.5 text-left text-xs sm:text-sm"
                    onClick={() => void send(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.pending ? (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gathering a thoughtful reflection…
                </div>
              ) : (
                <div
                  className={cn(
                    "max-w-[min(100%,36rem)] px-4 py-3",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                      : "border-border/60 space-y-3 rounded-2xl rounded-bl-md border",
                  )}
                >
                  {m.role === "assistant" ? (
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                      Wisdom reflection · AI interpretation
                    </p>
                  ) : null}
                  <GuruMarkdown content={m.content} tone={m.role} />
                  {m.role === "assistant" && !m.failed ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void saveInsight(m.content)}
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      Save insight
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {reflectPrompt ? (
            <div className="border-border/60 space-y-2 border-t pt-4">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                Reflect with me
              </p>
              <p className="font-display text-lg">{reflectPrompt}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setInput(reflectPrompt);
                  setReflectPrompt("What outcome would align with your values?");
                }}
              >
                Continue reflecting
              </Button>
            </div>
          ) : null}

          {savedNote ? <p className="text-muted-foreground text-xs">{savedNote}</p> : null}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="border-border/60 bg-background sticky bottom-0 border-t pt-3 pb-2"
        >
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="wisdom-input">
              Your question
            </label>
            <textarea
              id="wisdom-input"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a thoughtful question…"
              className="border-border bg-card focus-visible:ring-ring min-h-[2.75rem] flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
              disabled={busy}
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0"
              disabled={busy || !input.trim()}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-[10px] leading-relaxed">
            {WISDOM_AI_DISCLAIMER}
          </p>
        </form>
      </div>
    </div>
  );
}
