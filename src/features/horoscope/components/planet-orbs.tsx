/** Physical planet orbs for the Horizon sky — not astrological glyphs. */

export const PLANET_ORB_R: Record<string, number> = {
  Sun: 2.45,
  Moon: 2.15,
  Mercury: 1.55,
  Venus: 1.95,
  Mars: 1.75,
  Jupiter: 2.35,
  Saturn: 2.05,
  Rahu: 1.7,
  Ketu: 1.6,
};

export function planetOrbRadius(planet: string) {
  return PLANET_ORB_R[planet] ?? 1.7;
}

export function PlanetOrbDefs() {
  return (
    <>
      <radialGradient id="orb-sun" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#fff8dc" />
        <stop offset="42%" stopColor="#ffcc4a" />
        <stop offset="100%" stopColor="#e07012" />
      </radialGradient>
      <radialGradient id="orb-moon" cx="40%" cy="34%" r="70%">
        <stop offset="0%" stopColor="#f4f1ea" />
        <stop offset="55%" stopColor="#c9c4b8" />
        <stop offset="100%" stopColor="#7a756c" />
      </radialGradient>
      <radialGradient id="orb-mercury" cx="36%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#d8d3cc" />
        <stop offset="100%" stopColor="#6b6560" />
      </radialGradient>
      <radialGradient id="orb-venus" cx="38%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff6e0" />
        <stop offset="50%" stopColor="#e8c98a" />
        <stop offset="100%" stopColor="#b8874a" />
      </radialGradient>
      <radialGradient id="orb-mars" cx="36%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#f0a07a" />
        <stop offset="45%" stopColor="#c44a2b" />
        <stop offset="100%" stopColor="#6a1c14" />
      </radialGradient>
      <radialGradient id="orb-jupiter" cx="40%" cy="30%" r="72%">
        <stop offset="0%" stopColor="#f3e2c4" />
        <stop offset="55%" stopColor="#d4a05a" />
        <stop offset="100%" stopColor="#8a5a28" />
      </radialGradient>
      <radialGradient id="orb-saturn" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#efe4c8" />
        <stop offset="100%" stopColor="#9a8458" />
      </radialGradient>
      <radialGradient id="orb-rahu" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#6b6580" />
        <stop offset="100%" stopColor="#1a1624" />
      </radialGradient>
      <radialGradient id="orb-ketu" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#8a7a68" />
        <stop offset="100%" stopColor="#2a2218" />
      </radialGradient>
    </>
  );
}

function fillFor(planet: string) {
  const id = {
    Sun: "orb-sun",
    Moon: "orb-moon",
    Mercury: "orb-mercury",
    Venus: "orb-venus",
    Mars: "orb-mars",
    Jupiter: "orb-jupiter",
    Saturn: "orb-saturn",
    Rahu: "orb-rahu",
    Ketu: "orb-ketu",
  }[planet];
  return id ? `url(#${id})` : "#78716c";
}

export function PlanetOrb({
  planet,
  cx,
  cy,
  selected,
}: {
  planet: string;
  cx: number;
  cy: number;
  selected?: boolean;
}) {
  const r = planetOrbRadius(planet);
  const halo = r + 0.72;

  return (
    <g style={{ pointerEvents: "none" }}>
      <circle
        cx={cx}
        cy={cy}
        r={halo}
        fill="none"
        stroke="#d4a017"
        strokeWidth="0.2"
        opacity={selected ? 0.8 : 0}
        style={{ transition: "opacity 200ms ease" }}
      />
      {planet === "Saturn" ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 2.15}
          ry={r * 0.58}
          transform={`rotate(-28 ${cx} ${cy})`}
          fill="none"
          stroke="#d9c89a"
          strokeWidth="0.38"
          opacity="0.55"
        />
      ) : null}
      {planet === "Sun" ? (
        <circle cx={cx} cy={cy} r={r * 1.28} fill="#ffcc4a" opacity="0.22" />
      ) : null}
      <circle cx={cx} cy={cy} r={r} fill={fillFor(planet)} stroke="none" />
      {planet === "Moon" ? (
        <circle cx={cx - r * 0.28} cy={cy - r * 0.12} r={r * 0.28} fill="#8d877c" opacity="0.35" />
      ) : null}
      {planet === "Mars" ? (
        <circle cx={cx + r * 0.22} cy={cy + r * 0.18} r={r * 0.22} fill="#7a2418" opacity="0.4" />
      ) : null}
      {planet === "Jupiter" ? (
        <g>
          <ellipse
            cx={cx}
            cy={cy - r * 0.28}
            rx={r * 0.92}
            ry={r * 0.16}
            fill="#c48a3a"
            opacity="0.45"
          />
          <ellipse
            cx={cx}
            cy={cy + r * 0.22}
            rx={r * 0.88}
            ry={r * 0.14}
            fill="#e8d0a0"
            opacity="0.35"
          />
        </g>
      ) : null}
      {planet === "Saturn" ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={r * 2.15}
          ry={r * 0.58}
          transform={`rotate(-28 ${cx} ${cy})`}
          fill="none"
          stroke="#f0e6c8"
          strokeWidth="0.22"
          opacity="0.9"
          strokeDasharray={`${r * 3.4} ${r * 8}`}
          strokeDashoffset={r * 0.2}
        />
      ) : null}
      <circle cx={cx - r * 0.32} cy={cy - r * 0.34} r={r * 0.28} fill="#ffffff" opacity="0.18" />
    </g>
  );
}
