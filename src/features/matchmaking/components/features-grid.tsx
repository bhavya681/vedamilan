"use client";

import {
  Clock3,
  HeartHandshake,
  MessagesSquare,
  Sparkles,
  Stars,
  UserRoundSearch,
} from "lucide-react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";

const features = [
  {
    icon: UserRoundSearch,
    title: "Intelligent matches",
    body: "Profiles ranked by overall kundli blend—Ashta Koota, Shukra, Manglik, and Moon harmony.",
  },
  {
    icon: Stars,
    title: "Full Vedic kundli",
    body: "North, South, and East charts with planets, nakshatra, dasha, and dignity.",
  },
  {
    icon: HeartHandshake,
    title: "Compatibility reports",
    body: "Guna Milan made clear for you and your family—strengths and areas to discuss.",
  },
  {
    icon: Clock3,
    title: "Marriage timing",
    body: "Dasha and transit confluence to highlight sincere windows, not fear.",
  },
  {
    icon: Sparkles,
    title: "Explainable AI",
    body: "Insight that interprets your chart—never invents planetary positions.",
  },
  {
    icon: MessagesSquare,
    title: "Private messaging",
    body: "Interest → connect → message. Conversations stay intentional and gated.",
  },
];

export function FeaturesGridSection() {
  return (
    <LandingSection id="features" tone="muted">
      <FadeIn>
        <SectionIntro
          eyebrow="Platform"
          title="Built for serious seekers"
          description="Matchmaking with Vedic depth—calm tools for modern professionals and families."
          align="center"
        />
      </FadeIn>
      <div className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--border)] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item, index) => (
          <FadeIn key={item.title} delay={0.04 * index}>
            <article className="bg-card group h-full p-6 transition-colors sm:p-7 md:p-8">
              <div className="border-border/60 bg-muted/40 text-gold group-hover:border-gold/30 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors">
                <item.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-display mt-5 text-xl tracking-tight sm:text-2xl">{item.title}</h3>
              <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{item.body}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
