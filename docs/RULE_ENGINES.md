# Rule Engines (Module 5)

AI never calculates astrology. These TypeScript engines produce scores that agents may only explain later.

## Engines

| Engine                | Input                                      | Output                                                |
| --------------------- | ------------------------------------------ | ----------------------------------------------------- |
| Ashta Koota           | Moon signs, nakshatras, manglik statuses   | 8 kootas / 36, dosha flags, overall %                 |
| Shukra Milan          | Venus placements both charts               | Venus-sign themes /10 → %                             |
| Deep compatibility    | Full charts + guna                         | Weighted modules → decision (never single-rule)       |
| Match blend (ranking) | Ashta + Shukra + Manglik + Moon element    | Preview % for gallery ranking                         |
| Timing prediction     | Dasha periods + Gochar + (pair) bond score | Marry-now verdict, partner-arrival & marriage windows |

## Timing weights

**Self:** Mahadasha/Antar 45% · Gochar 35% · 7th-lord activation 20%

**Pair:** Overall multi-module bond 35% · Your dasha 25% · Partner dasha 20% · Your Gochar 20%  
Weak bond soft-caps how “favorable” timing can claim to be.

## APIs

| Method   | Path                   | Purpose                                                 |
| -------- | ---------------------- | ------------------------------------------------------- |
| GET/POST | `/api/compatibility`   | List / compute & persist reports (+ `timingPrediction`) |
| GET      | `/api/marriage-timing` | Self windows + full timing dossier                      |

## Wired pages

- `/dashboard/compatibility` — Timing tab
- `/dashboard/compatibility/report`
- `/dashboard/kundli/marriage-timing`
