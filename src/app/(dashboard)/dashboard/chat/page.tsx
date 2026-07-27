"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Ban, ChevronLeft, Mic, Phone, Send, MessageSquareText, Video, X } from "lucide-react";
import Pusher from "pusher-js";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { authClient } from "@/lib/auth/client";
import { ChatSkeleton } from "@/components/ui/page-skeletons";
import { TranslateMessageButton } from "@/components/i18n/translate-message-button";
import { useT } from "@/components/i18n/i18n-provider";

const ICE_BREAKERS_HIDDEN_KEY = "vedamilan.chat.ice-breakers.hidden.v1";

type ChatListItem = {
  id: string;
  otherUserId: string;
  name: string;
  photo: string | null;
  preview: string;
  unread: number;
};

type ChatMessage = {
  _id: string;
  senderId: string;
  body: string;
  type: string;
  mediaUrl?: string | null;
  durationSec?: number | null;
  createdAt?: string;
  readBy?: string[];
};

function initials(name: string) {
  return name
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function readHiddenIceBreakerChats(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(ICE_BREAKERS_HIDDEN_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function writeHiddenIceBreakerChats(ids: Set<string>) {
  window.localStorage.setItem(ICE_BREAKERS_HIDDEN_KEY, JSON.stringify([...ids]));
}

export default function ChatPage() {
  const t = useT();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");
  const { data: session } = authClient.useSession();
  const meId = session?.user?.id || "";
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [iceBreakers, setIceBreakers] = useState<string[]>([]);
  const [iceBreakersHidden, setIceBreakersHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const typingTimer = useRef<number | null>(null);
  const openedWith = useRef<string | null>(null);

  const active = useMemo(
    () => chats.find((item) => item.id === activeId) ?? null,
    [chats, activeId],
  );

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Failed to load chats");
      return [] as ChatListItem[];
    }
    const list = (json.data.chats || []) as ChatListItem[];
    setChats(list);
    return list;
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    const res = await fetch(`/api/chats/${chatId}/messages?limit=80`);
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Failed to load messages");
      return;
    }
    setMessages(json.data.data || []);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        let list = await loadChats();
        if (withUserId && openedWith.current !== withUserId) {
          openedWith.current = withUserId;
          const existing = list.find((c) => c.otherUserId === withUserId);
          if (existing) {
            setActiveId(existing.id);
          } else {
            const createRes = await fetch("/api/chats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ otherUserId: withUserId }),
            });
            const createJson = await createRes.json();
            if (!createJson.success) {
              setError(createJson.error?.message || "Messaging requires a connection");
            } else {
              list = await loadChats();
              const created = list.find((c) => c.otherUserId === withUserId);
              if (created) setActiveId(created.id);
            }
          }
        } else if (
          !activeId &&
          list[0] &&
          typeof window !== "undefined" &&
          window.matchMedia("(min-width: 1024px)").matches
        ) {
          setActiveId(list[0].id);
        }
      } catch {
        setError("Failed to load chats");
      } finally {
        setBooting(false);
      }
    })();
  }, [loadChats, withUserId, activeId]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    setIceBreakersHidden(readHiddenIceBreakerChats().has(activeId));
    void fetch(`/api/chats/ice-breakers?otherUserId=${active?.otherUserId || ""}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setIceBreakers(json.data.replies || []);
      });
  }, [activeId, active?.otherUserId, loadMessages]);

  function hideIceBreakers() {
    if (!activeId) return;
    const next = readHiddenIceBreakerChats();
    next.add(activeId);
    writeHiddenIceBreakerChats(next);
    setIceBreakersHidden(true);
  }

  function showIceBreakers() {
    if (!activeId) return;
    const next = readHiddenIceBreakerChats();
    next.delete(activeId);
    writeHiddenIceBreakerChats(next);
    setIceBreakersHidden(false);
  }

  function useIceBreaker(reply: string) {
    setDraft(reply);
    // Show suggestions only once — hide after picking one.
    hideIceBreakers();
  }

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster || !activeId) return;

    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
    });
    const channel = pusher.subscribe(`private-chat-${activeId}`);
    channel.bind("message:new", (payload: { message: ChatMessage }) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === payload.message._id)) return prev;
        return [...prev, payload.message];
      });
      void loadChats();
    });
    channel.bind("message:read", (payload: { userId?: string; chatId?: string }) => {
      if (!payload.userId || payload.userId === meId) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.senderId !== meId) return m;
          const readBy = Array.from(new Set([...(m.readBy || []), payload.userId!]));
          return { ...m, readBy };
        }),
      );
    });
    channel.bind("typing", (payload: { userId: string; isTyping: boolean }) => {
      if (payload.userId !== meId) setTyping(payload.isTyping);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-chat-${activeId}`);
      pusher.disconnect();
    };
  }, [activeId, meId, loadChats]);

  async function sendTyping(isTyping: boolean) {
    if (!activeId) return;
    await fetch(`/api/chats/${activeId}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTyping }),
    });
  }

  async function onSend(event: React.FormEvent) {
    event.preventDefault();
    if (!activeId || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    await sendTyping(false);
    const res = await fetch(`/api/chats/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, type: "TEXT", clientMessageId: crypto.randomUUID() }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Send failed");
      return;
    }
    setMessages((prev) => {
      if (prev.some((m) => m._id === json.data.message._id)) return prev;
      return [...prev, json.data.message];
    });
    hideIceBreakers();
    await loadChats();
  }

  function onDraftChange(value: string) {
    setDraft(value);
    void sendTyping(true);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      void sendTyping(false);
    }, 1200);
  }

  async function onVoiceNote() {
    if (!activeId) return;
    // Voice notes: store as VOICE with duration placeholder until Cloudinary recording upload is attached.
    const res = await fetch(`/api/chats/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "VOICE",
        body: "Voice note",
        durationSec: 5,
        clientMessageId: crypto.randomUUID(),
      }),
    });
    const json = await res.json();
    if (json.success) {
      setMessages((prev) => [...prev, json.data.message]);
    }
  }

  async function onBlock() {
    if (!active?.otherUserId) return;
    const ok = window.confirm(
      `Block ${active.name}? You will no longer be able to message each other.`,
    );
    if (!ok) return;
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId: active.otherUserId }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Unable to block member");
      return;
    }
    setActiveId("");
    setMessages([]);
    await loadChats();
  }

  if (booting) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex h-[min(42rem,calc(100dvh-11.5rem))] min-h-[28rem] min-w-0 flex-col gap-3 sm:h-[min(44rem,calc(100dvh-10rem))] sm:gap-4 md:h-[calc(100dvh-9rem)] lg:grid lg:h-[calc(100dvh-9rem)] lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <aside
        className={cn(
          "glass-panel flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl",
          activeId ? "hidden max-h-none lg:flex" : "flex max-h-none flex-1",
        )}
      >
        <div className="border-border/60 shrink-0 border-b p-4">
          <h1 className="font-display text-xl">{t("pages.messagesTitle")}</h1>
        </div>
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="w-full max-w-full space-y-1 p-2">
            {chats.length === 0 ? (
              <p className="text-muted-foreground p-3 text-sm">{t("pages.messagesEmpty")}</p>
            ) : null}
            {chats.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={cn(
                  "flex w-full max-w-full min-w-0 items-start gap-3 overflow-hidden rounded-xl p-3 text-left transition-colors",
                  activeId === conversation.id ? "bg-primary/15" : "hover:bg-muted",
                )}
              >
                <Avatar className="size-10 shrink-0">
                  {conversation.photo ? (
                    <AvatarImage src={conversation.photo} alt={conversation.name} />
                  ) : null}
                  <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium">{conversation.name}</p>
                    {conversation.unread > 0 ? (
                      <Badge className="shrink-0">{conversation.unread}</Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground block w-full truncate text-xs">
                    {conversation.preview}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <section
        className={cn(
          "glass-panel flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl",
          activeId ? "flex flex-1" : "hidden lg:flex",
        )}
      >
        <header className="border-border/60 flex items-center justify-between gap-2 border-b px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {activeId ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 shrink-0 lg:hidden"
                aria-label="Back to conversations"
                onClick={() => setActiveId("")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : null}
            <Avatar className="size-9 shrink-0 sm:size-10">
              {active?.photo ? <AvatarImage src={active.photo} alt={active.name} /> : null}
              <AvatarFallback>{active?.name ? initials(active.name) : "?"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">
                {active?.name || t("pages.selectConversation")}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {typing ? t("pages.typing") : t("pages.secureConversation")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            {active?.otherUserId ? (
              <Button
                size="icon"
                variant="outline"
                aria-label="Block member"
                onClick={() => void onBlock()}
              >
                <Ban className="h-4 w-4" />
              </Button>
            ) : null}
            <Button size="icon" variant="outline" aria-label="Audio call">
              <Phone className="h-4 w-4" />
            </Button>
            <Button asChild size="icon" variant="outline" aria-label="Video call">
              <Link href={routes.chatVideo}>
                <Video className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        {error ? <p className="text-destructive px-4 pt-2 text-sm">{error}</p> : null}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => {
              const mine = message.senderId === meId;
              return (
                <div
                  key={message._id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[min(100%,20rem)] rounded-2xl px-3 py-2 text-sm sm:max-w-[80%]",
                      mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <p>
                      {message.type === "VOICE"
                        ? `🎤 Voice note${message.durationSec ? ` (${message.durationSec}s)` : ""}`
                        : message.type === "IMAGE"
                          ? "📷 Photo"
                          : message.body}
                    </p>
                    {!mine && message.type === "TEXT" && message.body ? (
                      <TranslateMessageButton text={message.body} />
                    ) : null}
                    <p className="mt-1 text-[10px] opacity-70">
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                      {mine && message.readBy && message.readBy.length > 1 ? " · Read" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            {typing ? (
              <p className="text-muted-foreground text-xs" aria-live="polite">
                {active?.name} is typing…
              </p>
            ) : null}
          </div>
        </ScrollArea>

        <div className="border-border/60 space-y-3 border-t p-4">
          {iceBreakers.length > 0 ? (
            iceBreakersHidden ? (
              <button
                type="button"
                onClick={showIceBreakers}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                Show suggested replies
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <MessageSquareText className="h-3.5 w-3.5" /> Suggested replies
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground h-7 px-2 text-xs"
                    onClick={hideIceBreakers}
                    aria-label="Hide AI suggestions"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Hide
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {iceBreakers.map((reply) => (
                    <Button
                      key={reply}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-auto max-w-full py-2 text-left text-xs whitespace-normal"
                      onClick={() => useIceBreaker(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            )
          ) : null}
          <form className="flex items-center gap-2" onSubmit={onSend}>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Record voice note"
              onClick={() => void onVoiceNote()}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Write a thoughtful message"
              aria-label="Message"
              disabled={!activeId}
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={!activeId}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
