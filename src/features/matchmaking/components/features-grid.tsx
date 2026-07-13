"use client";

import {
  Sparkles,
  Stars,
  HeartHandshake,
  Clock3,
  MessagesSquare,
  FileText,
  UserRoundSearch,
  Orbit,
} from "lucide-react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";

const features = [
  {
    icon: UserRoundSearch,
    title: "AI Matchmaking",
    body: "Explainable partner rankings across values, lifestyle, and Vedic harmony.",
  },
  {
    icon: Stars,
    title: "Kundli Engine",
    body: "North, South, and East chart views with planet dignity and yogas.",
  },
  {
    icon: HeartHandshake,
    title: "Compatibility",
    body: "Ashta Koota scoring with rose-gold clarity for families.",
  },
  {
    icon: Clock3,
    title: "Marriage Timing",
    body: "Activation windows grounded in dasha and transit confluence.",
  },
  {
    icon: Orbit,
    title: "Dasha & Transit",
    body: "Timelines that feel navigable—never ominous.",
  },
  {
    icon: Sparkles,
    title: "AI Relationship Coach",
    body: "Conversation guidance and insight cards with confidence scores.",
  },
  {
    icon: MessagesSquare,
    title: "Expert Consultation",
    body: "Book verified astrologers with transparent specialties.",
  },
  {
    icon: FileText,
    title: "Premium Reports",
    body: "Downloadable dossiers for kundli, compatibility, and timing.",
  },
];

export function FeaturesGridSection() {
  return (
    <LandingSection id="features" tone="soft">
      <FadeIn>
        <SectionIntro
          eyebrow="Platform"
          title="Everything a Vedic relationship OS needs"
          description="Not just matrimony—complete intelligence for seekers, couples, and families."
        />
      </FadeIn>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {features.map((item, index) => (
          <FadeIn key={item.title} delay={0.04 * index}>
            <article className="glass-panel group h-full rounded-2xl p-5 transition duration-300 hover:-translate-y-1 sm:rounded-3xl sm:p-6">
              <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex h-10 w-10 items-center justify-center rounded-xl transition">
                <item.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-display mt-4 text-xl sm:text-2xl">{item.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
