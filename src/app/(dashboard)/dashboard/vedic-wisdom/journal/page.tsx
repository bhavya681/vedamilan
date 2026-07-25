"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

type Entry = {
  _id: string;
  guideName?: string;
  category?: string;
  question?: string;
  insight: string;
  reflection?: string;
  createdAt?: string;
};

export default function WisdomJournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/wisdom/journal");
        const json = await res.json();
        if (res.ok) setEntries(json.data.entries || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <ContentReveal className="space-y-8">
        <PageHeader
          title="Wisdom Journal"
          description="Private reflections you chose to save — never shared publicly."
          actions={
            <Button asChild variant="outline">
              <Link href={routes.vedicWisdom}>Explore wisdom</Link>
            </Button>
          }
        />

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading journal…</p>
        ) : entries.length === 0 ? (
          <EmptyState
            title="No saved reflections yet"
            description="During a wisdom conversation, save an insight to revisit it here — for marriage, career, family, or personal growth."
            action={
              <Button asChild>
                <Link href={routes.vedicWisdom}>Begin a conversation</Link>
              </Button>
            }
          />
        ) : (
          <div className="divide-border/60 divide-y">
            {entries.map((e) => (
              <article key={e._id} className="space-y-2 py-5">
                <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {e.category ? <span>{e.category}</span> : null}
                  {e.guideName ? <span>· {e.guideName}</span> : null}
                  {e.createdAt ? <span>· {new Date(e.createdAt).toLocaleDateString()}</span> : null}
                </div>
                {e.question ? (
                  <p className="font-display text-lg leading-snug">{e.question}</p>
                ) : null}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {e.insight.slice(0, 600)}
                  {e.insight.length > 600 ? "…" : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </ContentReveal>
    </div>
  );
}
