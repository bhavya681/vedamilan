import Link from "next/link";
import { ArrowRight, Sparkles, Stars } from "lucide-react";

import { PageHeader, AuroraBackground } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard, MatchCard, GlassCard } from "@/components/ui/premium-cards";
import { Timeline } from "@/components/ui/vedic";
import {
  mockDashboardStats,
  mockDasha,
  mockMatches,
  mockAiInsights,
  mockHoroscopeDaily,
  mockUser,
  mockMarriageTiming,
  mockNotifications,
} from "@/lib/mock/vedamilan";
import { routes } from "@/lib/constants/routes";

export default function DashboardPage() {
  const firstName = mockUser.name.split(" ")[0] ?? "friend";

  return (
    <div className="relative space-y-8">
      <AuroraBackground className="opacity-50" />

      <PageHeader
        eyebrow="Good morning"
        title={`Namaste, ${firstName}`}
        description="Your calm workspace for matches, charts, timing, and AI guidance."
        actions={
          <Button asChild>
            <Link href={routes.matches}>
              View matches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockDashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            tone={stat.tone}
          />
        ))}
      </div>

      <div className="relative grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" glow>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-secondary flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
                <Stars className="h-3.5 w-3.5" />
                Today&apos;s horoscope
              </p>
              <h2 className="font-display mt-2 text-2xl sm:text-3xl">
                {mockHoroscopeDaily.rashi} · {mockHoroscopeDaily.date}
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.horoscope}>Open chart</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            {mockHoroscopeDaily.summary}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Love", mockHoroscopeDaily.love],
              ["Career", mockHoroscopeDaily.career],
              ["Health", mockHoroscopeDaily.health],
              ["Spirit", mockHoroscopeDaily.spirituality],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{value}%</span>
                </div>
                <Progress value={Number(value)} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <p className="text-ai flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            AI insight
          </p>
          <h2 className="font-display mt-2 text-xl">{mockAiInsights[0]?.title}</h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {mockAiInsights[0]?.body}
          </p>
          <Button asChild variant="ai" size="sm" className="mt-6">
            <Link href={routes.aiInsights}>All insights</Link>
          </Button>
        </GlassCard>
      </div>

      <div className="relative grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">Recommended for you</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Photo-forward matches with explainable scores
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={routes.matches}>See all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mockMatches.slice(0, 4).map((match) => (
              <MatchCard
                key={match.id}
                name={match.name}
                age={match.age}
                city={match.city}
                profession={match.profession}
                score={match.score}
                aiScore={match.aiScore}
                headline={match.headline}
                photo={match.photo}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <h2 className="font-display text-xl">Marriage windows</h2>
            <div className="mt-4 space-y-3">
              {mockMarriageTiming.slice(0, 2).map((w) => (
                <div
                  key={w.window}
                  className="border-border/50 bg-background/50 rounded-2xl border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-crimson text-xs tracking-wide uppercase">{w.label}</p>
                    <p className="font-display text-brand-dual text-xl">{w.score}</p>
                  </div>
                  <p className="mt-1 text-sm font-medium">{w.window}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href={routes.marriageTiming}>Full timing</Link>
            </Button>
          </GlassCard>

          <Card className="glass-panel border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xl">Dasha pulse</CardTitle>
              <CardDescription>Active mahadasha theme</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline
                items={mockDasha.slice(0, 3).map((d) => ({
                  title: d.planet,
                  subtitle: d.theme,
                  meta: `${d.start.slice(0, 4)} → ${d.end.slice(0, 4)}`,
                  active: d.active,
                }))}
              />
            </CardContent>
          </Card>

          <GlassCard>
            <h2 className="font-display text-xl">Activity</h2>
            <ul className="mt-4 space-y-3">
              {mockNotifications.slice(0, 3).map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {n.body} · {n.time}
                  </p>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
              <Link href={routes.notifications}>All notifications</Link>
            </Button>
          </GlassCard>

          <GlassCard glow className="bg-navy text-ivory">
            <p className="text-gold text-[11px] tracking-[0.18em] uppercase">Premium</p>
            <h2 className="font-display mt-2 text-2xl">Unlock full intelligence</h2>
            <p className="text-ivory/75 mt-2 text-sm">
              Timing reports, unlimited compatibility, and priority ranking.
            </p>
            <Button asChild className="mt-5" variant="secondary">
              <Link href={routes.premium}>Explore Sangam</Link>
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
