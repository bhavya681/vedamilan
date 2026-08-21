"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import {
  Ban,
  EyeOff,
  Lock,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternationalGlobe, PlaceIndex } from "@/features/landing/components/international-globe";
import { editorial } from "@/features/landing/lib/images";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;

function KundliMini() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-current" aria-hidden>
      <rect x="8" y="8" width="84" height="84" fill="none" stroke="currentColor" opacity="0.35" />
      <polygon points="50,8 92,50 50,92 8,50" fill="none" stroke="#D4AF37" strokeWidth="1.1" />
      <line x1="8" y1="8" x2="92" y2="92" stroke="currentColor" opacity="0.2" />
      <line x1="92" y1="8" x2="8" y2="92" stroke="currentColor" opacity="0.2" />
    </svg>
  );
}

function VedicStill({
  src,
  alt,
  caption,
  children,
}: {
  src: string;
  alt: string;
  caption?: string;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, ease }}
      >
        <Image src={src} alt={alt} fill sizes="320px" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.15)_0%,rgba(20,17,14,0.72)_100%)]" />
      {children}
      {caption ? (
        <p className="font-display absolute right-4 bottom-4 left-4 text-2xl text-[#F7F1E3]">{caption}</p>
      ) : null}
    </div>
  );
}

export function AstrologyExplained() {
  const content = [
    {
      title: "The kundli",
      description:
        "A Lahiri sidereal chart from Swiss Ephemeris. Engine calculated — the same positions used everywhere in VedaMilan.",
      content: (
        <VedicStill src={editorial.vedic.sky.src} alt={editorial.vedic.sky.alt} caption="North Indian chart">
          <div className="text-ivory absolute inset-0 flex items-center justify-center p-10">
            <KundliMini />
          </div>
        </VedicStill>
      ),
    },
    {
      title: "Planets",
      description: "Grahas in bhavas. AI does not invent planetary positions.",
      content: (
        <VedicStill src={editorial.vedic.milkyWay.src} alt={editorial.vedic.milkyWay.alt}>
          <div className="text-ivory absolute inset-x-0 bottom-0 space-y-1 p-5 text-sm">
            {["Sun · 10th", "Moon · 4th", "Venus · 7th", "Jupiter · 9th"].map((row) => (
              <p key={row} className="border-ivory/15 border-t py-1.5">
                {row}
              </p>
            ))}
          </div>
        </VedicStill>
      ),
    },
    {
      title: "Nakshatra",
      description: "Lunar mansion and pada — texture behind temperament and timing.",
      content: (
        <VedicStill
          src={editorial.vedic.moon.src}
          alt={editorial.vedic.moon.alt}
          caption="Hasta · pada 2"
        />
      ),
    },
    {
      title: "Dasha, yogas, transits",
      description: "Life chapters and combinations, translated into language you can sit with.",
      content: (
        <VedicStill src={editorial.vedic.horizon.src} alt={editorial.vedic.horizon.alt} caption="Mahadasha">
          <div className="absolute inset-x-5 top-8 space-y-2">
            <div className="h-1 w-4/5 bg-[#D4AF37]/80" />
            <div className="h-1 w-3/5 bg-[#D4AF37]/50" />
            <div className="h-1 w-2/5 bg-[#D4AF37]/30" />
          </div>
        </VedicStill>
      ),
    },
  ];

  return (
    <LandingSection id="vedic" className="scroll-mt-24">
      <div className="mb-10 grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="max-w-2xl">
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Vedic intelligence
          </p>
          <h2 className="font-display text-foreground mt-3 text-3xl tracking-tight sm:text-5xl">
            Ancient wisdom. Clearly explained.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
            VedaMilan uses traditional Vedic calculations and translates complex chart information
            into understandable insights.
          </p>
        </div>
        <dl className="border-border/60 grid gap-5 border-t pt-5 sm:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div>
            <dt className="text-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              Engine calculated
            </dt>
            <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Positions come from the chart engine. AI does not invent the sky.
            </dd>
          </div>
          <div>
            <dt className="text-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              AI explained
            </dt>
            <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">
              The same numbers, in language you can sit with.
            </dd>
          </div>
        </dl>
      </div>
      <StickyScroll content={content} />
    </LandingSection>
  );
}

