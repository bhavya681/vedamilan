"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mic, Phone, Send, Sparkles, Video } from "lucide-react";
import Pusher from "pusher-js";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { authClient } from "@/lib/auth/client";
import { ChatSkeleton } from "@/components/ui/page-skeletons";

type ChatListItem = {
  id: string;
  otherUserId: string;
  name: string;
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

export default function ChatPage() {
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
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const typingTimer = useRef<number | null>(null);
  const openedWith = useRef<string | null>(null);

  const active = useMemo(
    () => chats.find((item) => item.id === activeId) || chats[0],
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
        } else if (!activeId && list[0]) {
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
    void fetch(`/api/chats/ice-breakers?otherUserId=${active?.otherUserId || ""}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setIceBreakers(json.data.replies || []);
      });
  }, [activeId, active?.otherUserId, loadMessages]);

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

  if (booting) {
    return <ChatSkeleton />;
  }

  return (
    <div className="grid h-[calc(100vh-10rem)] gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="glass-panel overflow-hidden rounded-2xl">
        <div className="border-border/60 border-b p-4">
          <h1 className="font-display text-xl">Messages</h1>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="space-y-1 p-2">
            {chats.length === 0 ? (
              <p className="text-muted-foreground p-3 text-sm">
                No conversations yet. Connect with someone first, then message from Connections.
              </p>
            ) : null}
            {chats.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
                  activeId === conversation.id ? "bg-primary/15" : "hover:bg-muted",
                )}
              >
                <Avatar>
                  <AvatarFallback>
                    {conversation.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{conversation.name}</p>
                    {conversation.unread > 0 ? <Badge>{conversation.unread}</Badge> : null}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{conversation.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <section className="glass-panel flex flex-col overflow-hidden rounded-2xl">
        <header className="border-border/60 flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {active?.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{active?.name || "Select a conversation"}</p>
              <p className="text-muted-foreground text-xs">
                {typing ? "Typing…" : "Secure conversation"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
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
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
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
          <div className="flex flex-wrap gap-2">
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" /> AI suggested replies
            </span>
            {iceBreakers.map((reply) => (
              <Button
                key={reply}
                type="button"
                size="sm"
                variant="outline"
                className="h-auto max-w-full py-2 text-left text-xs whitespace-normal"
                onClick={() => setDraft(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
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
