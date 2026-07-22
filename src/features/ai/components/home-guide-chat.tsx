"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AI_GURU_NAME, AiGuruAvatar, AiGuruLabel } from "@/features/ai/components/ai-guru-identity";
import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { cn } from "@/lib/utils/cn";

type Msg = { role: "user" | "assistant"; content: string };

const OPENING = `Namaste — I am **${AI_GURU_NAME}**. Ask how VedaMilan works: kundli, matching, compatibility, insights, pricing, or privacy. I will guide you with calm clarity.`;

const PROMPTS = [
  "How does VedaMilan work?",
  "How do I generate my kundli?",
  "How does matching work?",
  "What is compatibility / Guna Milan?",
  `What can ${AI_GURU_NAME} help me with?`,
];

export function HomeGuideChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: OPENING }]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setError(null);
    setBusy(true);
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const res = await fetch("/api/ai/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || `${AI_GURU_NAME} could not reply right now`);
        setBusy(false);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: json.data.answer }]);
    } catch {
      setError("Connection issue — please try again");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="home-guide-chat"
        className={cn(
          "border-gold/30 bg-navy text-ivory hover:bg-navy/95 shadow-elevated fixed right-4 bottom-4 z-40 h-12 gap-2 rounded-full border px-4 transition-opacity sm:right-6 sm:bottom-6",
          open && "pointer-events-none opacity-0",
        )}
      >
        <AiGuruAvatar size="sm" className="border-gold/40" />
        <span className="text-sm font-medium">Ask {AI_GURU_NAME}</span>
      </Button>

      <button
        type="button"
        aria-label={`Close ${AI_GURU_NAME}`}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        ref={panelRef}
        id="home-guide-chat"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-guide-title"
        className={cn(
          "border-border/50 bg-background shadow-elevated fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="from-navy to-cosmic text-ivory relative shrink-0 overflow-hidden border-b bg-gradient-to-r via-[#1a140f] px-4 py-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.2),transparent_55%)]" />
          <div className="relative flex items-start gap-3">
            <AiGuruAvatar size="lg" className="border-gold/40 mt-0.5" />
            <div className="min-w-0 flex-1 pr-8">
              <h2 id="home-guide-title" className="font-display text-xl">
                {AI_GURU_NAME}
              </h2>
              <p className="text-ivory/65 mt-1 text-xs">
                Sacred guidance for kundli, matching & the path ahead
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ivory/70 hover:text-ivory absolute top-3 right-3 rounded-full p-2 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3.5 px-4 py-4">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={`${m.role}-${i}`}
                  className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser ? <AiGuruAvatar size="sm" className="mt-0.5" /> : null}
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3.5 py-2.5",
                      isUser
                        ? "bg-navy text-ivory rounded-br-md"
                        : "border-border/50 bg-card rounded-bl-md border shadow-sm",
                    )}
                  >
                    {!isUser ? <AiGuruLabel className="mb-1.5" /> : null}
                    <GuruMarkdown content={m.content} tone={isUser ? "user" : "assistant"} />
                  </div>
                </div>
              );
            })}
            {busy ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <AiGuruAvatar size="sm" busy />
                {AI_GURU_NAME} is reflecting…
              </div>
            ) : null}
            {error ? <p className="text-destructive text-xs">{error}</p> : null}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-border/40 bg-background/95 shrink-0 border-t backdrop-blur-sm">
          <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-3 pt-3 [&::-webkit-scrollbar]:hidden">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void send(prompt)}
                className="border-border/60 hover:border-gold/40 hover:bg-gold/5 shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex items-end gap-2 p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder={`Ask ${AI_GURU_NAME} about matching, kundli, or the app…`}
              className="border-input bg-background focus-visible:ring-gold/40 max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl border px-3 py-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
              className="h-11 w-11 shrink-0 rounded-2xl"
              aria-label="Send"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
