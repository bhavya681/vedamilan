"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Globe3D, type GlobeMarker } from "@/components/ui/3d-globe";
import { editorial } from "@/features/landing/lib/images";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;

export const PLACES = [
  { name: "India", lat: 28.6139, lng: 77.209 },
  { name: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "United States", lat: 40.7128, lng: -74.006 },
  { name: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Europe", lat: 48.8566, lng: 2.3522 },
] as const;

const PORTRAITS = [
  editorial.you.src,
  editorial.partner.src,
  editorial.profiles[0].src,
  editorial.profiles[1].src,
  editorial.profiles[2].src,
  editorial.profiles[3].src,
  editorial.you.src,
  editorial.partner.src,
] as const;

export function InternationalGlobe({
  active,
  onActive,
}: {
  active: number;
  onActive: (index: number) => void;
}) {
  const reduceMotion = useReducedMotion();

  const markers: GlobeMarker[] = useMemo(
    () =>
      PLACES.map((place, i) => ({
        lat: place.lat,
        lng: place.lng,
        src: PORTRAITS[i] ?? editorial.you.src,
      })),
    [],
  );

  function selectMarker(marker: GlobeMarker) {
    const index = PLACES.findIndex(
      (place) => place.lat === marker.lat && place.lng === marker.lng,
    );
    if (index >= 0) onActive(index);
  }

  return (
    <div className="relative mx-auto w-full max-w-[36rem]">
      <Globe3D
        className="h-[min(70vw,16rem)] sm:h-[18rem] md:h-[20rem] lg:h-[22rem]"
        markers={markers}
        config={{
          showAtmosphere: true,
          atmosphereColor: "#d7e3ef",
          atmosphereIntensity: 0.4,
          atmosphereBlur: 3,
          bumpScale: 4,
          autoRotateSpeed: reduceMotion ? 0 : 0.3,
          enableZoom: false,
          enablePan: false,
        }}
        onMarkerClick={selectMarker}
        onMarkerHover={(marker) => {
          if (marker) selectMarker(marker);
        }}
      />
      <p className="text-muted-foreground sr-only">{PLACES[active]?.name}</p>
    </div>
  );
}

export function PlaceIndex({
  active,
  onActive,
}: {
  active: number;
  onActive: (index: number) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ol aria-label="Places">
      {PLACES.map((place, i) => (
        <li key={place.name} className="border-border/50 border-t last:border-b">
          <button
            type="button"
            onClick={() => onActive(i)}
            onMouseEnter={() => onActive(i)}
            className="flex w-full min-w-0 items-baseline gap-4 py-2.5 text-left sm:py-3"
          >
            <span
              className={cn(
                "w-8 shrink-0 text-xs tabular-nums",
                i === active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              0{i + 1}
            </span>
            <span
              className={cn(
                "font-display min-w-0 flex-1 text-xl tracking-tight sm:text-2xl",
                i === active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {place.name}
            </span>
          </button>
          <motion.span
            aria-hidden
            className="block h-px origin-left bg-[#D4AF37]"
            initial={false}
            animate={{ scaleX: i === active ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease }}
          />
        </li>
      ))}
    </ol>
  );
}
