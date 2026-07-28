"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, MessageCircle, Sparkles, Users } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { ContentReveal, ListSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type Person = {
  id?: string;
  otherUserId: string;
  name: string;
  city?: string | null;
  profession?: string | null;
  photo?: string | null;
  age?: number | null;
  message?: string;
  mutual?: boolean;
  connectedAt?: string;
};

type Hub = {
  interested: {
    sent: Person[];
    received: Person[];
    mutual: Person[];
  };
  requests: {
    received: Person[];
    sent: Person[];
  };
  connected: Person[];
  templates: string[];
};

type Tab = "interested" | "requests" | "connected";

function PersonRow({
  person,
  subtitle,
  actions,
}: {
  person: Person;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <GlassCard className="!p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            {person.photo ? (
              <Image src={person.photo} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="bg-brand-dual-soft absolute inset-0" />
            )}
          </div>
          <div>
            <Link
              href={`${routes.matchProfile}?id=${person.otherUserId}`}
              className="font-medium hover:underline"
            >
              {person.name}
            </Link>
            <p className="text-muted-foreground text-sm">
              {[person.age, person.city, person.profession].filter(Boolean).join(" · ") || "Member"}
            </p>
            {subtitle ? <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p> : null}
            {person.message ? (
              <p className="text-foreground/80 mt-1.5 text-sm italic">
                &ldquo;{person.message}&rdquo;
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </GlassCard>
  );
}

export default function ConnectionsPage() {
  const t = useT();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("interested");
  const [hub, setHub] = useState<Hub | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/connections");
    const json = await res.json();
    if (!json.success) {
      setError(json.error?.message || "Failed to load");
      return;
    }
    setHub(json.data);
    setError(null);
  }, []);

  useEffect(() => {
    void load().catch(() => setError("Failed to load connections"));
  }, [load]);

  async function requestAction(id: string, action: "accept" | "decline" | "withdraw") {
    setBusy(id);
    await fetch(`/api/connections/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
    setBusy(null);
  }

  async function connect(otherUserId: string) {
    setBusy(otherUserId);
    await fetch("/api/connections/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: otherUserId }),
    });
    await load();
    setBusy(null);
    setTab("requests");
  }

  async function message(otherUserId: string) {
    setBusy(otherUserId);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId }),
    });
    const json = await res.json();
    setBusy(null);
    if (json.success) router.push(`${routes.chat}?with=${otherUserId}`);
  }

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    {
      id: "interested",
      label: "Interested",
      count:
        (hub?.interested.mutual.length || 0) +
        (hub?.interested.received.length || 0) +
        (hub?.interested.sent.length || 0),
    },
    {
      id: "requests",
      label: "Requests",
      count: (hub?.requests.received.length || 0) + (hub?.requests.sent.length || 0),
    },
    {
      id: "connected",
      label: "Connected",
      count: hub?.connected.length || 0,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("pages.connectionsTitle")}
        description="Interest is curiosity. Mutual interest is shared openness. Connection is intention."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.matches}>{t("pages.browseMatches")}</Link>
          </Button>
        }
      />

      <div className="border-border/60 flex gap-1 overflow-x-auto rounded-xl border p-1 [-webkit-overflow-scrolling:touch]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex min-w-[7rem] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
            <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {!hub ? (
        <div className="space-y-4" role="status" aria-label="Loading connections">
          <div className="skeleton-shimmer h-11 w-full rounded-xl" />
          <ListSkeleton rows={4} />
        </div>
      ) : (
        <ContentReveal>
          {tab === "interested" ? (
            <div className="space-y-8">
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-gold h-4 w-4" />
                  <h2 className="font-display text-xl">Mutual Interest</h2>
                </div>
                {hub.interested.mutual.length ? (
                  hub.interested.mutual.map((p) => (
                    <PersonRow
                      key={p.otherUserId}
                      person={p}
                      subtitle={t("pages.connectionsMutual")}
                      actions={
                        <>
                          <Button
                            size="sm"
                            disabled={busy === p.otherUserId}
                            onClick={() => void connect(p.otherUserId)}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            Connect
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`${routes.compatibility}?candidate=${p.otherUserId}`}>
                              Compatibility
                            </Link>
                          </Button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No mutual interest yet.</p>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl">Interested in you</h2>
                {hub.interested.received.filter((r) => !r.mutual).length ? (
                  hub.interested.received
                    .filter((r) => !r.mutual)
                    .map((p) => (
                      <PersonRow
                        key={p.otherUserId}
                        person={p}
                        subtitle="They're interested in getting to know you."
                        actions={
                          <Button asChild size="sm" variant="outline">
                            <Link href={`${routes.matchProfile}?id=${p.otherUserId}`}>
                              View profile
                            </Link>
                          </Button>
                        }
                      />
                    ))
                ) : (
                  <p className="text-muted-foreground text-sm">No new interest signals.</p>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-xl">You expressed interest</h2>
                {hub.interested.sent.filter((s) => !s.mutual).length ? (
                  hub.interested.sent
                    .filter((s) => !s.mutual)
                    .map((p) => (
                      <PersonRow
                        key={p.otherUserId}
                        person={p}
                        subtitle="You're interested in getting to know them."
                        actions={
                          <Button asChild size="sm" variant="outline">
                            <Link href={`${routes.matchProfile}?id=${p.otherUserId}`}>
                              View profile
                            </Link>
                          </Button>
                        }
                      />
                    ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Mark Interested on profiles that resonate with you.
                  </p>
                )}
              </section>
            </div>
          ) : tab === "requests" ? (
            <div className="space-y-8">
              <section className="space-y-3">
                <h2 className="font-display text-xl">Received</h2>
                {hub.requests.received.length ? (
                  hub.requests.received.map((p) => (
                    <PersonRow
                      key={p.id || p.otherUserId}
                      person={p}
                      subtitle="Connection request"
                      actions={
                        <>
                          <Button
                            size="sm"
                            disabled={busy === p.id}
                            onClick={() => void requestAction(p.id!, "accept")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === p.id}
                            onClick={() => void requestAction(p.id!, "decline")}
                          >
                            Decline
                          </Button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No pending requests.</p>
                )}
              </section>
              <section className="space-y-3">
                <h2 className="font-display text-xl">Sent</h2>
                {hub.requests.sent.length ? (
                  hub.requests.sent.map((p) => (
                    <PersonRow
                      key={p.id || p.otherUserId}
                      person={p}
                      subtitle="Waiting for their response."
                      actions={
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === p.id}
                          onClick={() => void requestAction(p.id!, "withdraw")}
                        >
                          Withdraw
                        </Button>
                      }
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No outgoing requests.</p>
                )}
              </section>
            </div>
          ) : hub.connected.length ? (
            <div className="space-y-3">
              {hub.connected.map((p) => (
                <PersonRow
                  key={p.id || p.otherUserId}
                  person={p}
                  subtitle={t("pages.connectionsConnected")}
                  actions={
                    <>
                      <Button asChild size="sm">
                        <Link href={`${routes.yourConnection}?partner=${p.otherUserId}`}>
                          Your Connection
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy === p.otherUserId}
                        onClick={() => void message(p.otherUserId)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`${routes.matchProfile}?id=${p.otherUserId}`}>Profile</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`${routes.compatibility}?candidate=${p.otherUserId}`}>
                          Compatibility
                        </Link>
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title={t("pages.connectionsEmpty")}
              description={t("pages.connectionsEmptyHint")}
              action={
                <Button asChild>
                  <Link href={routes.matches}>{t("pages.browseMatches")}</Link>
                </Button>
              }
            />
          )}
        </ContentReveal>
      )}
    </div>
  );
}
