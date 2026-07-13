import { Sparkles, Stars, HeartHandshake } from "lucide-react";

import { FadeIn } from "@/components/animations/motion";

const pillars = [
  {
    icon: Sparkles,
    title: "AI Matchmaking",
    body: "Multi-signal ranking blends personality, preferences, and astrological harmony into clear compatibility scores.",
  },
  {
    icon: Stars,
    title: "Vedic Horoscope",
    body: "Natal charts powered by Swiss Ephemeris deliver precise planetary positions for kundali and dasha insights.",
  },
  {
    icon: HeartHandshake,
    title: "Trusted Compatibility",
    body: "Guna Milan, manglik analysis, and values alignment help families and couples decide with confidence.",
  },
];

export function PillarsSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="pillars-heading"
    >
      <FadeIn>
        <h2 id="pillars-heading" className="font-display text-foreground text-3xl sm:text-4xl">
          Built for intentional unions
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Every layer of VedaMilan AI is designed for clarity—never noise—so your search feels
          ceremonial, private, and decisive.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pillars.map((item, index) => (
          <FadeIn key={item.title} delay={0.08 * index}>
            <article className="glass-panel h-full rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
              <item.icon className="text-primary h-6 w-6" aria-hidden="true" />
              <h3 className="font-display mt-4 text-2xl">{item.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.body}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
