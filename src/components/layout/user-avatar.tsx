"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { primaryPhotoUrl, shouldUnoptimizeImage } from "@/features/profile/profile-photo";
import { cn } from "@/lib/utils/cn";

let cachedPhoto: string | null | undefined;
let inflight: Promise<string | null> | null = null;
const listeners = new Set<(url: string | null) => void>();

function notify(url: string | null) {
  for (const listener of listeners) listener(url);
}

function loadPrimaryPhoto(force = false): Promise<string | null> {
  if (!force && cachedPhoto !== undefined) return Promise.resolve(cachedPhoto);
  if (inflight) return inflight;

  inflight = fetch("/api/profile")
    .then((r) => r.json())
    .then((json) => {
      if (!json?.success) {
        cachedPhoto = null;
        return null;
      }
      cachedPhoto = primaryPhotoUrl(json.data?.profile?.photos) || null;
      return cachedPhoto;
    })
    .catch(() => {
      cachedPhoto = null;
      return null;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Clear cache after photo upload / delete so chrome avatars refresh. */
export function invalidateUserAvatarCache() {
  cachedPhoto = undefined;
  void loadPrimaryPhoto(true).then((url) => notify(url));
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "VM";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

const sizeClass = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
} as const;

export function UserAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const [photo, setPhoto] = useState<string | null>(cachedPhoto ?? null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const onUpdate = (url: string | null) => {
      if (!cancelled) {
        setBroken(false);
        setPhoto(url);
      }
    };
    listeners.add(onUpdate);
    void loadPrimaryPhoto().then((url) => {
      if (!cancelled) setPhoto(url);
    });
    return () => {
      cancelled = true;
      listeners.delete(onUpdate);
    };
  }, []);

  const initials = initialsFromName(name);
  const showPhoto = Boolean(photo) && !broken;

  return (
    <span
      className={cn(
        "bg-navy text-ivory relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold tracking-wide",
        sizeClass[size],
        className,
      )}
      aria-hidden={showPhoto ? true : undefined}
    >
      {showPhoto ? (
        <Image
          src={photo!}
          alt=""
          fill
          sizes={size === "sm" ? "28px" : "36px"}
          unoptimized={shouldUnoptimizeImage(photo!)}
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
