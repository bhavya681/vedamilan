"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection, SectionIntro } from "@/components/layout/landing-section";
import { landingImages } from "@/lib/constants/images";

const testimonials = [
  {
    name: "Ananya & Rohan",
    location: "Bengaluru",
    quote:
      "The compatibility report gave our families a shared language. It felt premium, private, and deeply respectful.",
    image: landingImages.testimonials[0],
  },
  {
    name: "Meera Shah",
    location: "Mumbai",
    quote:
      "I finally found a platform that treats Vedic astrology as craft—not a gimmick. The AI matches were surprisingly thoughtful.",
    image: landingImages.testimonials[1],
  },
  {
    name: "Kabir & Sana",
    location: "Delhi NCR",
    quote:
      "From horoscope clarity to calm messaging, VedaMilan felt like a guided ritual rather than endless scrolling.",
    image: landingImages.testimonials[2],
  },
];

export function TestimonialsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection tone="muted">
      <FadeIn>
        <SectionIntro
          eyebrow="Members"
          title="Trusted by intentional seekers"
          description="Voices from people who chose clarity over endless browsing."
          align="center"
        />
      </FadeIn>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <FadeIn key={item.name} delay={index * 0.08}>
            <motion.figure
              whileHover={reduceMotion ? undefined : { y: -3 }}
              className="border-border/60 bg-card shadow-soft flex h-full flex-col overflow-hidden rounded-[1.35rem] border"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="from-card absolute inset-0 bg-gradient-to-t to-transparent" />
              </div>
              <div className="flex flex-1 flex-col px-5 pt-2 pb-6 sm:px-6">
                <blockquote className="text-foreground/90 text-sm leading-relaxed">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-[color:var(--border)] pt-4">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.location}</p>
                </figcaption>
              </div>
            </motion.figure>
          </FadeIn>
        ))}
      </div>
    </LandingSection>
  );
}
