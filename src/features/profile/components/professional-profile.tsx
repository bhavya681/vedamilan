"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type ProfilePhoto = {
  secureUrl?: string;
  url?: string;
  isPrimary?: boolean;
};

export function photoUrl(photo?: ProfilePhoto | null): string | null {
  return photo?.secureUrl || photo?.url || null;
}

export function primaryPhotoUrl(photos?: ProfilePhoto[] | null): string | null {
  if (!photos?.length) return null;
  return photoUrl(photos.find((p) => p.isPrimary) || photos[0]);
}

export function shouldUnoptimizeImage(src: string): boolean {
  return (
    src.startsWith("data:") ||
    src.startsWith("/") ||
    (!src.includes("res.cloudinary.com") &&
      !src.includes("images.unsplash.com") &&
      !src.includes("upload.wikimedia.org"))
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type HeroProps = {
  name: string;
  headline?: string | null;
  meta?: string | null;
  photo?: string | null;
  badges?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** LinkedIn / Instagram-style identity header: banner + circular avatar, not full-bleed face. */
export function ProfessionalProfileHero({
  name,
  headline,
  meta,
  photo,
  badges,
  actions,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "border-border/70 bg-card shadow-soft overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div
        className="relative h-28 sm:h-36 md:h-44"
        aria-hidden
        style={{
          background: "linear-gradient(135deg, #1f3a5f 0%, #2a4a6f 38%, #c47a1a 78%, #d4af37 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(247,241,227,0.45) 0, transparent 42%), radial-gradient(circle at 80% 10%, rgba(212,175,55,0.35) 0, transparent 36%)",
          }}
        />
      </div>

      <div className="relative px-5 pb-5 sm:px-8 sm:pb-7">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            <div className="border-card bg-muted shadow-elevated relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-[4px] sm:h-28 sm:w-28 sm:border-[5px]">
              {photo ? (
                <Image
                  src={photo}
                  alt={name}
                  fill
                  unoptimized={shouldUnoptimizeImage(photo)}
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="from-navy to-cosmic text-ivory flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl font-semibold tracking-wide">
                  {initialsFromName(name)}
                </div>
              )}
            </div>

            <div className="min-w-0 pb-1">
              <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{name}</h1>
              {headline ? (
                <p className="text-foreground/90 mt-1 max-w-xl text-sm leading-relaxed sm:text-base">
                  {headline}
                </p>
              ) : null}
              {meta ? <p className="text-muted-foreground mt-1.5 text-sm">{meta}</p> : null}
              {badges ? <div className="mt-3 flex flex-wrap gap-2">{badges}</div> : null}
            </div>
          </div>

          {actions ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[13rem] sm:shrink-0">
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
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-border/70 bg-card shadow-soft rounded-2xl border p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="font-display text-lg tracking-tight sm:text-xl">{title}</h2>
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
    <dl className="grid gap-4 sm:grid-cols-2">
      {visible.map((item) => (
        <div
          key={item.label}
          className="border-border/50 border-b pb-3 last:border-0 sm:border-0 sm:pb-0"
        >
          <dt className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed">{item.value}</dd>
        </div>
      ))}
    </dl>
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

  return (
    <ProfileSection title="Photos">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {urls.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="bg-muted relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={src}
              alt={`${name} photo ${i + 1}`}
              fill
              unoptimized={shouldUnoptimizeImage(src)}
              sizes="(max-width: 640px) 50vw, 180px"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}

export function SoftPill({ children }: { children: ReactNode }) {
  return <Badge variant="outline">{children}</Badge>;
}