export function CompatibilityStudio() {
  return (
    <LandingSection tone="muted">
      <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
        Compatibility studio
      </p>
      <h2 className="font-display mt-3 max-w-xl text-3xl tracking-tight sm:text-5xl">
        One connection. Deeper understanding.
      </h2>
      <Tabs defaultValue="compatibility" className="mt-10">
        <TabsList aria-label="Studio views">
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
          <TabsTrigger value="goals">Life Goals</TabsTrigger>
          <TabsTrigger value="vedic">Vedic</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="guidance">AI Guidance</TabsTrigger>
        </TabsList>
        <TabsContent value="compatibility" className="mt-8">
          <StudioPanel
            score="91%"
            title="Strengths sit beside conversations."
            body="Your charts show strong communication indicators, while your life goals suggest a conversation around relocation."
          />
        </TabsContent>
        <TabsContent value="goals" className="mt-8">
          <StudioPanel
            score="Strong"
            title="Life goals"
            body="Career pace is aligned. Location is the open question — worth discussing, not a verdict."
          />
        </TabsContent>
        <TabsContent value="vedic" className="mt-8">
          <StudioPanel
            score="32 / 36"
            title="Ashta Koota"
            body="Traditional Vedic indicators suggest warmth in Moon and Venus themes. This is interpretation, not certainty."
          />
        </TabsContent>
        <TabsContent value="questions" className="mt-8">
          <StudioPanel
            score="3"
            title="Things to ask"
            body="How close should parents be to weekly life? What does the next city need to offer both of you?"
          />
        </TabsContent>
        <TabsContent value="guidance" className="mt-8">
          <StudioPanel
            score="Calm"
            title="AI as advisor"
            body="AI explains what the engine calculated. It does not predict a soulmate, and it does not invent the sky."
          />
        </TabsContent>
      </Tabs>
    </LandingSection>
  );
}

function StudioPanel({ score, title, body }: { score: string; title: string; body: string }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.4fr_1fr] lg:items-start">
      <p className="font-display text-5xl">{score}</p>
      <div>
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
          {body}
        </p>
      </div>
    </div>
  );
}

const SPACE_PANES = [
  {
    label: "Compatibility",
    kicker: "Read together",
    display: "92%",
    body: "Vedic, life goals, and values in one place — guidance, not a verdict.",
  },
  {
    label: "Values",
    kicker: "Where you meet",
    display: "Family · Pace",
    body: "A calm household, close to parents, with room for work and travel in the same week.",
  },
  {
    label: "Conversation",
    kicker: "Private",
    display: "Mutual only",
    body: "A conversation space opens after both people are Interested. Nothing is public before that.",
  },
  {
    label: "Questions",
    kicker: "Worth asking",
    display: "Two to sit with",
    body: "How close should family be to weekly life? What does the next city need to offer both of you?",
  },
  {
    label: "Dates",
    kicker: "Shared time",
    display: "First visit",
    body: "Milestones you choose together — a walk, a meal, a weekend with parents — kept in this space.",
  },
  {
    label: "Guidance",
    kicker: "Calm",
    display: "AI explained",
    body: "The same engine numbers, in language you can sit with. AI does not invent the sky.",
  },
] as const;

