"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronRight,
  Copy,
  History,
  Loader2,
  Menu,
  MessageSquarePlus,
  Plus,
  Sparkles,
  Telescope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AI_GURU_NAME, AiGuruAvatar } from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { GuruChartPanels, type ChartPanelsData } from "@/features/ai/components/guru-chart-panels";
import { GuruUiView } from "@/features/ai/openui/guru-ui-view";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type GuruUi = {
  format: "openui" | "markdown";
  code: string;
  disclaimer?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ui?: GuruUi;
  animate?: boolean;
  failed?: boolean;
};

type InsightsPayload = ChartPanelsData & {
  openingMessage: string;
  suggestedPrompts: string[];
  disclaimer: string;
};

type ConversationRow = {
  _id: string;
  title?: string;
  updatedAt?: string;
  messages?: Array<{ role: string; content: string; createdAt?: string }>;
};

const DEFAULT_PROMPTS = [
  "What does my chart say about marriage timing?",
  "Explain my current Mahadasha in simple words",
  "Which yogas are active in my kundli?",
  "What career direction suits my chart?",
];

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function storedUi(content: string): GuruUi | undefined {
  const fenced = content.match(/```(?:openui|openui-lang)\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return { format: "openui", code: fenced[1].trim() };
  if (/^\s*root\s*=/m.test(content)) return { format: "openui", code: content.trim() };
  return undefined;
}

function conversationToMessages(row: ConversationRow): ChatMessage[] {
  return (row.messages || [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => {
      const ui = message.role === "assistant" ? storedUi(message.content) : undefined;
      return {
        id: newId(),
        role: message.role as "user" | "assistant",
        content: ui ? "" : message.content,
        ui,
        animate: false,
      };
    });
}

function relativeTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AiInsightsPage() {
  const [bundle, setBundle] = useState<InsightsPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [recent, setRecent] = useState<ConversationRow[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  const userAsked = messages.some((message) => message.role === "user");
  const prompts = bundle?.suggestedPrompts?.length ? bundle.suggestedPrompts : DEFAULT_PROMPTS;

  const summaryChips = useMemo(() => {
    if (!bundle?.chartSummary) return [];
    return [
      ["Lagna", bundle.chartSummary.lagnaSign],
      ["Moon", bundle.chartSummary.moonSign],
      ["Sun", bundle.chartSummary.sunSign],
      ["Dasha", bundle.dasha?.currentMaha || "—"],
    ] as const;
  }, [bundle]);

  const loadBundle = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/insights");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || `Failed to load ${AI_GURU_NAME}`);
        return;
      }
      setBundle(json.data as InsightsPayload);
    } catch {
      setError(`Failed to load ${AI_GURU_NAME}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chat?agent=ASTROLOGER_GURU");
      const json = await res.json();
      if (json.success) setRecent((json.data.conversations || []) as ConversationRow[]);
    } catch {
      // Recent chats are a convenience; ignore network failures here.
    }
  }, []);

  useEffect(() => {
    void loadBundle();
    void loadRecent();
  }, [loadBundle, loadRecent]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [draft]);

  useEffect(() => {
    if (!stickToBottom.current) return;
    const root = scrollRef.current;
    if (root) root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
    else bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function onScroll() {
    const root = scrollRef.current;
    if (!root) return;
    stickToBottom.current = root.scrollHeight - root.scrollTop - root.clientHeight < 120;
  }

  function startNewChat() {
    setConversationId(undefined);
    setMessages([]);
    setDraft("");
    setError(null);
    setHistoryOpen(false);
    stickToBottom.current = true;
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function openConversation(row: ConversationRow) {
    setConversationId(row._id);
    setMessages(conversationToMessages(row));
    setError(null);
    setHistoryOpen(false);
    stickToBottom.current = true;
  }

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setError(null);
    setBusy(true);
    setDraft("");
    stickToBottom.current = true;

    const userId = newId();
    setMessages((prev) => [...prev, { id: userId, role: "user", content: message }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "ASTROLOGER_GURU",
          message,
          conversationId,
          ui: true,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || `${AI_GURU_NAME} could not respond right now`);
        setMessages((prev) =>
          prev.map((item) => (item.id === userId ? { ...item, failed: true } : item)),
        );
        return;
      }

      setConversationId(json.data.conversationId);
      const ui = json.data.ui as GuruUi | undefined;
      const answer =
        typeof json.data.answer === "string" && json.data.answer.trim()
          ? json.data.answer
          : "I could not form a short answer just now. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          ui,
          content: ui?.format === "openui" ? "" : answer,
          animate: true,
        },
      ]);
      void loadRecent();
    } catch {
      setError("Connection issue — please try again");
      setMessages((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, failed: true } : item)),
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(draft);
  }

  async function copyMessage(message: ChatMessage) {
    const text = message.ui?.format === "openui" ? message.ui.code : message.content;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Clipboard can be blocked; fail silently.
    }
  }

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  const sidebar = (
    <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden">
      <div className="border-border/50 flex shrink-0 items-center justify-between gap-2 border-b px-3.5 py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
          <AiGuruAvatar size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold">{AI_GURU_NAME}</p>
            <p className="text-muted-foreground truncate text-[11px]">Vedic intelligence</p>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          aria-label="Start a new chat"
          onClick={startNewChat}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="scrollbar-premium flex min-h-0 w-full min-w-0 flex-1 [scrollbar-gutter:stable] flex-col overflow-x-hidden overflow-y-auto px-2.5 py-3">
        <Button
          type="button"
          variant="outline"
          className="mb-4 flex h-auto w-full max-w-full min-w-0 items-center justify-start gap-2 overflow-hidden rounded-xl py-2.5 whitespace-normal"
          onClick={startNewChat}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left text-sm">New conversation</span>
        </Button>

        <p className="text-muted-foreground px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
          Recent
        </p>
        {recent.length ? (
          <div className="flex w-full max-w-full min-w-0 flex-col space-y-0.5">
            {recent.slice(0, 12).map((row) => (
              <button
                key={row._id}
                type="button"
                onClick={() => openConversation(row)}
                className={cn(
                  "group grid w-full max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-lg px-2 py-2 text-left transition-colors",
                  conversationId === row._id ? "bg-gold/10" : "hover:bg-muted/70",
                )}
              >
                <History className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <span className="flex min-w-0 flex-col overflow-hidden text-left">
                  <span
                    className="block max-w-full truncate text-xs font-medium"
                    title={row.title || "Untitled reading"}
                  >
                    {row.title || "Untitled reading"}
                  </span>
                  <span className="text-muted-foreground block max-w-full truncate text-[10px]">
                    {relativeTime(row.updatedAt)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground px-2 text-[11px] leading-relaxed [overflow-wrap:anywhere]">
            Your readings will appear here as you chat.
          </p>
        )}

        <p className="text-muted-foreground mt-5 px-2 pb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
          Explore
        </p>
        <div className="flex w-full max-w-full min-w-0 flex-col space-y-1">
          {prompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={busy}
              onClick={() => void sendMessage(prompt)}
              className="hover:bg-muted/70 group grid w-full max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2 overflow-hidden rounded-lg px-2 py-2 text-left transition-colors disabled:opacity-50"
            >
              <Sparkles className="text-gold mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="text-muted-foreground group-hover:text-foreground line-clamp-2 min-w-0 text-left text-[11px] leading-snug [overflow-wrap:anywhere]">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-border/50 w-full min-w-0 shrink-0 border-t p-3">
        <div className="border-border/50 from-gold/[0.08] w-full min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br to-transparent px-3 py-3">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
            Chart snapshot
          </p>
          {bundle?.hasChart && bundle.chartSummary ? (
            <>
              <div className="mt-2 grid w-full min-w-0 grid-cols-3 gap-1.5 text-center">
                {summaryChips.slice(0, 3).map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-background/70 min-w-0 overflow-hidden rounded-lg px-1 py-1.5"
                  >
                    <p className="text-muted-foreground truncate text-[9px] uppercase">{label}</p>
                    <p className="truncate text-[11px] font-medium" title={String(value)}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setChartOpen(true)}
                className="text-gold mt-2 inline-flex w-full max-w-full min-w-0 items-center justify-center gap-1 text-[11px] font-medium hover:underline"
              >
                <span className="truncate">Open full chart</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed [overflow-wrap:anywhere] break-words">
                Generate your kundli to unlock chart-backed answers.
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-2 h-auto w-full max-w-full min-w-0 px-2 py-2 text-[11px] whitespace-normal"
              >
                <Link href={routes.birthDetails} className="block truncate text-center">
                  Add birth details
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      data-dashboard-bleed
      className="dashboard-fill-h bg-background -mx-3 flex min-h-0 flex-col overflow-hidden sm:-mx-4 md:-mx-5 lg:-mx-8"
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="border-border/50 bg-card/30 hidden w-[16.5rem] max-w-[16.5rem] min-w-0 shrink-0 overflow-hidden border-r lg:flex lg:flex-col">
          {sidebar}
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_5%,transparent),transparent_42%)]" />

          <header className="border-border/50 bg-background/85 relative z-10 flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5 backdrop-blur-xl sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 shrink-0 lg:hidden"
                aria-label="Open chat history"
                onClick={() => setHistoryOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <AiGuruAvatar size="md" busy={busy} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold sm:text-base">{AI_GURU_NAME}</p>
                  <Badge
                    variant="secondary"
                    className="hidden gap-1 px-1.5 py-0 text-[9px] font-medium sm:inline-flex"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    OpenUI
                  </Badge>
                </div>
                <p className="text-muted-foreground truncate text-[11px]">
                  {busy
                    ? "Composing your reading…"
                    : bundle?.hasChart
                      ? "Present · chart-aware guidance"
                      : "Present · add birth details for chart answers"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9"
                aria-label="Open chart context"
                onClick={() => setChartOpen(true)}
              >
                <Telescope className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="hidden h-9 w-9 sm:inline-flex lg:hidden"
                aria-label="Open chat history"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="hidden gap-1.5 sm:inline-flex"
                onClick={startNewChat}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          </header>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="scrollbar-premium relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="mx-auto w-full max-w-none px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
              {loading ? (
                <div className="space-y-3 py-12" role="status" aria-label="Preparing AI Guru">
                  <div className="skeleton-shimmer mx-auto h-3 w-44 rounded-full" />
                  <div className="skeleton-shimmer mx-auto h-3 w-60 max-w-full rounded-full" />
                  <div className="skeleton-shimmer mx-auto h-3 w-36 rounded-full" />
                </div>
              ) : null}

              {!loading && !userAsked ? (
                <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                  <div className="border-border/45 from-card/80 relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br via-transparent to-transparent px-5 py-7 text-center sm:px-8 sm:py-10">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--gold)_12%,transparent),transparent_58%)]" />
                    <div className="relative">
                      <AiGuruAvatar size="lg" className="mx-auto h-14 w-14" />
                      <h1 className="font-display mt-4 text-[1.7rem] leading-tight tracking-tight sm:text-4xl">
                        Namaste, I am {AI_GURU_NAME}
                      </h1>
                      <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed sm:text-[15px]">
                        Ask about your kundli, dashas, yogas, marriage timing, or compatibility. I
                        answer from engine-calculated chart data and compose each reply as live,
                        readable panels.
                      </p>

                      {summaryChips.length ? (
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                          {summaryChips.map(([label, value]) => (
                            <span
                              key={label}
                              className="border-border/50 bg-background/70 text-muted-foreground rounded-full border px-2.5 py-1 text-[10px]"
                            >
                              {label} · <span className="text-foreground font-medium">{value}</span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2">
                    {prompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={busy}
                        onClick={() => void sendMessage(prompt)}
                        className="border-border/50 bg-card/50 hover:border-gold/40 hover:bg-gold/[0.05] group flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all disabled:opacity-50"
                      >
                        <Sparkles className="text-gold mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="text-foreground/85 group-hover:text-foreground min-w-0 flex-1 text-[12.5px] leading-snug">
                          {prompt}
                        </span>
                        <ChevronRight className="text-muted-foreground group-hover:text-gold mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.length ? (
                <div className="space-y-5 sm:space-y-6">
                  {messages.map((message) => {
                    const isUser = message.role === "user";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "animate-in fade-in-0 slide-in-from-bottom-1 flex w-full gap-2.5 duration-300 sm:gap-3",
                          isUser ? "justify-end" : "justify-start",
                        )}
                      >
                        {!isUser ? (
                          <AiGuruAvatar
                            size="md"
                            className="mt-0.5 shrink-0"
                            busy={message.id === lastAssistantId && busy}
                          />
                        ) : null}

                        {isUser ? (
                          <div className="bg-primary text-primary-foreground max-w-[min(100%,34rem)] rounded-[1.35rem] rounded-br-md px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-[var(--shadow-soft)] sm:px-4 sm:py-3 sm:text-sm">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.failed ? (
                              <p className="text-primary-foreground/75 mt-1.5 text-[10px]">
                                Could not send — try again.
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center gap-2">
                              <p className="text-gold text-[10px] font-semibold tracking-[0.14em] uppercase">
                                {AI_GURU_NAME}
                              </p>
                              <span className="bg-border/70 h-px flex-1" />
                              {message.ui?.format === "openui" ? (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="text-muted-foreground h-6 w-6"
                                  aria-label="Copy reply"
                                  onClick={() => void copyMessage(message)}
                                >
                                  {copiedId === message.id ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              ) : null}
                            </div>

                            {message.ui?.format === "openui" && message.ui.code ? (
                              <GuruUiView
                                code={message.ui.code}
                                animate={message.animate && message.id === lastAssistantId}
                                onAsk={(prompt) => void sendMessage(prompt)}
                                className="w-full max-w-none min-w-0"
                              />
                            ) : (
                              <div className="border-border/45 bg-card/55 w-full max-w-none min-w-0 overflow-x-auto rounded-[1.35rem] rounded-tl-md border px-3.5 py-3 sm:px-4">
                                <GuruMarkdown content={message.content} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {busy ? (
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <AiGuruAvatar size="md" busy className="mt-0.5 shrink-0" />
                      <div className="border-border/45 bg-card/55 rounded-[1.35rem] rounded-tl-md border px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-gold/70 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                          <span className="bg-gold/70 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                          <span className="bg-gold/70 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                          <span className="text-muted-foreground ml-2 text-xs">
                            {AI_GURU_NAME} is reading your chart…
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div ref={bottomRef} className="h-1" aria-hidden />
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-border/40 bg-background/92 relative z-10 shrink-0 border-t backdrop-blur-xl">
            <div className="mx-auto w-full max-w-none px-3 pb-2.5 sm:px-6 sm:pb-3 lg:px-8">
              {error ? (
                <div className="border-destructive/30 bg-destructive/5 text-destructive mb-2 rounded-xl border px-3 py-2 text-xs">
                  {error}
                </div>
              ) : null}

              {userAsked && !busy ? (
                <div className="scrollbar-hidden mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
                  {prompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="border-border/55 bg-card/60 hover:border-gold/40 hover:bg-gold/[0.05] shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              <form
                onSubmit={onSubmit}
                className="border-border/55 bg-card/85 focus-within:border-gold/50 focus-within:ring-gold/15 flex items-end gap-1.5 rounded-[1.55rem] border p-1.5 shadow-[var(--shadow-elevated)] transition focus-within:ring-2 sm:gap-2 sm:p-2"
              >
                <div className="mb-0.5 ml-1 hidden size-8 shrink-0 items-center justify-center rounded-full sm:flex">
                  <Sparkles className="text-gold h-4 w-4" />
                </div>
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Ask ${AI_GURU_NAME} about your chart, love, career, or timing…`}
                  rows={1}
                  disabled={busy}
                  className="placeholder:text-muted-foreground/70 max-h-40 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[13.5px] leading-relaxed focus-visible:outline-none disabled:opacity-70 sm:px-2.5 sm:text-sm"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (!busy && draft.trim()) onSubmit(event);
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
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </form>

              <p className="text-muted-foreground/80 mt-1.5 text-center text-[10px] leading-relaxed">
                AI Guru interprets rule-engine data · Enter to send · Shift+Enter for a new line
              </p>
              {bundle?.disclaimer ? (
                <p className="text-muted-foreground/60 mt-1 hidden text-center text-[10px] leading-relaxed sm:block">
                  {bundle.disclaimer}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent
          side="left"
          className="flex h-full w-[min(88vw,18rem)] max-w-[18rem] flex-col overflow-hidden p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Chat history</SheetTitle>
            <SheetDescription>Recent AI Guru conversations</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 w-full min-w-0 flex-1 overflow-hidden">{sidebar}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={chartOpen} onOpenChange={setChartOpen}>
        <SheetContent side="right" className="w-[min(100%,27rem)] p-0">
          <SheetHeader className="border-border/50 shrink-0 border-b px-4 py-3 text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Telescope className="text-gold h-4 w-4" />
              Chart context
            </SheetTitle>
            <SheetDescription className="text-xs">
              The engine-calculated chart AI Guru is reading from.
            </SheetDescription>
          </SheetHeader>
          <div className="scrollbar-premium min-h-0 flex-1 overflow-y-auto p-3">
            <GuruChartPanels data={bundle} />
            {bundle?.disclaimer ? (
              <p className="text-muted-foreground mt-4 px-1 text-[10px] leading-relaxed">
                {bundle.disclaimer}
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
