"use client";

import { motion, useReducedMotion } from "framer-motion";

import WorldMap from "@/components/ui/world-map";
import { cn } from "@/lib/utils/cn";

const ease = [0.22, 1, 0.36, 1] as const;

export const PLACES = [
  { name: "India", lat: 21.0, lng: 78.0 },
  { name: "United Kingdom", lat: 51.5, lng: -0.12 },
  { name: "United States", lat: 40.7, lng: -74.0 },
  { name: "Canada", lat: 43.7, lng: -79.4 },
  { name: "Australia", lat: -33.9, lng: 151.2 },
  { name: "UAE", lat: 25.2, lng: 55.3 },
  { name: "Singapore", lat: 1.35, lng: 103.8 },
  { name: "Europe", lat: 48.9, lng: 2.35 },
] as const;

const HUB = PLACES[0];

const ROUTES = PLACES.slice(1).map((place) => ({
  start: { lat: HUB.lat, lng: HUB.lng, label: HUB.name },
  end: { lat: place.lat, lng: place.lng, label: place.name },
}));

export function InternationalGlobe({
  active,
  onActive,
}: {
  active: number;
  onActive: (index: number) => void;
}) {
  const highlightIndex = active === 0 ? undefined : active - 1;

  return (
    <div className="w-full">
      <WorldMap
        dots={ROUTES}
        lineColor="#D4AF37"
        highlightIndex={highlightIndex}
        onSelect={(routeIndex) => onActive(routeIndex + 1)}
      />
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
            className="flex w-full items-baseline gap-4 py-3 text-left sm:py-3.5"
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
                "font-display text-xl tracking-tight sm:text-2xl",
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