export function CoupleSpacePreview() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const pane = SPACE_PANES[active];

  return (
    <LandingSection>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
        <FadeIn>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Couple space
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-5xl">
            Once you connect, the journey continues.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base">
            Your private space to understand each other — compatibility, values, conversation,
            questions, dates, and calm guidance.
          </p>
          <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs tracking-[0.14em] uppercase">
            <Lock className="text-secondary h-3.5 w-3.5" aria-hidden />
            Mutual · private
          </p>
          <Button asChild className="mt-7">
            <Link href={routes.yourConnection}>See Your Connection</Link>
          </Button>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="relative aspect-[5/4] min-h-[22rem] sm:min-h-[26rem]">
              <motion.div
                className="absolute inset-0"
                initial={reduceMotion ? false : { scale: 1.06 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease }}
              >
                <Image
                  src={editorial.conversation.src}
                  alt={editorial.conversation.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.2)_0%,rgba(20,17,14,0.28)_38%,rgba(20,17,14,0.82)_100%)]" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/12" />

              <div className="absolute top-4 right-4 left-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[editorial.you.src, editorial.partner.src].map((src) => (
                      <span
                        key={src}
                        className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#14110E]"
                      >
                        <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                    ))}
                  </div>
                  <div className="text-[#F7F1E3]">
                    <p className="text-sm">Bhavya · Aarohi</p>
                    <p className="text-ivory/55 text-[10px] tracking-[0.16em] uppercase">
                      Illustrative
                    </p>
                  </div>
                </div>
                <p className="border-ivory/20 bg-[#14110E]/50 text-ivory hidden rounded-full border px-3 py-1 text-[10px] tracking-[0.16em] uppercase backdrop-blur-md sm:block">
                  Private
                </p>
              </div>

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                <div className="border-ivory/15 bg-[#14110E]/70 rounded-xl border p-4 text-[#F7F1E3] shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-5">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {SPACE_PANES.map((item, i) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setActive(i)}
                        className={cn(
                          "text-[11px] tracking-[0.14em] uppercase transition-colors duration-300",
                          i === active ? "text-ivory" : "text-ivory/45 hover:text-ivory/75",
                        )}
                        aria-current={i === active ? "true" : undefined}
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1 block h-px origin-left bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            i === active ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <motion.div
                    key={pane.label}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                    className="mt-4"
                  >
                    <p className="text-ivory/50 text-[10px] tracking-[0.16em] uppercase">
                      {pane.kicker}
                    </p>
                    <p className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                      {pane.display}
                    </p>
                    <p className="text-ivory/80 mt-2 max-w-md text-sm leading-relaxed">{pane.body}</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </LandingSection>
  );
}

const KNOWLEDGE = [
  {
    title: "Planets",
    kicker: "Grahas",
    body: "Positions in bhavas. The engine calculates them. AI does not invent the sky.",
    href: routes.grahaKatha,
    img: editorial.vedic.sky,
  },
  {
    title: "Nakshatras",
    kicker: "Lunar mansions",
    body: "Pada and temperament — the texture behind timing.",
    href: routes.astrologyNakshatra,
    img: editorial.vedic.moon,
  },
  {
    title: "Yogas",
    kicker: "Combinations",
    body: "Chart combinations, translated into language you can sit with.",
    href: routes.astrologyYogas,
    img: editorial.vedic.milkyWay,
  },
  {
    title: "Dashas",
    kicker: "Life chapters",
    body: "Mahadasha and bhukti as chapters, not a countdown.",
    href: routes.dasha,
    img: editorial.vedic.horizon,
  },
  {
    title: "Panchanga",
    kicker: "The day",
    body: "Tithi, yoga, karana — the day as a five-limbed clock.",
    href: routes.astrologyPanchanga,
    img: editorial.vedic.lake,
  },
  {
    title: "Vedic Stories",
    kicker: "Katha",
    body: "The narratives behind the grahas, kept close to the calculation.",
    href: routes.grahaKatha,
    img: editorial.vedic.milkyWay,
  },
  {
    title: "Numerology",
    kicker: "Numbers",
    body: "Another reading of the same life — beside the chart, not instead of it.",
    href: routes.numerology,
    img: editorial.vedic.horizon,
  },
  {
    title: "Sages & Gurus",
    kicker: "Classical voices",
    body: "Ask with care. The sages answer from tradition, not from invention.",
    href: routes.askTheSages,
    img: { src: "/images/sages/vyasa.png", alt: "" },
    contain: true,
  },
] as const;

