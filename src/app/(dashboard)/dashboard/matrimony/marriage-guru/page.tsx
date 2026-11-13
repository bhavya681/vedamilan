"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ArrowUp,
  Check,
  ChevronRight,
  Copy,
  Heart,
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

import { MARRIAGE_GURU_NAME, AiGuruAvatar } from "@/features/ai/components/ai-guru-identity";

import { GuruMarkdown } from "@/features/ai/components/guru-markdown";

import { GuruChartPanels, type ChartPanelsData } from "@/features/ai/components/guru-chart-panels";

import { GuruUiView } from "@/features/ai/openui/guru-ui-view";

import {
  MarriageWindowsPanel,
  type Factor,
  type Window,
} from "@/features/marriage-guru/components/marriage-windows-panel";

import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";

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

type MarriageBundle = ChartPanelsData & {
  openingMessage: string;
  suggestedPrompts: string[];
  disclaimer: string;
  marriageWindows?: Window[];
  pastMarriageWindows?: Window[];
  timingFactors?: Factor[];
  timingMethodology?: string | null;

  spouseTendencies?: {
    marriagePathLabel?: string;
    spouseOriginLabel?: string;
  } | null;

  marryNow?: {
    score: number;
    title: string;
    reason: string;
    verdict?: string;
  } | null;

  currentMaha?: string | null;
  currentAntar?: string | null;
};

type ConversationRow = {
  _id: string;
  title?: string;
  updatedAt?: string;

  messages?: Array<{
    role: string;
    content: string;
    createdAt?: string;
  }>;
};

const DEFAULT_PROMPTS = [
  "When is my best marriage window?",
  "Love or arranged — what does my chart suggest?",
  "Is now a good time to seek a partner?",
  "What should I look for in a spouse?",
];

