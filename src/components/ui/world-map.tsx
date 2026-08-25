"use client";

/* eslint-disable @next/next/no-img-element */

import { useId, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import DottedMap from "dotted-map";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils/cn";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  className?: string;
  /** Index into `dots` to emphasize. Omit to draw every route equally. */
  highlightIndex?: number;
  onSelect?: (index: number) => void;
  /** Single location marker with a floating label (used on Contact). */
  pin?: { lat: number; lng: number; label: string };
}

export default function WorldMap({
  dots = [],
  lineColor = "#D4AF37",
  className,
  highlightIndex,
  onSelect,
  pin,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduceMotion = useReducedMotion();
  const reactId = useId().replace(/:/g, "");
  const gradientId = `path-gradient-${reactId}`;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    return map.getSVG({
      radius: 0.22,
      color: isDark ? "#F7F1E366" : "#14110E55",
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, [isDark]);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const pinPoint = pin ? projectPoint(pin.lat, pin.lng) : null;

  return (
    <div className={cn("relative aspect-[2/1] w-full font-sans", className)}>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="pointer-events-none h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] select-none"
        alt=""
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="absolute inset-0 h-full w-full select-none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const emphasized = highlightIndex === undefined || highlightIndex === i;
          return (
            <motion.path
              key={`path-${dot.end.label ?? i}`}
              d={createCurvedPath(startPoint, endPoint)}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={emphasized ? 1.2 : 0.8}
              opacity={emphasized ? 1 : 0.18}
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reduceMotion ? 0 : 1,
                delay: reduceMotion ? 0 : 0.35 * i,
                ease: "easeOut",
              }}
            />
          );
        })}

        {dots.map((dot, i) => {
          const start = projectPoint(dot.start.lat, dot.start.lng);
          const end = projectPoint(dot.end.lat, dot.end.lng);
          const emphasized = highlightIndex === undefined || highlightIndex === i;
          return (
            <g key={`points-${dot.end.label ?? i}`}>
              <HubPoint
                x={start.x}
                y={start.y}
                color={lineColor}
                pulse={!reduceMotion && emphasized}
              />
              <g className={onSelect ? "cursor-pointer" : undefined} onClick={() => onSelect?.(i)}>
                <HubPoint
                  x={end.x}
                  y={end.y}
                  color={lineColor}
                  pulse={!reduceMotion && emphasized}
                />
              </g>
            </g>
          );
        })}

        {pinPoint ? (
          <HubPoint x={pinPoint.x} y={pinPoint.y} color={lineColor} pulse={!reduceMotion} />
        ) : null}
      </svg>
      {pin && pinPoint ? (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: `${(pinPoint.x / 800) * 100}%`,
            top: `${(pinPoint.y / 400) * 100}%`,
          }}
        >
          <div className="relative flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <span className="bg-foreground text-background dark:text-ivory rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.28)] dark:bg-black">
              {pin.label}
            </span>
            <span className="from-gold to-gold/20 mt-1 h-7 w-px bg-gradient-to-b" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HubPoint({ x, y, color, pulse }: { x: number; y: number; color: string; pulse: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="2" fill={color} />
      {pulse ? (
        <circle cx={x} cy={y} r="2" fill={color} opacity="0.5">
          <animate
            attributeName="r"
            from="2"
            to="8"
            dur="1.5s"
            begin="0s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.5"
            to="0"
            dur="1.5s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>
      ) : null}
    </g>
  );
}