export function VedicKnowledge() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const topic = KNOWLEDGE[active];

  return (
    <LandingSection>
      <FadeIn>
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          Vedic knowledge
        </p>
        <h2 className="font-display mt-3 max-w-xl text-3xl tracking-tight sm:text-5xl">
          Explore the wisdom behind the chart.
        </h2>
      </FadeIn>

      <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
        <FadeIn>
          <Link
            href={topic.href}
            className="bg-navy group relative block aspect-[5/4] overflow-hidden rounded-2xl sm:min-h-[28rem]"
          >
            {KNOWLEDGE.map((item, i) => (
              <motion.div
                key={item.title}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: active === i ? 1 : 0,
                  scale: active === i || reduceMotion ? 1 : 1.04,
                }}
                transition={{ duration: reduceMotion ? 0 : 0.55, ease }}
              >
                <Image
                  src={item.img.src}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={cn(
                    "object-cover",
                    "contain" in item && item.contain && "object-contain p-10 sm:p-14",
                  )}
                />
              </motion.div>
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.12)_0%,rgba(20,17,14,0.2)_40%,rgba(20,17,14,0.82)_100%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/12" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-ivory/55 text-[10px] tracking-[0.18em] uppercase">{topic.kicker}</p>
              <p className="font-display mt-2 text-3xl text-[#F7F1E3] sm:text-4xl">{topic.title}</p>
              <p className="text-ivory/80 mt-3 max-w-md text-sm leading-relaxed">{topic.body}</p>
              <span className="text-ivory mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
                Open
                <span
                  aria-hidden
                  className="bg-gold h-px w-6 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-150"
                />
              </span>
            </div>
          </Link>
        </FadeIn>

        <nav aria-label="Chart wisdom" className="flex flex-col justify-center">
          <ol>
            {KNOWLEDGE.map((item, i) => (
              <li key={item.title} className="border-border/50 border-t last:border-b">
                <Link
                  href={item.href}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="flex items-baseline gap-4 py-3.5 sm:py-4"
                >
                  <span
                    className={cn(
                      "w-8 shrink-0 text-xs tabular-nums transition-colors duration-300",
                      i === active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={cn(
                      "font-display min-w-0 flex-1 text-xl tracking-tight transition-colors duration-300 sm:text-2xl",
                      i === active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[11px] tracking-[0.12em] uppercase sm:block",
                      i === active ? "text-secondary" : "text-muted-foreground/70",
                    )}
                  >
                    {item.kicker}
                  </span>
                </Link>
                <motion.span
                  aria-hidden
                  className="block h-px origin-left bg-[#D4AF37]"
                  initial={false}
                  animate={{ scaleX: i === active ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease }}
                />
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </LandingSection>
  );
}

export function AiGuidance() {
  return (
    <LandingSection id="gurus" className="scroll-mt-24" tone="muted">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            AI Vedic guidance
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-5xl">
            Ask deeper questions.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
            AI explains calculated Vedic information. It does not replace professional advice.
          </p>
          <Button asChild className="mt-7">
            <Link href={routes.aiInsights}>Ask a question</Link>
          </Button>
        </div>
        <div className="bg-card space-y-4 rounded-2xl border p-5 sm:p-6">
          <p className="text-muted-foreground text-sm">You</p>
          <p className="text-sm leading-relaxed">
            What does my 7th house suggest about partnership?
          </p>
          <p className="text-muted-foreground text-sm">AI Guru</p>
          <p className="text-sm leading-relaxed">
            Your 7th house is traditionally associated with partnership and marriage. Based on your
            calculated chart, I can explain the planets placed there — not invent new ones.
          </p>
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
            Text · Voice · Follow-up
          </p>
        </div>
      </div>
    </LandingSection>
  );
}

const SAFETY = [
  { title: "Verified profiles", body: "Profiles can carry a verification mark in the product.", icon: ShieldCheck },
  { title: "Privacy controls", body: "You choose what of the chart and profile is visible.", icon: SlidersHorizontal },
  { title: "Block", body: "Blocked members stay out of your search and messages.", icon: Ban },
  { title: "Secure messaging", body: "Conversation opens when interest is mutual.", icon: MessageCircle },
  { title: "Photo and chart privacy", body: "Birth details and photos stay in a private workspace.", icon: EyeOff },
  { title: "Profile controls", body: "Visibility, interests, and online status are yours to set.", icon: Lock },
];

export function SafetyTrust() {
  return (
    <LandingSection>
      <h2 className="font-display max-w-xl text-3xl tracking-tight sm:text-5xl">
        Built for meaningful connections, with your privacy in mind.
      </h2>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {SAFETY.map((item) => (
          <div key={item.title}>
            <item.icon className="text-secondary h-5 w-5" aria-hidden />
            <h3 className="font-display mt-3 text-xl">{item.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

export function International() {
  const [active, setActive] = useState(0);

  return (
    <LandingSection tone="muted">
      <FadeIn>
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          International
        </p>
        <h2 className="font-display mt-3 max-w-xl text-3xl tracking-tight sm:text-5xl">
          Wherever life takes you, find someone aligned with your journey.
        </h2>
      </FadeIn>
      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
        <FadeIn>
          <InternationalGlobe active={active} onActive={setActive} />
        </FadeIn>
        <FadeIn delay={0.08}>
          <PlaceIndex active={active} onActive={setActive} />
        </FadeIn>
      </div>
    </LandingSection>
  );
}
