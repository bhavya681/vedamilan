export function NorthIndianKundli() {
  const houses = [
    { n: 1, label: "Asc\nSu", x: 50, y: 18 },
    { n: 2, label: "2", x: 72, y: 28 },
    { n: 3, label: "3\nMe", x: 82, y: 50 },
    { n: 4, label: "4", x: 72, y: 72 },
    { n: 5, label: "5\nMa", x: 50, y: 82 },
    { n: 6, label: "6", x: 28, y: 72 },
    { n: 7, label: "7\nMo", x: 18, y: 50 },
    { n: 8, label: "8\nRa", x: 28, y: 28 },
    { n: 9, label: "9", x: 38, y: 38 },
    { n: 10, label: "10\nSa", x: 50, y: 38 },
    { n: 11, label: "11\nJu", x: 62, y: 38 },
    { n: 12, label: "12\nVe", x: 62, y: 62 },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label="North Indian kundli"
    >
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-primary"
      />
      <line
        x1="5"
        y1="5"
        x2="95"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-primary/70"
      />
      <line
        x1="95"
        y1="5"
        x2="5"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-primary/70"
      />
      <line
        x1="50"
        y1="5"
        x2="5"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-primary/70"
      />
      <line
        x1="50"
        y1="5"
        x2="95"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-primary/70"
      />
      <line
        x1="5"
        y1="50"
        x2="50"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-primary/70"
      />
      <line
        x1="95"
        y1="50"
        x2="50"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-primary/70"
      />
      {houses.map((house) => (
        <text
          key={house.n}
          x={house.x}
          y={house.y}
          textAnchor="middle"
          className="fill-foreground text-[3.2px]"
        >
          {house.label.split("\n").map((line, index) => (
            <tspan key={line} x={house.x} dy={index === 0 ? 0 : 4}>
              {line}
            </tspan>
          ))}
        </text>
      ))}
    </svg>
  );
}

const SOUTH_CELLS: Array<{ house?: number; label?: string }> = [
  { house: 12, label: "Ve Ke" },
  { house: 1, label: "Asc Su" },
  { house: 2 },
  { house: 3, label: "Me" },
  { house: 11, label: "Ju" },
  {},
  {},
  { house: 4 },
  { house: 10, label: "Sa" },
  {},
  {},
  { house: 5, label: "Ma" },
  { house: 9 },
  { house: 8, label: "Ra" },
  { house: 7, label: "Mo" },
  { house: 6 },
];

export function SouthIndianKundli() {
  return (
    <div
      className="border-primary bg-primary/20 grid h-72 w-72 grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border sm:h-96 sm:w-96"
      role="img"
      aria-label="South Indian kundli"
    >
      {SOUTH_CELLS.map((cell, index) => (
        <div
          key={index}
          className="bg-background/90 flex items-center justify-center p-1 text-center text-[10px] sm:text-xs"
        >
          {cell.house ? (
            <span>
              <span className="text-muted-foreground block">{cell.house}</span>
              {cell.label ?? ""}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function EastIndianKundli() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-72 w-72 sm:h-96 sm:w-96"
      role="img"
      aria-label="East Indian kundli"
    >
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="4"
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="1.2"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="currentColor"
        className="text-saffron"
        strokeWidth="1"
      />
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="none"
        stroke="currentColor"
        className="text-primary/60"
        strokeWidth="0.8"
      />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, index) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * 38;
        const y = 50 + Math.sin(rad) * 38;
        return (
          <text
            key={angle}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-[3px]"
          >
            {index + 1}
          </text>
        );
      })}
      <text x="50" y="48" textAnchor="middle" className="fill-primary text-[4px] font-semibold">
        Asc
      </text>
      <text x="50" y="54" textAnchor="middle" className="fill-muted-foreground text-[3px]">
        East style
      </text>
    </svg>
  );
}
