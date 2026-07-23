"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, Briefcase, GraduationCap, MapPin, Ruler, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  photoUrl,
  shouldUnoptimizeImage,
  type ProfilePhoto,
} from "@/features/profile/profile-photo";

export type { ProfilePhoto };
export { photoUrl, primaryPhotoUrl, shouldUnoptimizeImage } from "@/features/profile/profile-photo";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ProfilePageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-5xl space-y-6 sm:space-y-7", className)}>
      {children}
    </div>
  );
}

export function ProfileLayout({ main, aside }: { main: ReactNode; aside?: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5 sm:space-y-6">{main}</div>
      {aside ? <aside className="space-y-5 sm:space-y-6 lg:sticky lg:top-4">{aside}</aside> : null}
    </div>
  );
}

type HeroProps = {
  name: string;
  headline?: string | null;
  location?: string | null;
  profession?: string | null;
  education?: string | null;
  verified?: boolean;
  photo?: string | null;
  eyebrow?: string | null;
  badges?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Professional identity header — banner + circular portrait (LinkedIn-style). */
export function ProfessionalProfileHero({
  name,
  headline,
  location,
  profession,
  education,
  verified,
  photo,
  eyebrow,
  badges,
  actions,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "border-border/60 bg-card shadow-elevated overflow-hidden rounded-[1.35rem] border",
        className,
      )}
    >
      <div className="relative h-32 overflow-hidden sm:h-40 md:h-48" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(118deg, #14110e 0%, #1f3a5f 42%, #2a4a6f 68%, #8a6a28 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 80% at 12% 20%, rgba(212,175,55,0.28), transparent 55%), radial-gradient(ellipse 50% 60% at 88% 70%, rgba(247,241,227,0.12), transparent 50%)",
          }}
        />
        <div className="via-gold/40 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      </div>

      <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative shrink-0">
              <div className="ring-gold/35 absolute -inset-1 rounded-full ring-1" />
              <div className="border-card bg-muted relative h-[6.5rem] w-[6.5rem] overflow-hidden rounded-full border-[5px] shadow-[0_12px_40px_rgba(20,17,14,0.18)] sm:h-32 sm:w-32 sm:border-[6px]">
                {photo ? (
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    unoptimized={shouldUnoptimizeImage(photo)}
                    sizes="128px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="from-navy to-cosmic text-ivory flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl font-semibold tracking-wide sm:text-3xl">
                    {initialsFromName(name)}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 pb-0.5">
              {eyebrow ? (
                <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[1.75rem] leading-tight tracking-tight sm:text-4xl">
                  {name}
                </h1>
                {verified ? (
                  <span
                    className="text-gold inline-flex items-center gap-1 text-sm font-medium"
                    title="Verified member"
                  >
                    <BadgeCheck className="h-5 w-5" aria-hidden />
                    <span className="sr-only">Verified</span>
                  </span>
                ) : null}
              </div>
              {headline ? (
                <p className="text-foreground/88 mt-2 max-w-2xl text-[15px] leading-relaxed sm:text-base">
                  {headline}
                </p>
              ) : null}

              <ul className="text-muted-foreground mt-3 flex flex-col gap-1.5 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1.5">
                {profession ? (
                  <li className="inline-flex items-center gap-1.5">
                    <Briefcase className="text-gold/80 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{profession}</span>
                  </li>
                ) : null}
                {location ? (
                  <li className="inline-flex items-center gap-1.5">
                    <MapPin className="text-gold/80 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{location}</span>
                  </li>
                ) : null}
                {education ? (
                  <li className="inline-flex items-center gap-1.5">
                    <GraduationCap className="text-gold/80 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{education}</span>
                  </li>
                ) : null}
              </ul>

              {badges ? <div className="mt-3.5 flex flex-wrap gap-2">{badges}</div> : null}
            </div>
          </div>

          {actions ? (
            <div className="flex w-full flex-col gap-2 sm:max-w-xs sm:flex-row sm:flex-wrap lg:w-auto lg:max-w-[14rem] lg:shrink-0 lg:flex-col">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ProfileSection({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-border/60 bg-card shadow-soft rounded-[1.25rem] border p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-[color:var(--border)] pb-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileFactGrid({
  items,
}: {
  items: Array<{ label: string; value?: string | number | null }>;
}) {
  const visible = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== "");
  if (!visible.length) {
    return <p className="text-muted-foreground text-sm">Details not shared yet.</p>;
  }
  return (
    <dl className="grid gap-px overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--border)] sm:grid-cols-2">
      {visible.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3.5 sm:px-5">
          <dt className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
            {item.label}
          </dt>
          <dd className="mt-1.5 text-sm leading-snug font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProfileStatStrip({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  if (!items.length) return null;
  return (
    <div className="border-border/60 bg-card shadow-soft grid overflow-hidden rounded-[1.25rem] border sm:grid-cols-3">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "px-5 py-4",
            i > 0 && "border-border/50 border-t sm:border-t-0 sm:border-l",
          )}
        >
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
            {item.label}
          </p>
          <p className="font-display text-gold mt-1.5 text-2xl tracking-tight sm:text-3xl">
            {item.value}
          </p>
          {item.hint ? <p className="text-muted-foreground mt-1 text-xs">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function ProfileScorePanel({
  score,
  guna,
  maxGuna,
  manglik,
  nakshatra,
  moonSign,
  lagnaSign,
  strengths,
  challenges,
  footer,
}: {
  score: number;
  guna: number;
  maxGuna: number;
  manglik?: string;
  nakshatra?: string | null;
  moonSign?: string | null;
  lagnaSign?: string | null;
  strengths?: string[];
  challenges?: string[];
  footer?: ReactNode;
}) {
  return (
    <ProfileSection title="Kundli alignment" description="Overall Vedic blend with your chart.">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="border-gold/30 from-gold/10 to-card flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl border bg-gradient-to-b">
          <p className="font-display text-gold text-4xl leading-none tracking-tight">{score}%</p>
          <p className="text-muted-foreground mt-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
            Match
          </p>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            <span className="text-foreground font-medium">
              Guna {guna}/{maxGuna}
            </span>
            {manglik ? <span>Manglik {manglik}</span> : null}
            {moonSign ? <span>Moon {moonSign}</span> : null}
            {lagnaSign ? <span>Asc {lagnaSign}</span> : null}
            {nakshatra ? <span>Nakshatra {nakshatra}</span> : null}
          </div>
          {strengths?.length ? (
            <div>
              <p className="text-muted-foreground mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                <Sparkles className="text-gold h-3 w-3" aria-hidden />
                Strengths
              </p>
              <ul className="space-y-1 text-sm leading-relaxed">
                {strengths.slice(0, 3).map((s) => (
                  <li key={s} className="text-foreground/90">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {challenges?.length ? (
            <div>
              <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
                Discuss thoughtfully
              </p>
              <ul className="text-muted-foreground space-y-1 text-sm leading-relaxed">
                {challenges.slice(0, 2).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {footer}
        </div>
      </div>
    </ProfileSection>
  );
}

export function ProfilePhotoGallery({
  photos,
  name,
}: {
  photos?: ProfilePhoto[] | null;
  name: string;
}) {
  const urls = (photos || []).map((p) => photoUrl(p)).filter(Boolean) as string[];
  if (!urls.length) return null;

  const [featured, ...rest] = urls;
  const side = (rest.length ? rest : []).slice(0, 2);

  return (
    <ProfileSection title="Photos" description="Portraits shared on this profile.">
      <div className={cn("grid gap-2 sm:gap-3", side.length ? "sm:grid-cols-3" : "grid-cols-1")}>
        <div
          className={cn(
            "bg-muted relative overflow-hidden rounded-2xl",
            side.length
              ? "aspect-[4/5] sm:col-span-2 sm:aspect-[16/11]"
              : "aspect-[16/10] sm:aspect-[21/9]",
          )}
        >
          <Image
            src={featured!}
            alt={`${name} featured`}
            fill
            unoptimized={shouldUnoptimizeImage(featured!)}
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
        {side.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-3">
            {side.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="bg-muted relative aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt={`${name} photo ${i + 2}`}
                  fill
                  unoptimized={shouldUnoptimizeImage(src)}
                  sizes="200px"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            ))}
            {urls.length > 3 ? (
              <div className="bg-muted/80 text-muted-foreground flex aspect-square items-center justify-center rounded-2xl text-sm font-medium">
                +{urls.length - 3} more
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ProfileSection>
  );
}

export function SoftPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tone === "gold" && "border-gold/35 bg-gold/10 text-foreground",
        tone === "success" && "border-emerald/30 bg-emerald/10 text-emerald",
        tone === "default" && "border-border/70 bg-muted/50 text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function ProfileQuickFacts({
  age,
  heightCm,
  city,
}: {
  age?: number | null;
  heightCm?: number | null;
  city?: string | null;
}) {
  const bits = [
    age != null ? { icon: Sparkles, label: `${age} yrs` } : null,
    heightCm != null ? { icon: Ruler, label: `${heightCm} cm` } : null,
    city ? { icon: MapPin, label: city } : null,
  ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string }>;

  if (!bits.length) return null;

  return (
    <div className="border-border/60 bg-card shadow-soft flex flex-wrap gap-3 rounded-[1.25rem] border px-4 py-3.5">
      {bits.map(({ icon: Icon, label }) => (
        <div key={label} className="text-foreground/90 inline-flex items-center gap-2 text-sm">
          <Icon className="text-gold h-3.5 w-3.5" aria-hidden />
          {label}
        </div>
      ))}
    </div>
  );
}
