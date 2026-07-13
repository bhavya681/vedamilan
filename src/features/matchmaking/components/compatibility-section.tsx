import { FadeIn } from "@/components/animations/motion";

const points = [
  {
    title: "Guna Milan scoring",
    body: "Ashtakoot evaluation with transparent score breakdowns for families and advisors.",
  },
  {
    title: "Dosha awareness",
    body: "Manglik and related indicators presented with context—never fear-based framing.",
  },
  {
    title: "Shared values map",
    body: "Beyond charts: faith, family, career, and lifestyle preferences in one narrative.",
  },
];

export function CompatibilitySection() {
  return (
    <section
      id="compatibility"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="compatibility-heading"
    >
      <FadeIn>
        <h2 id="compatibility-heading" className="font-display text-3xl sm:text-4xl">
          Compatibility with depth
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Combine classical Vedic measures with modern preference modeling for decisions that feel
          both spiritual and practical.
        </p>
      </FadeIn>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {points.map((point, index) => (
          <FadeIn key={point.title} delay={index * 0.08}>
            <article className="border-border/60 from-card to-accent/30 h-full rounded-2xl border bg-gradient-to-br p-6">
              <h3 className="font-display text-2xl">{point.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{point.body}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
