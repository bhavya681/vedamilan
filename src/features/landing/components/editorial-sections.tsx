"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
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
import { landingCta } from "@/features/landing/lib/nav";
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

const ALIGN_LAYERS = [
  { title: "Preferences", note: "The surface of a profile." },
  { title: "Values", note: "How a household actually feels." },
  { title: "Life Goals", note: "Where the next decade is going." },
  { title: "Vedic Compatibility", note: "How two charts converse." },
] as const;

export function TrustStrip() {
  return (
    <LandingSection innerClassName="!py-6 sm:!py-8">
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
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % ALIGN_LAYERS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <LandingSection tone="muted">
      <div className="grid min-w-0 items-center gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
        <FadeIn>
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            The difference
          </p>
          <h2 className="font-display mt-3 text-[1.75rem] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Not every good profile is a good life partner.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-md text-sm leading-relaxed sm:text-base">
            VedaMilan looks beyond surface-level preferences to understand how two people may align
            across values, goals, personality and Vedic compatibility.
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative flex items-end justify-center pt-2">
              <AlignmentRings active={active} reduceMotion={Boolean(reduceMotion)} />
              <DifferencePortrait
                src={editorial.you.src}
                name="Adrian"
                className="-rotate-3 -translate-x-2"
              />
              <DifferencePortrait
                src={editorial.partner.src}
                name="Elena"
                className="rotate-3 translate-x-2"
              />
            </div>

            <ol className="mt-8">
              {ALIGN_LAYERS.map((layer, i) => {
                const selected = active === i;
                return (
                  <li key={layer.title}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "group flex w-full items-center gap-4 border-b py-3.5 text-left transition-colors duration-500",
                        selected ? "border-[#D4AF37]/40" : "border-border/50",
                      )}
                    >
                      <span
                        className={cn(
                          "w-8 text-[11px] tabular-nums tracking-[0.16em] transition-colors duration-500",
                          selected ? "text-[#C47A1A]" : "text-muted-foreground",
                        )}
                      >
                        0{i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{layer.title}</span>
                        <span
                          className={cn(
                            "text-muted-foreground grid overflow-hidden text-xs leading-relaxed transition-[grid-template-rows,opacity] duration-500",
                            selected ? "mt-0.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <span className="min-h-0">{layer.note}</span>
                        </span>
                      </span>
                      <span className="bg-border relative hidden h-px w-16 overflow-hidden sm:block">
                        <motion.span
                          className="absolute inset-y-0 left-0 bg-[#D4AF37]"
                          initial={false}
                          animate={{ width: selected ? "100%" : "0%" }}
                          transition={{ duration: reduceMotion ? 0 : 0.45, ease }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 flex items-baseline justify-between gap-4">
              <span className="font-display text-2xl tracking-tight sm:text-3xl">
                Relationship Alignment
              </span>
              <span className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                Four layers
              </span>
            </p>
          </div>
        </FadeIn>
      </div>
    </LandingSection>
  );
}

function AlignmentRings({ active, reduceMotion }: { active: number; reduceMotion: boolean }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className="pointer-events-none absolute top-2 left-1/2 h-[12rem] w-[min(20rem,calc(100%-1rem))] -translate-x-1/2 sm:h-[15.5rem] sm:w-[24rem]"
      aria-hidden
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.ellipse
          key={i}
          cx="160"
          cy="118"
          rx={86 + i * 22}
          ry={54 + i * 16}
          fill="none"
          stroke={i <= active ? "#D4AF37" : "currentColor"}
          strokeWidth={i === active ? 1.4 : 0.7}
          className={i <= active ? "" : "text-foreground"}
          initial={false}
          animate={{
            opacity: i <= active ? (i === active ? 0.85 : 0.35) : 0.12,
            scale: reduceMotion ? 1 : i === active ? 1.02 : 1,
          }}
          transition={{ duration: 0.55, ease }}
          style={{ transformOrigin: "160px 118px" }}
        />
      ))}
    </svg>
  );
}

function DifferencePortrait({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) {
  return (
    <figure className={cn("relative z-10 w-[42%] max-w-[11.5rem]", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(20,17,14,0.12)] ring-1 ring-black/5">
        <Image src={src} alt="" fill sizes="200px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110E]/50 to-transparent" />
        <figcaption className="font-display text-ivory absolute inset-x-0 bottom-2.5 text-center text-sm">
          {name}
        </figcaption>
      </div>
    </figure>
  );
}

type DiscoverPerson = (typeof editorial.profiles)[number];

function ScoreMark({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const reduceMotion = useReducedMotion();
  const dim = size === "sm" ? 44 : 56;
  const r = size === "sm" ? 16 : 21;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div
      className="relative shrink-0 rounded-full bg-[#14110E]/80"
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
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.6"
          strokeDasharray={c}
          strokeLinecap="round"
          initial={reduceMotion ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.15, delay: 0.15, ease }}
        />
      </svg>
      <span className="font-display text-ivory absolute inset-0 flex items-center justify-center text-[12px] leading-none tabular-nums">
        {score}
      </span>
    </div>
  );
}

function DiscoverCard({
  person,
  featured = false,
  delay = 0,
}: {
  person: DiscoverPerson;
  featured?: boolean;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduceMotion ? undefined : { y: featured ? -8 : -5, transition: { duration: 0.45, delay: 0, ease } }}
      transition={{ duration: 0.55, ease, delay }}
      className="h-full"
    >
      <Link
        href={routes.register}
        className={cn(
          "group relative block h-full overflow-hidden rounded-2xl",
          featured
            ? "aspect-[4/5] md:aspect-auto md:min-h-[26rem] lg:min-h-[32rem]"
            : "aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[10.75rem]",
        )}
      >
        <Image
          src={person.src}
          alt=""
          fill
          sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 28vw"}
          className="object-cover object-top transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        />
        <div
          className={cn(
            "absolute inset-0",
            featured
              ? "bg-[linear-gradient(180deg,rgba(20,17,14,0.05)_0%,rgba(20,17,14,0.18)_48%,rgba(20,17,14,0.88)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(20,17,14,0.12)_0%,rgba(20,17,14,0.28)_40%,rgba(20,17,14,0.92)_100%)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/12 transition-[box-shadow] duration-500 group-hover:shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]" />

        <div className="absolute top-4 right-4 rounded-full bg-[#14110E]/50 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <ScoreMark score={person.score} size={featured ? "md" : "sm"} />
        </div>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 translate-y-1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0",
            featured ? "p-6 sm:p-7" : "p-4 sm:p-5",
          )}
        >
          <p className="text-ivory/60 text-[10px] tracking-[0.18em] uppercase">
            {person.city} · {person.profession}
          </p>
          <h3
            className={cn(
              "font-display text-ivory mt-1.5 tracking-tight",
              featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl lg:text-xl",
            )}
          >
            {person.name}
            <span className="text-ivory/70 font-sans text-base font-normal tracking-normal sm:text-lg">
              {" "}
              · {person.age}
            </span>
          </h3>
          <p
            className={cn(
              "text-ivory/82 mt-2 leading-relaxed",
              featured ? "max-w-sm text-sm sm:text-base" : "line-clamp-2 text-xs sm:text-sm lg:line-clamp-1",
            )}
          >
            {person.headline}
          </p>
          <span className="border-ivory/20 bg-ivory/10 text-ivory mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] tracking-[0.16em] uppercase backdrop-blur-md">
            Interested
            <span
              aria-hidden
              className="bg-[#D4AF37] h-px w-4 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-150"
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function DiscoverMatches() {
  const featured = editorial.profiles[0];
  const rest = editorial.profiles.slice(1);
  if (!featured) return null;

  return (
    <LandingSection id="discover" className="scroll-mt-24">
      <FadeIn>
        <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
          Discover
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-[1.75rem] tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Meet people who make sense for your journey.
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-relaxed">
          Illustrative profiles. In the product, Interested is mutual — and respectful.
        </p>
      </FadeIn>

      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
        <DiscoverCard person={featured} featured />
        <div className="grid min-w-0 gap-4 sm:grid-cols-3 md:grid-cols-1">
          {rest.map((person, i) => (
            <DiscoverCard key={person.name} person={person} delay={0.08 * (i + 1)} />
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

const CHART_INSIGHTS = [
  {
    n: "01",
    title: "Potential strengths",
    body: "Communication and shared family tempo.",
  },
  {
    n: "02",
    title: "Areas worth exploring",
    body: "Relocation timing and daily rhythm.",
  },
  {
    n: "03",
    title: "What to discuss",
    body: "How close family stays in weekly life.",
  },
] as const;

export function CompatibilityVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <LandingSection id="compatibility" className="scroll-mt-24" tone="muted">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <FadeIn className="max-w-2xl">
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Vedic compatibility
          </p>
          <h2 className="font-display mt-3 text-[1.75rem] tracking-tight text-balance sm:text-4xl lg:text-5xl">
            See what brings two charts together.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed">
            Traditional Vedic indicators suggest areas of strength and conversation. This is an
            astrological interpretation, not a certainty.
          </p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={landingCta.compatibility.href}>{landingCta.compatibility.label}</Link>
          </Button>
        </FadeIn>
      </div>

      <div className="relative mt-8">
        <div
          className="pointer-events-none absolute top-[42%] right-[12%] left-[12%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.55),transparent)] md:block"
          aria-hidden
        />
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-4 lg:gap-6">
          <ChartPerson
            label="You"
            name="Adrian"
            src={editorial.you.src}
            delay={0.05}
          />
          <CompatibilityCore value={91} reduceMotion={Boolean(reduceMotion)} />
          <ChartPerson
            label="Partner"
            name="Elena"
            src={editorial.partner.src}
            delay={0.12}
          />
        </div>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {CHART_INSIGHTS.map((item, i) => (
          <motion.li
            key={item.n}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.06 * i, ease }}
            className="group border-border/60 bg-background/70 relative overflow-hidden rounded-2xl border p-6"
          >
            <p className="text-[11px] tabular-nums tracking-[0.18em] text-[#C47A1A]">{item.n}</p>
            <h3 className="font-display mt-3 text-xl tracking-tight sm:text-2xl">{item.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
            <span
              aria-hidden
              className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
          </motion.li>
        ))}
      </ul>
    </LandingSection>
  );
}

function ChartPerson({
  label,
  name,
  src,
  delay,
}: {
  label: string;
  name: string;
  src: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease }}
      className="mx-auto w-full max-w-[16.5rem] text-center"
    >
      <div className="relative mx-auto h-40 w-40 sm:h-52 sm:w-52 md:h-48 md:w-48 lg:h-56 lg:w-56">
        <div className={cn("absolute inset-0 text-foreground", !reduceMotion && "landing-orbit")}>
          <KundliFrame />
        </div>
        <div className="absolute inset-[22%] overflow-hidden rounded-full shadow-[0_16px_40px_rgba(20,17,14,0.14)] ring-1 ring-[#D4AF37]/35">
          <Image src={src} alt="" fill sizes="180px" className="object-cover" />
        </div>
      </div>
      <figcaption className="mt-3">
        <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">{label}</p>
        <p className="font-display mt-1 text-xl tracking-tight">{name}</p>
      </figcaption>
    </motion.figure>
  );
}

function KundliFrame() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <rect x="7" y="7" width="86" height="86" fill="none" stroke="currentColor" opacity="0.22" />
      <polygon points="50,7 93,50 50,93 7,50" fill="none" stroke="#D4AF37" strokeWidth="1.15" />
      <line x1="7" y1="7" x2="93" y2="93" stroke="currentColor" opacity="0.16" />
      <line x1="93" y1="7" x2="7" y2="93" stroke="currentColor" opacity="0.16" />
    </svg>
  );
}

function CompatibilityCore({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);

  return (
    <div className="relative z-10 mx-auto flex h-48 w-48 items-center justify-center sm:h-52 sm:w-52">
      <div className="bg-card ring-border absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(20,17,14,0.08)] ring-1" />
      <svg viewBox="0 0 140 140" className={cn("text-foreground absolute inset-2", !reduceMotion && "landing-orbit-rev")} aria-hidden>
        <circle
          cx="70"
          cy="70"
          r="62"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="0.8"
          strokeDasharray="2 8"
        />
      </svg>
      <svg viewBox="0 0 140 140" className="text-foreground absolute inset-3 -rotate-90" aria-hidden>
        <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.8" />
        <motion.circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduceMotion ? offset : c }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.2, ease }}
        />
      </svg>
      <div className="relative text-center">
        <p className="font-display text-foreground text-5xl leading-none tracking-tight tabular-nums sm:text-6xl">
          <CompatibilityScore value={value} reduceMotion={reduceMotion} />
          <span className="text-2xl">%</span>
        </p>
        <p className="text-muted-foreground mt-2 text-[10px] tracking-[0.2em] uppercase">
          Compatibility
        </p>
      </div>
    </div>
  );
}

function CompatibilityScore({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const spring = useSpring(reduceMotion ? value : 0, { stiffness: 70, damping: 18 });
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion || inView) spring.set(value);
  }, [inView, reduceMotion, spring, value]);

  useMotionValueEvent(spring, "change", (next) => {
    setShown(Math.round(next));
  });

  return <span ref={ref}>{shown}</span>;
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
  const polygon = PATH.map((_, i) => polarPoint(i, PATH.length, maxR * (values[i] ?? 0), cx, cy))
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
        const [x, y] = polarPoint(i, PATH.length, maxR * (values[i] ?? 0), cx, cy);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Life path
          </p>
          <h2 className="font-display mt-3 text-[1.75rem] tracking-tight sm:text-4xl lg:text-5xl">
            Alignment beyond the chart.
          </h2>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={routes.situationalAlignment}>Explore Life Alignment</Link>
        </Button>
      </div>

      <div className="mt-8 grid min-w-0 items-center gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
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
