"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { EmptyState, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/premium-cards";
import { YourConnectionSpace } from "@/features/relationship-journey/your-connection-space";
import { useT } from "@/components/i18n/i18n-provider";
import { routes } from "@/lib/constants/routes";

type ConnectedPerson = {
  otherUserId: string;
  name: string;
  city?: string | null;
  profession?: string | null;
};

export default function YourConnectionClient() {
  const t = useT();
  const search = useSearchParams();
  const partnerFromQuery = search.get("partner") || search.get("id") || "";
  const [connected, setConnected] = useState<ConnectedPerson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!partnerFromQuery);

  useEffect(() => {
    if (partnerFromQuery) return;
    void fetch("/api/connections")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Could not load connections");
          return;
        }
        setConnected(json.data?.connected || []);
      })
      .catch(() => setError("Could not load connections"))
      .finally(() => setLoading(false));
  }, [partnerFromQuery]);

  if (partnerFromQuery) {
    return <YourConnectionSpace partnerUserId={partnerFromQuery} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("pages.yourConnectionTitle")}
        description={t("relationship.choosePartner")}
      />
      {error ? (
        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-2xl border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="space-y-3 py-6">
          <div className="skeleton-shimmer h-4 w-40 rounded-full" />
          <div className="skeleton-shimmer h-4 w-64 max-w-full rounded-full" />
        </div>
      ) : connected.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {connected.map((person) => (
            <GlassCard key={person.otherUserId} className="!p-4">
              <p className="font-medium">{person.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {[person.city, person.profession].filter(Boolean).join(" · ") || "Connected"}
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href={`${routes.yourConnection}?partner=${person.otherUserId}`}>
                  Open Your Connection
                </Link>
              </Button>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("pages.yourConnectionEmpty")}
          description={t("pages.yourConnectionEmptyHint")}
          action={
            <Button asChild>
              <Link href={routes.connections}>{t("navigation.connections")}</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
