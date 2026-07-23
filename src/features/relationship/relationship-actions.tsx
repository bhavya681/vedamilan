"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Link2, MessageCircle, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export type RelationshipStatePayload = {
  state:
    | "NONE"
    | "INTERESTED"
    | "INTERESTED_BY_OTHER"
    | "MUTUAL_INTEREST"
    | "REQUEST_SENT"
    | "REQUEST_RECEIVED"
    | "CONNECTED"
    | "DECLINED"
    | "BLOCKED"
    | "REMOVED";
  canMessage: boolean;
  canConnect: boolean;
  canInterest: boolean;
  canUndoInterest: boolean;
  pendingRequestId: string | null;
  requestMessage: string | null;
};

const STATE_COPY: Record<RelationshipStatePayload["state"], string> = {
  NONE: "Express interest if you'd like to get to know them.",
  INTERESTED: "Interest sent — they'll see your soft signal.",
  INTERESTED_BY_OTHER: "They're interested in getting to know you.",
  MUTUAL_INTEREST: "You're both interested. Connect when you're ready.",
  REQUEST_SENT: "Connection request pending their response.",
  REQUEST_RECEIVED: "They sent you a connection request.",
  CONNECTED: "You're connected — you can message each other.",
  DECLINED: "Previous request was declined. Mutual interest can reopen Connect.",
  BLOCKED: "This conversation path is unavailable.",
  REMOVED: "Connection was removed. You may express interest again.",
};

type Props = {
  otherUserId: string;
  className?: string;
  compact?: boolean;
  onStateChange?: (state: RelationshipStatePayload) => void;
};

export function RelationshipActions({ otherUserId, className, compact, onStateChange }: Props) {
  const router = useRouter();
  const [rel, setRel] = useState<RelationshipStatePayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [templates, setTemplates] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/connections?with=${encodeURIComponent(otherUserId)}`);
    const json = await res.json();
    if (json.success) {
      setRel(json.data);
      onStateChange?.(json.data);
    }
  }, [otherUserId, onStateChange]);

  useEffect(() => {
    void load().catch(() => setError("Could not load connection status"));
  }, [load]);

  useEffect(() => {
    void fetch("/api/connections")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.templates)) {
          setTemplates(json.data.templates);
        }
      })
      .catch(() => undefined);
  }, []);

  async function run(action: () => Promise<Response>) {
    setBusy(true);
    setError(null);
    try {
      const res = await action();
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Something went wrong");
        await load();
        return;
      }
      if (json.data?.state) {
        setRel(json.data);
        onStateChange?.(json.data);
      } else {
        await load();
      }
      setShowNote(false);
    } catch {
      setError("Something went wrong. Please try again.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function expressInterest() {
    await run(() =>
      fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: otherUserId }),
      }),
    );
  }

  async function undoInterest() {
    await run(() =>
      fetch(`/api/interests?toUserId=${encodeURIComponent(otherUserId)}`, {
        method: "DELETE",
      }),
    );
  }

  async function sendConnect() {
    await run(() =>
      fetch("/api/connections/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: otherUserId, message: note }),
      }),
    );
  }

  async function acceptRequest() {
    if (!rel?.pendingRequestId) return;
    await run(() =>
      fetch(`/api/connections/requests/${rel.pendingRequestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      }),
    );
  }

  async function declineRequest() {
    if (!rel?.pendingRequestId) return;
    await run(() =>
      fetch(`/api/connections/requests/${rel.pendingRequestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      }),
    );
  }

  async function withdrawRequest() {
    if (!rel?.pendingRequestId) return;
    await run(() =>
      fetch(`/api/connections/requests/${rel.pendingRequestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      }),
    );
  }

  async function startMessage() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Messaging requires a connection");
        return;
      }
      router.push(`${routes.chat}?with=${otherUserId}`);
    } catch {
      setError("Could not open conversation");
    } finally {
      setBusy(false);
    }
  }

  if (!rel) {
    return (
      <p className={cn("text-muted-foreground text-sm", className)}>Loading connection status…</p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {!compact ? (
        <p className="text-muted-foreground text-sm leading-relaxed">{STATE_COPY[rel.state]}</p>
      ) : null}

      {rel.state === "MUTUAL_INTEREST" ? (
        <div className="border-gold/40 bg-gold/5 rounded-xl border px-3 py-2.5 text-sm">
          <p className="font-medium">Mutual Interest</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            You&apos;re both open to getting to know each other.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {rel.canInterest ? (
          <Button type="button" disabled={busy} onClick={() => void expressInterest()}>
            <Sparkles className="h-4 w-4" />
            Interested
          </Button>
        ) : null}

        {rel.canUndoInterest && (rel.state === "INTERESTED" || rel.state === "MUTUAL_INTEREST") ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void undoInterest()}
          >
            <Undo2 className="h-4 w-4" />
            {rel.state === "INTERESTED" ? "Undo interest" : "Undo my interest"}
          </Button>
        ) : null}

        {rel.state === "INTERESTED" ? (
          <Button type="button" variant="secondary" disabled>
            Interested ✓
          </Button>
        ) : null}

        {rel.canConnect ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => setShowNote((v) => !v)}
          >
            <Link2 className="h-4 w-4" />
            Connect
          </Button>
        ) : null}

        {rel.state === "REQUEST_SENT" ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void withdrawRequest()}
          >
            Withdraw request
          </Button>
        ) : null}

        {rel.state === "REQUEST_RECEIVED" ? (
          <>
            <Button type="button" disabled={busy} onClick={() => void acceptRequest()}>
              Accept
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void declineRequest()}
            >
              Decline
            </Button>
          </>
        ) : null}

        {rel.canMessage ? (
          <Button type="button" disabled={busy} onClick={() => void startMessage()}>
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        ) : null}
      </div>

      {showNote ? (
        <div className="border-border/70 bg-card space-y-2 rounded-xl border p-3">
          <p className="text-sm font-medium">Optional note (max 250)</p>
          <textarea
            className="border-input bg-background focus-visible:ring-ring min-h-[80px] w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            maxLength={250}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="I'd love to explore our compatibility and get to know you better."
          />
          {templates.length ? (
            <div className="flex flex-col gap-1.5">
              {templates.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="border-border/60 text-muted-foreground hover:bg-muted rounded-lg border px-2.5 py-1.5 text-left text-xs"
                  onClick={() => setNote(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={() => void sendConnect()}>
              Send connection request
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => setShowNote(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
