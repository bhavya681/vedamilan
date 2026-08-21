"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  HeartHandshake,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { FadeIn } from "@/components/animations/motion";
import { LandingSection } from "@/components/layout/landing-section";
import { Button } from "@/components/ui/button";
import { editorial } from "@/features/landing/lib/images";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const TRUST = [
  { label: "Vedic Compatibility", icon: Sparkles },
  { label: "Human Preferences", icon: Users },
  { label: "AI Explained", icon: HeartHandshake },
  { label: "Privacy First", icon: Lock },
  { label: "Global Matchmaking", icon: ShieldCheck },
] as const;

const LAYERS = ["Preferences", "Values", "Life Goals", "Vedic Compatibility"];

export function TrustStrip() {
  return (
    <LandingSection innerClassName="!py-8 sm:!py-10">
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {TRUST.map((item) => (
          <li key={item.label} className="text-muted-foreground flex items-center gap-2 text-sm">
            <item.icon className="text-secondary h-4 w-4" aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}

export function NotJustAMatch() {
  return (
    <LandingSection tone="muted">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <FadeIn>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            The difference
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight text-balance sm:text-5xl">
            Not every good profile is a good life partner.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-md text-sm leading-relaxed sm:text-base">
            VedaMilan looks beyond surface-level preferences to understand how two people may align
            across values, goals, personality and Vedic compatibility.
          </p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="relative mx-auto max-w-md">
            <div className="flex items-end justify-center gap-4">
              <Portrait src={editorial.you.src} name="Person A" />
              <Portrait src={editorial.partner.src} name="Person B" />
            </div>
            <ol className="mt-8 space-y-0">
              {LAYERS.map((layer, i) => (
                <li
                  key={layer}
                  className="border-border/60 flex items-center justify-between border-b py-3 text-sm"
                >
                  <span className="text-muted-foreground tabular-nums">0{i + 1}</span>
                  <span>{layer}</span>
                </li>
              ))}
            </ol>
            <p className="font-display mt-6 text-center text-2xl">Relationship Alignment</p>
          </div>
        </FadeIn>
      </div>
    </LandingSection>
  );
}

function Portrait({ src, name }: { src: string; name: string }) {
  return (
    <figure className="w-1/2">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        <Image src={src} alt="" fill sizes="220px" className="object-cover" />
      </div>
      <figcaption className="text-muted-foreground mt-2 text-center text-xs tracking-[0.14em] uppercase">
        {name}
      </figcaption>
    </figure>
  );
}

type DiscoverPerson = (typeof editorial.profiles)[number];

function ScoreMark({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const dim = size === "sm" ? 40 : 52;
  const r = size === "sm" ? 15 : 20;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div
      className="relative shrink-0"
      style={{ width: dim, height: dim }}
      aria-label={`${score} percent compatibility`}
    >
      <svg viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90" aria-hidden>
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="rgba(247,241,227,0.22)"
          strokeWidth="1.5"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-ivory absolute inset-0 flex items-center justify-center text-[11px] leading-none tabular-nums">
        {score}
      </span>
    </div>
  );
}

function DiscoverCard({
  person,
  featured = false,
}: {
  person: DiscoverPerson;
  featured?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: featured ? -4 : -3 }}
      transition={{ duration: 0.45, ease }}
      className="h-full"
    >
      <Link
        href={routes.register}
        className={[
          "group relative block h-full overflow-hidden rounded-2xl",
          featured
            ? "aspect-[4/5] lg:aspect-auto lg:min-h-[32rem]"
            : "aspect-[4/5] lg:aspect-[16/7]",
        ].join(" ")}
      >
        <Image
          src={person.src}
          alt=""
          fill
          sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 28vw"}
          className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,14,0.08)_0%,rgba(20,17,14,0.12)_42%,rgba(20,17,14,0.82)_100%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/12" />

        <div className="absolute top-4 right-4 rounded-full bg-[#14110E]/45 p-1 backdrop-blur-md">
          <ScoreMark score={person.score} size={featured ? "md" : "sm"} />
        </div>

        <div className={featured ? "absolute inset-x-0 bottom-0 p-6 sm:p-7" : "absolute inset-x-0 bottom-0 p-4 sm:p-5"}>
          <p className="text-ivory/60 text-[10px] tracking-[0.18em] uppercase">
            {person.city} · {person.profession}
          </p>
          <h3
            className={[
              "font-display text-ivory mt-1.5 tracking-tight",
              featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
            ].join(" ")}
          >
            {person.name}
            <span className="text-ivory/70 font-sans text-base font-normal tracking-normal sm:text-lg">
              {" "}
              · {person.age}
            </span>
          </h3>
          <p
            className={[
              "text-ivory/82 mt-2 leading-relaxed",
              featured ? "max-w-sm text-sm sm:text-base" : "line-clamp-2 text-xs sm:text-sm",
            ].join(" ")}
          >
            {person.headline}
          </p>
          <span className="text-ivory mt-4 inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
            Interested
            <span
              aria-hidden
              className="bg-gold h-px w-6 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-150"
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function DiscoverMatches() {
  const [featured, ...rest] = editorial.profiles;

  return (
    <LandingSection id="discover" className="scroll-mt-24">
      <FadeIn>
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          Discover
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl tracking-tight text-balance sm:text-5xl">
          Meet people who make sense for your journey.
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-relaxed">
          Illustrative profiles. In the product, Interested is mutual — and respectful.
        </p>
      </FadeIn>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
        <FadeIn>
          <DiscoverCard person={featured} featured />
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {rest.map((person, i) => (
            <FadeIn key={person.name} delay={0.06 * (i + 1)}>
              <DiscoverCard person={person} />
            </FadeIn>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

export function CompatibilityVisual() {
  return (
    <LandingSection id="compatibility" className="scroll-mt-24" tone="muted">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          Vedic compatibility
        </p>
        <h2 className="font-display mt-3 text-3xl tracking-tight text-balance sm:text-5xl">
          See what brings two charts together.
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed">
          Traditional Vedic indicators suggest areas of strength and conversation. This is an
          astrological interpretation, not a certainty.
        </p>
      </div>
      <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <ChartPreview label="You" src={editorial.you.src} />
        <div className="text-center">
          <p className="font-display text-6xl tabular-nums sm:text-7xl">91%</p>
          <p className="text-muted-foreground mt-1 text-xs tracking-[0.16em] uppercase">
            Compatibility
          </p>
        </div>
        <ChartPreview label="Partner" src={editorial.partner.src} />
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
        {[
          ["Potential strengths", "Communication and shared family tempo."],
          ["Areas worth exploring", "Relocation timing and daily rhythm."],
          ["What to discuss", "How close family stays in weekly life."],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="font-display text-xl">{title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

function ChartPreview({ label, src }: { label: string; src: string }) {
  return (
    <div className="mx-auto w-full max-w-[14rem]">
      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full">
        <Image src={src} alt="" fill sizes="80px" className="object-cover" />
      </div>
      <p className="mt-3 text-center text-xs tracking-[0.16em] uppercase">{label}</p>
      <svg viewBox="0 0 100 100" className="text-foreground mx-auto mt-4 h-28 w-28" aria-hidden>
        <rect x="6" y="6" width="88" height="88" fill="none" stroke="currentColor" opacity="0.25" />
        <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="#C47A1A" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

const PATH = [
  ["Marriage timing", "1–2 years", "1–3 years", "Strongly aligned"],
  ["Location", "Pune / Mumbai", "Open to relocation", "Worth discussing"],
  ["Career", "High priority", "High priority", "Strongly aligned"],
  ["Family", "Important", "Close, with space", "Worth discussing"],
  ["Children", "Yes", "Yes", "Strongly aligned"],
  ["Lifestyle", "Urban", "Urban, quieter weekends", "Different perspectives"],
] as const;

const ALIGN_TONE = {
  "Strongly aligned": { value: 0.92, bar: "bg-[#D4AF37]", stroke: "#D4AF37" },
  "Worth discussing": { value: 0.64, bar: "bg-[#C47A1A]", stroke: "#C47A1A" },
  "Different perspectives": { value: 0.4, bar: "bg-[#1F3A5F]", stroke: "#1F3A5F" },
} as const;

function polarPoint(index: number, total: number, radius: number, cx: number, cy: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
}

function LifePathRadar() {
  const reduceMotion = useReducedMotion();
  const cx = 160;
  const cy = 168;
  const maxR = 104;
  const values = PATH.map((row) => ALIGN_TONE[row[3]].value);
  const polygon = PATH.map((_, i) => polarPoint(i, PATH.length, maxR * values[i], cx, cy))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 320 320" className="text-foreground mx-auto h-auto w-full max-w-md" aria-hidden>
      {[0.34, 0.67, 1].map((ring) => (
        <polygon
          key={ring}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          points={PATH.map((_, i) => polarPoint(i, PATH.length, maxR * ring, cx, cy)).join(" ")}
        />
      ))}
      {PATH.map((row, i) => {
        const [x, y] = polarPoint(i, PATH.length, maxR, cx, cy);
        return <line key={row[0]} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.12} />;
      })}
      <motion.polygon
        points={polygon}
        fill="rgba(212,175,55,0.16)"
        stroke="#D4AF37"
        strokeWidth="1.6"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.35 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {PATH.map((row, i) => {
        const [x, y] = polarPoint(i, PATH.length, maxR * values[i], cx, cy);
        return (
          <motion.circle
            key={row[0]}
            cx={x}
            cy={y}
            r="3.5"
            fill="#F7F1E3"
            stroke={ALIGN_TONE[row[3]].stroke}
            strokeWidth="1.5"
            initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 * i, ease }}
          />
        );
      })}
      {PATH.map((row, i) => {
        const [x, y] = polarPoint(i, PATH.length, maxR + 28, cx, cy);
        return (
          <text
            key={`${row[0]}-label`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            fontSize="9"
          >
            {row[0]}
          </text>
        );
      })}
    </svg>
  );
}

export function LifePathAlignment() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Life path
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-5xl">
            Alignment beyond the chart.
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.situationalAlignment}>Explore Life Alignment</Link>
        </Button>
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <FadeIn>
          <LifePathRadar />
        </FadeIn>

        <ul className="space-y-5">
          {PATH.map((row, i) => {
            const tone = ALIGN_TONE[row[3]];
            return (
              <motion.li
                key={row[0]}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.05 * i, ease }}
              >
                <div className="flex items-end justify-between gap-4">
                  <p className="font-medium">{row[0]}</p>
                  <p className="text-muted-foreground text-[11px] tracking-[0.12em] uppercase">
                    {row[3]}
                  </p>
                </div>
                <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                  <motion.div
                    className={cn("h-full origin-left rounded-full", tone.bar)}
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.08 * i, ease }}
                    style={{ width: `${tone.value * 100}%` }}
                  />
                </div>
                <div className="text-muted-foreground mt-2 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <p>
                    <span className="text-foreground/70 tracking-[0.12em] uppercase">You </span>
                    {row[1]}
                  </p>
                  <p>
                    <span className="text-foreground/70 tracking-[0.12em] uppercase">Partner </span>
                    {row[2]}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <p className="mt-10">
        <span className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
          Life path alignment
        </span>
        <span className="font-display mt-1 block text-3xl">Strong</span>
      </p>
    </LandingSection>
  );
}

export { ConnectionJourney } from "@/features/landing/components/connection-journey";
