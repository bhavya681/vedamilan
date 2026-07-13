"use client";

import Link from "next/link";
import { useState } from "react";
import { Mic, Phone, Send, Sparkles, Video } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { mockAiReplies, mockConversations } from "@/lib/mock/phase1";
import { routes } from "@/lib/constants/routes";

export default function ChatPage() {
  const [activeId, setActiveId] = useState(mockConversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const active = mockConversations.find((item) => item.id === activeId) ?? mockConversations[0];

  return (
    <div className="grid h-[calc(100vh-10rem)] gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="glass-panel overflow-hidden rounded-2xl">
        <div className="border-border/60 border-b p-4">
          <h1 className="font-display text-xl">Messages</h1>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="space-y-1 p-2">
            {mockConversations.map((conversation) => (
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
              <p className="font-medium">{active?.name}</p>
              <p className="text-muted-foreground text-xs">
                {active?.online ? "Online" : "Last seen recently"}
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

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {active?.messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.from === "me" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    message.from === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  <p>{message.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">{message.time}</p>
                </div>
              </div>
            ))}
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
            {mockAiReplies.map((reply) => (
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
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setDraft("");
              setTyping(true);
              window.setTimeout(() => setTyping(false), 1500);
            }}
          >
            <Button type="button" size="icon" variant="outline" aria-label="Record voice note">
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a thoughtful message"
              aria-label="Message"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
