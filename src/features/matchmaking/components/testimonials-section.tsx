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
      "From horoscope clarity to calm messaging, VedaMilan AI felt like a guided ritual rather than endless scrolling.",
    image: landingImages.testimonials[2],
  },
];

export function TestimonialsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection tone="muted">
      <FadeIn>
        <SectionIntro
          eyebrow="Testimonials"
          title="Stories of aligned beginnings"
          description="Voices from members who chose intention over endless browsing."
        />
      </FadeIn>
      <div className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <FadeIn key={item.name} delay={index * 0.08}>
            <motion.figure
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <div className="relative h-40 w-full overflow-hidden sm:h-44">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="from-background/85 absolute inset-0 bg-gradient-to-t to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <blockquote className="text-foreground/90 text-sm leading-relaxed">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6">
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
