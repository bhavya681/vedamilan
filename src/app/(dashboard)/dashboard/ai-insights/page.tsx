"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, MessageCircle, Telescope } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import {
  AI_GURU_NAME,
  AiGuruAvatar,
  AiGuruHeader,
  AiGuruLabel,
} from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { GuruChartPanels, type ChartPanelsData } from "@/features/ai/components/guru-chart-panels";

type ChatMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt?: string | Date;
};

type InsightsPayload = ChartPanelsData & {
  openingMessage: string;
  suggestedPrompts: string[];
  disclaimer: string;
};

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 flex w-full gap-3 duration-300",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? <AiGuruAvatar size="md" className="mt-0.5" /> : null}
      <div
        className={cn(
          "max-w-[min(100%,38rem)] px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground shadow-soft rounded-[1.35rem] rounded-br-md"
            : "border-border/50 bg-card/95 dark:bg-card/80 shadow-soft rounded-[1.35rem] rounded-bl-md border",
        )}
      >
        {!isUser ? (
          <div className="mb-2 flex items-center gap-2">
            <AiGuruLabel />
            <span className="bg-border/80 h-px flex-1" />
          </div>
        ) : null}
        <GuruMarkdown content={content} tone={isUser ? "user" : "assistant"} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <AiGuruAvatar size="md" busy />
      <div className="border-border/50 bg-card/95 dark:bg-card/80 shadow-soft rounded-[1.35rem] rounded-bl-md border px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="bg-gold/70 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
          <span className="bg-gold/70 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
          <span className="bg-gold/70 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
          <span className="text-muted-foreground ml-2 text-xs">
            {AI_GURU_NAME} is reading your kundli…
          </span>
        </div>
      </div>
    </div>
  );
}