const SIDEBAR_WIDTH = "17rem";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function storedUi(content: string): GuruUi | undefined {
  const fenced = content.match(/```(?:openui|openui-lang)\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return {
      format: "openui",
      code: fenced[1].trim(),
    };
  }

  if (/^\s*root\s*=/m.test(content)) {
    return {
      format: "openui",
      code: content.trim(),
    };
  }

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

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function MarriageGuruPage() {
  const { setMode } = useWorkspaceMode();

  const [bundle, setBundle] = useState<MarriageBundle | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [conversationId, setConversationId] = useState<string>();

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

  useEffect(() => {
    setMode("matrimony", { navigate: false });
  }, [setMode]);

  const userAsked = messages.some((message) => message.role === "user");

  const prompts = bundle?.suggestedPrompts?.length ? bundle.suggestedPrompts : DEFAULT_PROMPTS;

  const summaryChips = useMemo(() => {
    if (!bundle?.chartSummary) return [];

    return [
      ["Lagna", bundle.chartSummary.lagnaSign],
      ["Moon", bundle.chartSummary.moonSign],
      ["Sun", bundle.chartSummary.sunSign],
      ["Dasha", bundle.currentMaha || bundle.dasha?.currentMaha || "—"],
    ] as const;
  }, [bundle]);

  // Load marriage guru data
  const loadBundle = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/marriage-guru");

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || `Failed to load ${MARRIAGE_GURU_NAME}`);

        return;
      }

      setBundle(json.data as MarriageBundle);
    } catch {
      setError(`Failed to load ${MARRIAGE_GURU_NAME}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recent conversations
  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chat?agent=MARRIAGE_GURU");

      const json = await res.json();

      if (json.success) {
        setRecent((json.data.conversations || []) as ConversationRow[]);
      }
    } catch {
      // Ignore history loading errors.
    }
  }, []);

  useEffect(() => {
    void loadBundle();
    void loadRecent();
  }, [loadBundle, loadRecent]);

  // Auto resize composer
  useEffect(() => {
    const element = textareaRef.current;

    if (!element) return;

    element.style.height = "auto";

    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [draft]);

  // Auto scroll chat
  useEffect(() => {
    if (!stickToBottom.current) return;

    const root = scrollRef.current;

    if (root) {
      root.scrollTo({
        top: root.scrollHeight,
        behavior: "smooth",
      });
    } else {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, busy]);

  function onScroll() {
    const root = scrollRef.current;

    if (!root) return;

    stickToBottom.current = root.scrollHeight - root.scrollTop - root.clientHeight < 120;
  }

  // Start new conversation
  function startNewChat() {
    setConversationId(undefined);

    setMessages([]);

    setDraft("");

    setError(null);

    setHistoryOpen(false);

    stickToBottom.current = true;

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  // Open previous conversation
  function openConversation(row: ConversationRow) {
    setConversationId(row._id);

    setMessages(conversationToMessages(row));

    setError(null);

    setHistoryOpen(false);

    stickToBottom.current = true;
  }

  // Send chat message
  async function sendMessage(text: string) {
    const message = text.trim();

    if (!message || busy) return;

    setError(null);

    setBusy(true);

    setDraft("");

    stickToBottom.current = true;

    const userId = newId();

    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        role: "user",
        content: message,
      },
    ]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          agent: "MARRIAGE_GURU",
          message,
          conversationId,
          ui: true,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message || `${MARRIAGE_GURU_NAME} could not respond right now`);

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

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    void sendMessage(draft);
  }

  // Copy assistant response
  async function copyMessage(message: ChatMessage) {
    const text = message.ui?.format === "openui" ? message.ui.code : message.content;

    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(message.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 1600);
    } catch {
      // Ignore clipboard errors.
    }
  }

  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  // =====================================================
  // SIDEBAR
  // Header and footer fixed.
  // Entire middle section independently scrollable.
  // =====================================================

  const sidebar = (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      {/* Fixed sidebar header */}
      <div className="border-border/50 from-rose/[0.07] flex h-[68px] min-h-[68px] w-full shrink-0 items-center gap-2 border-b bg-gradient-to-r to-transparent px-4 pt-[env(safe-area-inset-top)] lg:pt-0">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <AiGuruAvatar size="sm" className="border-rose/30 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{MARRIAGE_GURU_NAME}</p>

            <p className="text-muted-foreground truncate text-[11px]">
              Marriage timing & vivaha guidance
            </p>
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

      {/* Independently scrollable history area */}
      <div
        className="scrollbar-premium min-h-0 min-w-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain px-2.5 py-3"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarGutter: "stable",
        }}
      >
        {/* New conversation */}
        <button
          type="button"
          onClick={startNewChat}
          className="border-border/70 hover:bg-muted/60 mb-4 flex w-full min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />

          <span className="truncate">New conversation</span>
        </button>

        {/* Recent conversations heading */}
        <div className="mb-2 flex items-center justify-between px-1.5">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            Recent conversations
          </p>

          <span className="text-muted-foreground text-[10px]">{recent.length}</span>
        </div>

        {/* Conversation list */}
        {recent.length > 0 ? (
          <div className="flex min-w-0 flex-col gap-1">
            {recent.map((row) => (
              <button
                key={row._id}
                type="button"
                onClick={() => openConversation(row)}
                title={row.title || "Untitled conversation"}
                className={cn(
                  "group flex w-full min-w-0 items-start gap-2",
                  "rounded-lg px-2 py-2.5 text-left transition-colors",
                  conversationId === row._id
                    ? "bg-rose/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <History className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block truncate text-xs leading-snug font-medium">
                    {row.title || "Untitled conversation"}
                  </span>

                  <span className="text-muted-foreground mt-1 block text-[10px] leading-none">
                    {relativeTime(row.updatedAt)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground px-1.5 py-2 text-[11px] leading-relaxed">
            Your marriage readings will appear here as you chat.
          </p>
        )}

        {/* Explore */}
        <div className="mt-5">
          <p className="text-muted-foreground mb-2 px-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
            Explore
          </p>

          <div className="flex flex-col gap-1">
            {prompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void sendMessage(prompt)}
                title={prompt}
                className="group hover:bg-muted/70 flex w-full min-w-0 items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors disabled:opacity-50"
              >
                <Sparkles className="text-rose mt-0.5 h-3.5 w-3.5 shrink-0" />

                <span className="text-muted-foreground group-hover:text-foreground line-clamp-2 min-w-0 flex-1 text-[11px] leading-snug">
                  {prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed chart snapshot footer */}
      <div className="border-border/50 bg-card/80 z-10 w-full shrink-0 border-t p-3">
        <div className="border-border/50 from-rose/[0.08] w-full rounded-xl border bg-gradient-to-br to-transparent px-3 py-3">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
            Chart snapshot
          </p>

          {bundle?.hasChart && bundle.chartSummary ? (
            <>
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
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
                className="text-rose mt-2 flex w-full items-center justify-center gap-1 text-[11px] font-medium hover:underline"
              >
                Open chart & timing
                <ChevronRight className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                Generate your kundli to unlock marriage timing guidance.
              </p>

              <Link
                href={routes.birthDetails}
                className="border-border/70 hover:bg-muted/60 mt-2 flex w-full items-center justify-center rounded-md border px-2 py-2 text-center text-[11px] font-medium"
              >
                Add birth details
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="dashboard-fill-h bg-background flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      {/* Main desktop layout */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* Fixed desktop history sidebar */}
        <aside
          style={{
            width: SIDEBAR_WIDTH,
            minWidth: SIDEBAR_WIDTH,
            maxWidth: SIDEBAR_WIDTH,
            flex: `0 0 ${SIDEBAR_WIDTH}`,
          }}
          className="border-border/50 bg-card/30 hidden h-full min-h-0 flex-col overflow-hidden border-r lg:flex"
        >
          {sidebar}
        </aside>

        {/* Main chat area */}
        <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--rose)_6%,transparent),transparent_42%)]" />

          {/* Header */}
          <header className="border-border/50 from-rose/[0.06] via-background/85 to-background/85 relative z-10 flex min-h-[68px] w-full min-w-0 shrink-0 items-center justify-between gap-2 border-b bg-gradient-to-r px-3 py-2 backdrop-blur-xl sm:h-[68px] sm:px-4 sm:py-0">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {/* Mobile history button */}
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

              <AiGuruAvatar size="md" busy={busy} className="border-rose/30 shrink-0" />

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold sm:text-base">
                    {MARRIAGE_GURU_NAME}
                  </p>

                  <Badge
                    variant="secondary"
                    className="hidden shrink-0 gap-1 px-1.5 py-0 text-[9px] sm:inline-flex"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    OpenUI
                  </Badge>
                </div>

                <p className="text-muted-foreground truncate text-[11px]">
                  {busy
                    ? "Composing your marriage reading…"
                    : bundle?.hasChart
                      ? "Present · marriage timing & vivaha guidance"
                      : "Present · add birth details for timing answers"}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0"
                aria-label="Open chart & timing"
                onClick={() => setChartOpen(true)}
              >
                <Telescope className="h-4 w-4" />
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden shrink-0 gap-1.5 sm:inline-flex"
              >
                <Link href={routes.compatibility}>
                  <Heart className="h-4 w-4" />
                  Compatibility
                </Link>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="hidden shrink-0 gap-1.5 sm:inline-flex"
                onClick={startNewChat}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          </header>

          {/* Scrollable chat messages */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="scrollbar-premium relative z-0 box-border min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
          >
            <div className="mx-auto box-border w-full max-w-4xl min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
              {/* Loading */}
              {loading ? (
                <div
                  className="space-y-3 py-12"
                  role="status"
                  aria-label="Preparing Marriage AI Guru"
                >
                  <div className="skeleton-shimmer mx-auto h-3 w-44 rounded-full" />

                  <div className="skeleton-shimmer mx-auto h-3 w-60 max-w-full rounded-full" />

                  <div className="skeleton-shimmer mx-auto h-3 w-36 rounded-full" />
                </div>
              ) : null}

              {/* Welcome screen */}
              {!loading && !userAsked ? (
                <div className="animate-in fade-in-0 slide-in-from-bottom-2 min-w-0 duration-500">
                  <div className="border-border/45 from-card/80 relative box-border w-full max-w-full min-w-0 overflow-hidden rounded-[1.75rem] border bg-gradient-to-br via-transparent to-transparent px-5 py-7 text-center sm:px-8 sm:py-10">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--rose)_12%,transparent),transparent_58%)]" />

                    <div className="relative min-w-0">
                      <AiGuruAvatar size="lg" className="border-rose/30 mx-auto h-14 w-14" />

                      <h1 className="font-display mt-4 text-[1.7rem] leading-tight tracking-tight sm:text-4xl">
                        Namaste, I am {MARRIAGE_GURU_NAME}
                      </h1>

                      <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed sm:text-[15px]">
                        Ask about marriage timing, spouse themes, manglik, or alliance readiness. I
                        answer from your chart and timing data with live, readable panels.
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

                  {/* Suggested prompts */}
                  <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:mt-5 sm:grid-cols-2">
                    {prompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={busy}
                        onClick={() => void sendMessage(prompt)}
                        className="group border-border/50 bg-card/50 hover:border-rose/40 hover:bg-rose/[0.05] flex w-full min-w-0 items-start gap-2.5 overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition-all disabled:opacity-50"
                      >
                        <Sparkles className="text-rose mt-0.5 h-3.5 w-3.5 shrink-0" />

                        <span className="text-foreground/85 group-hover:text-foreground min-w-0 flex-1 text-[12.5px] leading-snug [overflow-wrap:anywhere] break-words">
                          {prompt}
                        </span>

                        <ChevronRight className="text-muted-foreground group-hover:text-rose mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Chat messages */}
              {messages.length ? (
                <div className="min-w-0 space-y-5 sm:space-y-6">
                  {messages.map((message) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "animate-in fade-in-0 slide-in-from-bottom-1 flex w-full min-w-0 gap-2.5 duration-300 sm:gap-3",
                          isUser ? "justify-end pl-8 sm:pl-16" : "justify-start pr-4 sm:pr-10",
                        )}
                      >
                        {!isUser ? (
                          <AiGuruAvatar
                            size="md"
                            className="border-rose/30 mt-0.5 shrink-0"
                            busy={message.id === lastAssistantId && busy}
                          />
                        ) : null}

                        {/* User message */}
                        {isUser ? (
                          <div className="bg-primary text-primary-foreground box-border w-fit max-w-[min(100%,34rem)] min-w-0 overflow-hidden rounded-[1.35rem] rounded-br-md px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-[var(--shadow-soft)] sm:px-4 sm:py-3 sm:text-sm">
                            <p className="[overflow-wrap:anywhere] whitespace-pre-wrap">
                              {message.content}
                            </p>

                            {message.failed ? (
                              <p className="text-primary-foreground/75 mt-1.5 text-[10px]">
                                Could not send — try again.
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          /* Assistant message */
                          <div className="box-border min-w-0 flex-1 overflow-hidden pl-0.5 sm:pl-1">
                            <div className="mb-1.5 flex min-w-0 items-center gap-2">
                              <p className="text-rose shrink-0 text-[10px] font-semibold tracking-[0.14em] uppercase">
                                {MARRIAGE_GURU_NAME}
                              </p>

                              <span className="bg-border/70 h-px min-w-0 flex-1" />

                              {message.ui?.format === "openui" ? (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="text-muted-foreground h-6 w-6 shrink-0"
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
                              <div className="w-full max-w-full min-w-0 overflow-hidden">
                                <GuruUiView
                                  code={message.ui.code}
                                  animate={message.animate && message.id === lastAssistantId}
                                  onAsk={(prompt) => void sendMessage(prompt)}
                                  className="w-full max-w-full min-w-0"
                                />
                              </div>
                            ) : (
                              <div className="border-border/45 bg-card/55 box-border w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-[1.35rem] rounded-tl-md border px-3.5 py-3 sm:px-4">
                                <GuruMarkdown content={message.content} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Assistant typing */}
                  {busy ? (
                    <div className="flex min-w-0 items-start gap-2.5 pr-4 sm:gap-3 sm:pr-10">
                      <AiGuruAvatar size="md" busy className="border-rose/30 mt-0.5 shrink-0" />

                      <div className="border-border/45 bg-card/55 min-w-0 overflow-hidden rounded-[1.35rem] rounded-tl-md border px-4 py-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="bg-rose/70 h-1.5 w-1.5 shrink-0 animate-bounce rounded-full [animation-delay:0ms]" />

                          <span className="bg-rose/70 h-1.5 w-1.5 shrink-0 animate-bounce rounded-full [animation-delay:150ms]" />

                          <span className="bg-rose/70 h-1.5 w-1.5 shrink-0 animate-bounce rounded-full [animation-delay:300ms]" />

                          <span className="text-muted-foreground ml-2 truncate text-xs">
                            {MARRIAGE_GURU_NAME} is reading your chart…
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

          {/* Composer */}
          <div className="border-border/40 bg-background/95 relative z-10 w-full min-w-0 shrink-0 overflow-hidden border-t backdrop-blur-xl">
            <div className="mx-auto box-border w-full max-w-4xl min-w-0 px-3 pb-2.5 sm:px-6 sm:pb-3 lg:px-8">
              {/* Error */}
              {error ? (
                <div className="border-destructive/30 bg-destructive/5 text-destructive mb-2 rounded-xl border px-3 py-2 text-xs [overflow-wrap:anywhere]">
                  {error}
                </div>
              ) : null}

              {/* Follow-up prompts */}
              {userAsked && !busy ? (
                <div className="scrollbar-hidden mb-2 flex w-full min-w-0 gap-1.5 overflow-x-auto pb-0.5">
                  {prompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="border-border/55 bg-card/60 hover:border-rose/40 hover:bg-rose/[0.05] max-w-[85vw] shrink-0 truncate rounded-full border px-3 py-1.5 text-[11px] transition-colors sm:max-w-none"
                      title={prompt}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Input form */}
              <form
                onSubmit={onSubmit}
                className="border-border/55 bg-card/85 focus-within:border-rose/50 focus-within:ring-rose/15 box-border flex w-full min-w-0 items-end gap-1.5 overflow-hidden rounded-[1.55rem] border p-1.5 shadow-[var(--shadow-elevated)] transition focus-within:ring-2 sm:gap-2 sm:p-2"
              >
                <div className="mb-0.5 ml-1 hidden size-8 shrink-0 items-center justify-center rounded-full sm:flex">
                  <Sparkles className="text-rose h-4 w-4" />
                </div>

                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Ask ${MARRIAGE_GURU_NAME} about timing, spouse, or vivaha…`}
                  rows={1}
                  disabled={busy}
                  className="placeholder:text-muted-foreground/70 box-border max-h-40 min-h-[42px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-[13.5px] leading-relaxed focus-visible:outline-none disabled:opacity-70 sm:px-2.5 sm:text-sm"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();

                      if (!busy && draft.trim()) {
                        onSubmit(event);
                      }
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
                Marriage AI Guru interprets rule-engine data · Enter to send · Shift+Enter for a new
                line
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

      {/* ================================================= */}
      {/* MOBILE CHAT HISTORY DRAWER */}
      {/* ================================================= */}

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent
          side="left"
          className="flex h-[100dvh] w-[min(88vw,18rem)] max-w-[18rem] flex-col overflow-hidden p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Chat history</SheetTitle>

            <SheetDescription>Recent Marriage AI Guru conversations</SheetDescription>
          </SheetHeader>

          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      {/* ================================================= */}
      {/* CHART AND MARRIAGE TIMING DRAWER */}
      {/* ================================================= */}

      <Sheet open={chartOpen} onOpenChange={setChartOpen}>
        <SheetContent
          side="right"
          className="box-border flex h-[100dvh] w-[100vw] max-w-none flex-col overflow-hidden p-0 sm:w-[min(100vw,27rem)]"
        >
          <SheetHeader className="border-border/50 shrink-0 border-b px-4 py-3 text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Telescope className="text-rose h-4 w-4" />
              Chart & marriage timing
            </SheetTitle>

            <SheetDescription className="text-xs">
              Engine-calculated chart and vivaha timing context for Marriage AI Guru.
            </SheetDescription>
          </SheetHeader>

          <div className="scrollbar-premium box-border min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3">
            <GuruChartPanels data={bundle} />

            <MarriageWindowsPanel
              marriageWindows={bundle?.marriageWindows}
              pastMarriageWindows={bundle?.pastMarriageWindows}
              timingFactors={bundle?.timingFactors}
              timingMethodology={bundle?.timingMethodology}
            />

            {bundle?.disclaimer ? (
              <p className="text-muted-foreground mt-2 px-1 text-[10px] leading-relaxed">
                {bundle.disclaimer}
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
