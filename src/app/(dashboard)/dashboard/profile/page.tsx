import Link from "next/link";
import Image from "next/image";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard, StatCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import { mockUser, mockBirthDetails, mockPreferences, mockAiInsights } from "@/lib/mock/vedamilan";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="relative space-y-8">
      <PageHeader
        eyebrow="Identity"
        title="Your profile"
        description="A calm portrait of who you are—values, planets, and relationship intent."
        actions={
          <Button asChild>
            <Link href={routes.editProfile}>Edit profile</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="bg-navy relative aspect-[16/10] w-full">
            <Image
              src={mockUser.photos[0] ?? ""}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover opacity-90"
            />
            <div className="from-navy via-navy/20 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="text-ivory absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl sm:text-4xl">{mockUser.name}</h2>
                  <p className="text-ivory/75 mt-2 text-sm">
                    {mockUser.age} · {mockUser.city} · {mockUser.profession}
                  </p>
                </div>
                <div className="border-gold/40 bg-navy/50 flex h-16 w-16 items-center justify-center rounded-full border backdrop-blur-md">
                  <span className="font-display text-gold text-xl">{mockUser.profileStrength}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge>{mockUser.membership}</Badge>
              {mockUser.verified ? <Badge variant="secondary">Verified</Badge> : null}
              <Badge variant="outline">{mockUser.education}</Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              {mockUser.about}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                  Birth
                </p>
                <p className="mt-1 text-sm">
                  {mockBirthDetails.date} · {mockBirthDetails.time}
                </p>
                <p className="text-muted-foreground text-sm">{mockBirthDetails.place}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                  Chart
                </p>
                <p className="mt-1 text-sm">
                  Lagna {mockBirthDetails.lagna} · Moon {mockBirthDetails.rashi}
                </p>
                <p className="text-muted-foreground text-sm">
                  {mockBirthDetails.nakshatra} pada {mockBirthDetails.pada}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <StatCard
            label="Profile strength"
            value={`${mockUser.profileStrength}%`}
            hint="Add family details"
            tone="gold"
          />
          <GlassCard glow>
            <p className="text-ai text-[11px] tracking-[0.16em] uppercase">AI explanation</p>
            <h3 className="font-display mt-2 text-xl">{mockAiInsights[0]?.title}</h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {mockAiInsights[0]?.body}
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-xl">Partner preferences</h3>
            <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
              <li>
                Age {mockPreferences.ageRange[0]}–{mockPreferences.ageRange[1]}
              </li>
              <li>{mockPreferences.cities.join(" · ")}</li>
              <li>{mockPreferences.education.join(" · ")}</li>
              <li>Diet: {mockPreferences.diet.join(", ")}</li>
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link href={routes.preferences}>Edit preferences</Link>
            </Button>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-xl">Relationship goals</h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Seeking a thoughtful partnership rooted in mutual respect, shared rituals, and room
              for ambition.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
