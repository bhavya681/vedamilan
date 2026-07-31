"use client";

import type { GrahaId } from "@/domain/graha-katha/types";
import { cn } from "@/lib/utils/cn";

const FROM_ENGLISH: Record<string, GrahaId> = {
  Sun: "surya",
  Moon: "chandra",
  Mars: "mangal",
  Mercury: "budha",
  Jupiter: "guru",
  Venus: "shukra",
  Saturn: "shani",
  Rahu: "rahu",
  Ketu: "ketu",
};

/** Stylized animated archetype figures — educational icons, not photoreal deities. */
export function GrahaCharacter({
  grahaId,
  englishName,
  size = "md",
  animated = true,
  className,
}: {
  grahaId?: GrahaId | string;
  englishName?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}) {
  const id =
    (grahaId as GrahaId) || (englishName ? FROM_ENGLISH[englishName] : undefined) || "surya";
  const box =
    size === "lg" ? "h-40 w-40 sm:h-48 sm:w-48" : size === "sm" ? "h-20 w-20" : "h-28 w-28";

  return (
    <div
      className={cn(
        "relative mx-auto",
        box,
        animated && "motion-safe:animate-katha-char-bob",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible" fill="none">
        <CharacterArt id={id} animated={animated} />
      </svg>
    </div>
  );
}

function CharacterArt({ id, animated }: { id: GrahaId; animated: boolean }) {
  switch (id) {
    case "surya":
      return <SuryaChar animated={animated} />;
    case "chandra":
      return <ChandraChar animated={animated} />;
    case "mangal":
      return <MangalChar animated={animated} />;
    case "budha":
      return <BudhaChar animated={animated} />;
    case "guru":
      return <GuruChar animated={animated} />;
    case "shukra":
      return <ShukraChar animated={animated} />;
    case "shani":
      return <ShaniChar animated={animated} />;
    case "rahu":
      return <RahuChar animated={animated} />;
    case "ketu":
      return <KetuChar animated={animated} />;
    default:
      return <SuryaChar animated={animated} />;
  }
}

function SuryaChar({ animated }: { animated: boolean }) {
  return (
    <g>
      <g
        className={cn("origin-center", animated && "motion-safe:animate-katha-char-spin")}
        style={{ transformOrigin: "60px 52px" }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="60"
            y1="20"
            x2="60"
            y2="28"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.75"
            transform={`rotate(${deg} 60 52)`}
          />
        ))}
      </g>
      <circle cx="60" cy="52" r="18" fill="currentColor" opacity="0.95" />
      <circle
        cx="60"
        cy="52"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      {/* simple face — calm authority */}
      <circle cx="54" cy="50" r="1.6" fill="#1a140c" opacity="0.55" />
      <circle cx="66" cy="50" r="1.6" fill="#1a140c" opacity="0.55" />
      <path
        d="M54 58 Q60 62 66 58"
        stroke="#1a140c"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* body / cloak */}
      <path d="M42 78 Q60 68 78 78 L84 108 Q60 100 36 108 Z" fill="currentColor" opacity="0.85" />
      <circle cx="60" cy="34" r="3" fill="currentColor" opacity="0.5" />
    </g>
  );
}

function ChandraChar({ animated }: { animated: boolean }) {
  return (
    <g>
      <ellipse
        cx="60"
        cy="100"
        rx="28"
        ry="5"
        fill="currentColor"
        opacity="0.12"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
      />
      <path
        d="M72 28 A22 22 0 1 0 72 76 A14 14 0 1 1 72 28 Z"
        fill="currentColor"
        opacity="0.95"
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "60px 52px" }}
      />
      <circle cx="68" cy="48" r="1.4" fill="#1a140c" opacity="0.4" />
      <path
        d="M66 56 Q72 59 76 55"
        stroke="#1a140c"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* soft figure */}
      <path d="M44 82 Q60 72 76 82 L80 108 Q60 102 40 108 Z" fill="currentColor" opacity="0.7" />
      {/* stars */}
      {[
        [28, 36],
        [92, 42],
        [24, 70],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="1.5"
          fill="currentColor"
          opacity="0.55"
          className={cn(animated && "motion-safe:animate-katha-char-twinkle")}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </g>
  );
}

function MangalChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* spear */}
      <g
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "88px 40px" }}
      >
        <line
          x1="88"
          y1="18"
          x2="88"
          y2="78"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M84 20 L88 10 L92 20 Z" fill="currentColor" />
      </g>
      {/* head + helmet plume */}
      <circle cx="52" cy="42" r="14" fill="currentColor" />
      <path
        d="M40 36 Q52 22 64 36"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.7"
      />
      <circle cx="47" cy="40" r="1.4" fill="#1a140c" opacity="0.45" />
      <circle cx="57" cy="40" r="1.4" fill="#1a140c" opacity="0.45" />
      <path
        d="M47 48 Q52 51 57 48"
        stroke="#1a140c"
        strokeWidth="1.2"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* shield */}
      <ellipse
        cx="34"
        cy="72"
        rx="10"
        ry="14"
        fill="currentColor"
        opacity="0.55"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* body */}
      <path d="M38 62 Q52 56 66 62 L70 104 Q52 96 34 104 Z" fill="currentColor" opacity="0.9" />
      {/* stance foot pulse */}
      <ellipse
        cx="52"
        cy="108"
        rx="18"
        ry="3.5"
        fill="currentColor"
        opacity="0.15"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
      />
    </g>
  );
}

function BudhaChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* winged messenger arcs */}
      <path
        d="M28 48 Q16 40 22 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "28px 40px" }}
      />
      <path
        d="M92 48 Q104 40 98 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "92px 40px", animationDelay: "0.3s" }}
      />
      <circle cx="60" cy="40" r="13" fill="currentColor" />
      <circle cx="55" cy="38" r="1.3" fill="#0c121c" opacity="0.45" />
      <circle cx="65" cy="38" r="1.3" fill="#0c121c" opacity="0.45" />
      <path
        d="M55 45 Q60 48 65 45"
        stroke="#0c121c"
        strokeWidth="1.1"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* scroll */}
      <g
        className={cn(animated && "motion-safe:animate-katha-char-bob")}
        style={{ transformOrigin: "82px 70px" }}
      >
        <rect x="74" y="58" width="16" height="22" rx="2" fill="currentColor" opacity="0.85" />
        <line x1="78" y1="64" x2="86" y2="64" stroke="#0c121c" strokeWidth="1" opacity="0.35" />
        <line x1="78" y1="69" x2="86" y2="69" stroke="#0c121c" strokeWidth="1" opacity="0.35" />
        <line x1="78" y1="74" x2="84" y2="74" stroke="#0c121c" strokeWidth="1" opacity="0.35" />
      </g>
      <path d="M42 60 Q60 54 70 62 L74 104 Q60 96 40 104 Z" fill="currentColor" opacity="0.88" />
    </g>
  );
}

function GuruChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* aura */}
      <circle
        cx="60"
        cy="48"
        r="28"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
      />
      {/* lotus / book */}
      <path
        d="M40 96 Q60 84 80 96 Q60 108 40 96 Z"
        fill="currentColor"
        opacity="0.35"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
      />
      <circle cx="60" cy="38" r="14" fill="currentColor" />
      <path d="M48 32 Q60 24 72 32" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
      <circle cx="55" cy="36" r="1.3" fill="#1a140c" opacity="0.4" />
      <circle cx="65" cy="36" r="1.3" fill="#1a140c" opacity="0.4" />
      <path
        d="M55 43 Q60 46 65 43"
        stroke="#1a140c"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* open book */}
      <g
        className={cn(animated && "motion-safe:animate-katha-char-bob")}
        style={{ transformOrigin: "60px 72px" }}
      >
        <path d="M42 68 L60 62 L78 68 L78 86 L60 80 L42 86 Z" fill="currentColor" opacity="0.9" />
        <line x1="60" y1="62" x2="60" y2="80" stroke="#1a140c" strokeWidth="1" opacity="0.3" />
      </g>
      <path d="M44 58 Q60 52 76 58 L80 100 Q60 92 40 100 Z" fill="currentColor" opacity="0.75" />
    </g>
  );
}

function ShukraChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* heart / lotus glow */}
      <path
        d="M60 34 C52 24 38 28 38 42 C38 54 60 68 60 68 C60 68 82 54 82 42 C82 28 68 24 60 34 Z"
        fill="currentColor"
        opacity="0.25"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
        transform="translate(0 -6)"
      />
      <circle cx="60" cy="40" r="13" fill="currentColor" />
      <circle cx="55" cy="38" r="1.3" fill="#180e12" opacity="0.4" />
      <circle cx="65" cy="38" r="1.3" fill="#180e12" opacity="0.4" />
      <path
        d="M55 45 Q60 48 65 45"
        stroke="#180e12"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* flower in hand */}
      <g
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "86px 70px" }}
      >
        <circle cx="86" cy="66" r="6" fill="currentColor" opacity="0.85" />
        <circle cx="86" cy="66" r="2.5" fill="#180e12" opacity="0.25" />
        <line x1="86" y1="72" x2="86" y2="88" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <path d="M42 58 Q60 50 74 58 L78 104 Q60 96 40 104 Z" fill="currentColor" opacity="0.88" />
      {/* mirror of Venus glyph hint */}
      <circle
        cx="60"
        cy="78"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
        fill="none"
      />
      <line
        x1="60"
        y1="86"
        x2="60"
        y2="96"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </g>
  );
}

function ShaniChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* slow orbit rings = time */}
      <ellipse
        cx="60"
        cy="48"
        rx="34"
        ry="12"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.35"
        className={cn(animated && "motion-safe:animate-katha-char-spin")}
        style={{ transformOrigin: "60px 48px" }}
      />
      <ellipse cx="60" cy="48" rx="26" ry="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {/* staff */}
      <line
        x1="90"
        y1="30"
        x2="90"
        y2="100"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "90px 100px" }}
      />
      <circle cx="90" cy="28" r="4" fill="currentColor" opacity="0.7" />
      <circle cx="52" cy="40" r="13" fill="currentColor" />
      <circle cx="47" cy="38" r="1.3" fill="#080809" opacity="0.45" />
      <circle cx="57" cy="38" r="1.3" fill="#080809" opacity="0.45" />
      <path
        d="M47 45 Q52 47 57 45"
        stroke="#080809"
        strokeWidth="1.2"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* hooded cloak — discipline */}
      <path d="M36 56 Q52 48 68 56 L72 106 Q52 98 32 106 Z" fill="currentColor" opacity="0.9" />
      <path
        d="M38 54 Q52 44 66 54"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.5"
        strokeLinecap="round"
      />
      <ellipse
        cx="52"
        cy="108"
        rx="20"
        ry="3"
        fill="currentColor"
        opacity="0.12"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
      />
    </g>
  );
}

function RahuChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* ascending hunger — dragon head silhouette */}
      <path
        d="M30 70 Q20 50 36 36 Q50 28 62 40 Q78 30 92 42 Q100 58 88 72 Q70 84 48 80 Q34 84 30 70 Z"
        fill="currentColor"
        opacity="0.92"
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "60px 55px" }}
      />
      <circle cx="72" cy="48" r="3.5" fill="#0c121c" opacity="0.55" />
      <circle cx="73" cy="47" r="1.2" fill="currentColor" opacity="0.8" />
      {/* open mouth / desire */}
      <path
        d="M88 58 Q96 62 90 70"
        stroke="#0c121c"
        strokeWidth="2"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* smoke of illusion */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={28 + i * 8}
          cy={38 - i * 4}
          r={2.5 - i * 0.4}
          fill="currentColor"
          opacity={0.35 - i * 0.08}
          className={cn(animated && "motion-safe:animate-katha-char-twinkle")}
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
      <path d="M40 78 Q60 88 84 78 L80 108 Q60 102 36 108 Z" fill="currentColor" opacity="0.55" />
    </g>
  );
}

function KetuChar({ animated }: { animated: boolean }) {
  return (
    <g>
      {/* descending comet / liberation */}
      <path
        d="M40 40 Q60 28 86 36 Q70 48 58 70 Q48 58 40 40 Z"
        fill="currentColor"
        opacity="0.9"
        className={cn(animated && "motion-safe:animate-katha-char-sway")}
        style={{ transformOrigin: "60px 50px" }}
      />
      {/* tail of release */}
      <path
        d="M58 70 Q48 90 36 108"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
        className={cn(animated && "motion-safe:animate-katha-char-pulse")}
      />
      <path
        d="M62 72 Q70 94 82 110"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* serene head */}
      <circle cx="64" cy="44" r="9" fill="currentColor" />
      <circle cx="61" cy="42" r="1.1" fill="#080809" opacity="0.4" />
      <circle cx="68" cy="42" r="1.1" fill="#080809" opacity="0.4" />
      <path
        d="M61 48 Q64.5 50 68 48"
        stroke="#080809"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* detachment sparkles */}
      {[
        [30, 52],
        [92, 58],
        [48, 24],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="1.6"
          fill="currentColor"
          opacity="0.5"
          className={cn(animated && "motion-safe:animate-katha-char-twinkle")}
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </g>
  );
}