function ChatComposer({
  draft,
  setDraft,
  busy,
  onSubmit,
  prompts,
  onPrompt,
  showPrompts,
}: {
  draft: string;
  setDraft: (v: string) => void;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  prompts?: string[];
  onPrompt: (text: string) => void;
  showPrompts: boolean;
}) {
  return (
    <div className="border-border/40 from-background via-background/95 to-background/80 shrink-0 border-t bg-gradient-to-t px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
      {showPrompts && prompts?.length ? (
        <div className="scrollbar-hidden mb-3 flex gap-2 overflow-x-auto pb-0.5">
          {prompts.slice(0, 5).map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={busy}
              onClick={() => onPrompt(prompt)}
              className="border-border/60 bg-card/70 hover:border-gold/45 hover:bg-gold/8 text-foreground/85 dark:bg-card/50 shrink-0 rounded-full border px-3.5 py-2 text-left text-[11px] leading-snug transition disabled:opacity-50 sm:text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="border-border/50 bg-card focus-within:border-gold/45 focus-within:ring-gold/20 dark:bg-card/60 shadow-soft flex items-end gap-2 rounded-[1.5rem] border p-1.5 transition focus-within:ring-2"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about Raja Yoga, Dasha, Gochar, marriage timing…"
          rows={1}
          className="placeholder:text-muted-foreground/70 max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed focus-visible:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={busy || !draft.trim()}
          size="icon"
          className="shadow-gold mb-0.5 h-10 w-10 shrink-0 rounded-full"
          aria-label="Send message"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </Button>
      </form>
      <p className="text-muted-foreground mt-2 text-center text-[10px] sm:text-[11px]">
        Enter to send · Shift+Enter for new line · Chart-backed answers only
      </p>
    </div>
  );
}

export default function AiInsightsPage() {
  const [bundle, setBundle] = useState<InsightsPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetch("/api/ai/insights")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || `Failed to load ${AI_GURU_NAME} insights`);
          return;
        }
        const data = json.data as InsightsPayload;
        setBundle(data);
        setMessages([
          {
            role: "assistant",
            content: data.openingMessage,
            createdAt: new Date().toISOString(),
          },
        ]);
      })
      .catch(() => setError(`Failed to load ${AI_GURU_NAME} insights`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setError(null);
    setBusy(true);
    setDraft("");
    setMobileTab("chat");
    setMessages((prev) => [...prev, { role: "user", content: message, createdAt: new Date() }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "ASTROLOGER_GURU",
          message,
          conversationId,
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

  const chatPanel = (
    <section className="border-border/50 bg-card/40 dark:bg-card/30 shadow-soft flex h-[min(72dvh,760px)] flex-col overflow-hidden rounded-[1.75rem] border backdrop-blur-xl lg:h-[calc(100dvh-11.5rem)]">
      {/* Header */}
      <header className="border-border/40 from-card via-card to-muted/30 dark:to-muted/20 relative shrink-0 border-b bg-gradient-to-r px-4 py-3.5 sm:px-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_14%,transparent),transparent_55%)]" />
        <div className="relative">
          <AiGuruHeader
            online
            subtitle={
              bundle?.hasChart
                ? `Lagna ${bundle.chartSummary?.lagnaSign} · Moon ${bundle.chartSummary?.moonSign} · Sun ${bundle.chartSummary?.sunSign}`
                : "Generate kundli to unlock full chart-backed guidance"
            }
          />
        </div>
      </header>

      {/* Messages */}
      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--gold)_6%,transparent),transparent_45%)]" />
        <ScrollArea className="h-full">
          <div className="relative space-y-5 px-3 py-5 sm:space-y-6 sm:px-5">
            {!userAsked && !loading ? (
              <div className="border-border/40 from-gold/5 mx-auto mb-2 max-w-md rounded-2xl border border-dashed bg-gradient-to-b to-transparent px-4 py-5 text-center">
                <AiGuruAvatar size="lg" className="mx-auto" />
                <p className="font-display mt-3 text-lg">Ask {AI_GURU_NAME} with intention</p>
                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                  Yogas, dasha periods, gochar, or marriage themes — answers cite your stored chart.
                </p>
              </div>
            ) : null}

            {loading ? (
              <div className="space-y-3 py-6" role="status" aria-label="Preparing chart context">
                <div className="skeleton-shimmer mx-auto h-3 w-48 rounded-full" />
                <div className="skeleton-shimmer mx-auto h-3 w-64 max-w-full rounded-full" />
                <div className="skeleton-shimmer mx-auto h-3 w-40 rounded-full" />
              </div>
            ) : null}

            {messages.map((m, idx) => (
              <MessageBubble
                key={`${m.role}-${idx}-${String(m.createdAt)}`}
                role={m.role}
                content={m.content}
              />
            ))}
            {busy ? <TypingIndicator /> : null}
            <div ref={bottomRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      <ChatComposer
        draft={draft}
        setDraft={setDraft}
        busy={busy}
        onSubmit={onSubmit}
        prompts={bundle?.suggestedPrompts}
        onPrompt={(text) => void sendMessage(text)}
        showPrompts={!userAsked || messages.length <= 2}
      />
    </section>
  );

  return (
    <div className="relative space-y-4 sm:space-y-5">
      <PageHeader
        className="mb-4 sm:mb-5"
        title={AI_GURU_NAME}
        description="Sacred Vedic guidance — yogas, dasha & gochar beside you, grounded in your chart."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={routes.kundli}>Open kundli</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.birthDetails}>Birth details</Link>
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="border-border/50 bg-card/60 mb-4 grid h-11 w-full grid-cols-2 rounded-full border p-1">
            <TabsTrigger value="chat" className="gap-1.5 rounded-full text-xs sm:text-sm">
              <MessageCircle className="h-3.5 w-3.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="chart" className="gap-1.5 rounded-full text-xs sm:text-sm">
              <Telescope className="h-3.5 w-3.5" />
              Chart
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="mt-0">
            {chatPanel}
          </TabsContent>
          <TabsContent value="chart" className="mt-0">
            <GuruChartPanels data={bundle} />
            {bundle?.disclaimer ? (
              <p className="text-muted-foreground mt-4 text-[11px] leading-relaxed">
                {bundle.disclaimer}
              </p>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)] xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.78fr)] xl:gap-6">
        {chatPanel}
        <aside className="scrollbar-premium max-h-[calc(100dvh-11.5rem)] space-y-4 overflow-y-auto pr-1">
          <GuruChartPanels data={bundle} />
          {bundle?.disclaimer ? (
            <p className="text-muted-foreground px-1 text-[11px] leading-relaxed">
              {bundle.disclaimer}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
