# VedaMilan AI — Complete Visual Identity

> **Status:** Canonical design system. **No frontend implementation in this document.**  
> Companion canvas: `vedamilan-visual-identity.canvas.tsx`  
> Supersedes color/spacing notes in `UX_RESEARCH_STRATEGY.md` §6–8 where they conflict.

---

## 1. Brand essence

**Product:** VedaMilan AI — AI-powered Vedic relationship intelligence platform.

**Positioning:** A premium **Relationship Intelligence OS** for global audiences. Not a dating app. Not an astrology marketplace. Not a traditional matrimonial portal.

**Emotional north star**

| Feel         | How it shows                                                  |
| ------------ | ------------------------------------------------------------- |
| Trust        | Calm navy, honest scores, privacy-first chrome                |
| Love         | Warm ivory, soft photography, rose-gold compatibility accents |
| Destiny      | Timing windows, ceremonial restraint—not fate fear            |
| Intelligence | Explainable AI, Linear-like clarity, confidence scores        |
| Tradition    | Mandala texture, lotus dividers, gold highlights—subtle       |
| Innovation   | Aurora AI gradient, glass depth, SaaS IA                      |

**Creative thesis**

> Modern AI SaaS craft × timeless Indian cultural elegance.  
> Luxury without flash. Minimal yet warm. Calm rather than loud.

**Anti-patterns (never ship)**

- Dating-app swipe chrome, neon pink, casual hookup framing
- Astrology-site zodiac clutter, fear CTAs, saturated orange/red portals
- Bright red matrimony buttons, generic purple-AI clichés as the whole theme
- Dense inventory grids that feel like classifieds

---

## 2. Color system

### 2.1 Core brand

| Role               | Token            | Hex       | Usage                                                                       |
| ------------------ | ---------------- | --------- | --------------------------------------------------------------------------- |
| Primary            | `royal-gold`     | `#C89B3C` | Primary CTAs, key numerals, brand wordmark accents, focus rings (with navy) |
| Secondary          | `temple-blue`    | `#1D4ED8` | Links, secondary actions, AI-adjacent UI, chart accents                     |
| Accent             | `sacred-saffron` | `#E88A14` | Warm highlights, eyebrows sparingly, seasonal emphasis                      |
| Background (light) | `warm-ivory`     | `#FAF8F4` | App canvas, marketing page field                                            |
| Background (dark)  | `midnight-navy`  | `#071120` | Dark mode canvas, hero overlays, premium panels                             |
| Surface            | `soft-white`     | `#FFFFFF` | Cards on ivory; elevated sheets                                             |

### 2.2 Semantic

| Role    | Token     | Hex (reference) | Usage                                   |
| ------- | --------- | --------------- | --------------------------------------- |
| Success | `emerald` | `#059669`       | Verified, paid, match accepted          |
| Warning | `amber`   | `#D97706`       | Soft caution, incomplete profile        |
| Danger  | `ruby`    | `#E11D48`       | Errors, destructive—never marketing CTA |

### 2.3 Experiential gradients

| Name              | Stops                                                           | Usage                                                  |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| **AI Aurora**     | Purple `#6366F1` → Temple Blue `#1D4ED8` → Royal Gold `#C89B3C` | AI insight cards, coach chrome, progressive AI loaders |
| **Brand Dual**    | Gold `#C89B3C` → Temple Blue `#1D4ED8`                          | Wordmark fill, premium borders, hero brand signal      |
| **Compatibility** | Rose gold `#B76E79` → Royal Gold `#C89B3C`                      | Guna scores, harmony rings                             |
| **Depth Navy**    | `#071120` → `#0F1C2E`                                           | Dark panels, auth split                                |

### 2.4 Light mode surfaces

| Token          | Value                    | Notes                 |
| -------------- | ------------------------ | --------------------- |
| `--background` | `#FAF8F4`                | Warm ivory            |
| `--foreground` | `#0F172A`                | Near-navy ink         |
| `--card`       | `#FFFFFF` / 72–88% glass | Soft white + blur     |
| `--muted`      | `#F1EEE6`                | Quiet bands           |
| `--border`     | `rgba(7,17,32,0.08)`     | Hairline, never heavy |
| `--primary`    | `#C89B3C`                | Gold                  |
| `--secondary`  | `#1D4ED8`                | Temple blue           |
| `--ring`       | `#C89B3C` @ 40%          | Focus                 |

### 2.5 Dark mode surfaces

| Token          | Value                    | Notes                    |
| -------------- | ------------------------ | ------------------------ |
| `--background` | `#071120`                | Midnight navy            |
| `--foreground` | `#FAF8F4`                | Ivory text               |
| `--card`       | `rgba(255,255,255,0.06)` | Glass on navy            |
| `--muted`      | `#0F1C2E`                | Section bands            |
| `--border`     | `rgba(250,248,244,0.10)` | Soft ivory line          |
| `--primary`    | `#D4AF5A`                | Lifted gold for contrast |
| `--secondary`  | `#3B82F6`                | Lifted temple blue       |

### 2.6 Forbidden colors

- Bright portal reds (`#FF0000`–`#FF4444` marketing)
- Saturated matrimony orange as primary
- Neon purple-only AI themes
- Pure black `#000` full-bleed (use midnight navy)
- Harsh pure white `#FFF` as page background in light mode (use ivory)

---

## 3. Typography

### 3.1 Families

| Role            | Family                       | Character                                  |
| --------------- | ---------------------------- | ------------------------------------------ |
| **Display**     | Cormorant Garamond           | Editorial, ceremonial, brand-first         |
| **UI / Body**   | Plus Jakarta Sans            | Modern SaaS clarity, multilingual-friendly |
| **Mono** (rare) | JetBrains Mono / system mono | Confidence scores, IDs, timestamps         |

### 3.2 Type scale (Apple HIG–inspired)

Base: **16px**. Modular steps ≈ 1.2–1.25.

| Token          | Size / Line  | Weight  | Tracking     | Use                     |
| -------------- | ------------ | ------- | ------------ | ----------------------- |
| `display-hero` | 56–80 / 1.05 | 500–600 | −0.02em      | Brand name only on hero |
| `display-xl`   | 40–48 / 1.1  | 500     | −0.02em      | Page H1                 |
| `display-lg`   | 32–36 / 1.15 | 500     | −0.015em     | Section H2              |
| `display-md`   | 24–28 / 1.2  | 500     | −0.01em      | Card titles             |
| `title`        | 20 / 28      | 600     | 0            | UI titles               |
| `body`         | 16 / 24      | 400–500 | 0            | Paragraphs              |
| `body-sm`      | 14 / 20      | 400–500 | 0            | Secondary               |
| `caption`      | 12 / 16      | 500     | 0            | Meta                    |
| `overline`     | 11 / 16      | 600     | +0.18–0.22em | Eyebrows (UPPERCASE)    |

**Rules**

- One display line should never overpower the brand on landing hero.
- Body never below 14px for primary reading.
- Overlines in saffron/gold/blue—not rainbow.
- No Inter / Roboto / Arial as brand defaults.

---

## 4. Spacing & layout (Apple HIG–inspired)

### 4.1 Space scale (4pt base)

```
2   4   8   12   16   20   24   32   40   48   64   80   96   128
```

| Token      | px  | Typical use                 |
| ---------- | --- | --------------------------- |
| `space-1`  | 4   | Icon gaps                   |
| `space-2`  | 8   | Tight stacks                |
| `space-3`  | 12  | Chip padding                |
| `space-4`  | 16  | Default inset               |
| `space-5`  | 20  | Comfortable inset           |
| `space-6`  | 24  | Card padding (mobile)       |
| `space-8`  | 32  | Card padding (desktop)      |
| `space-10` | 40  | Group gaps                  |
| `space-12` | 48  | Section rhythm              |
| `space-16` | 64  | Section padding (tablet+)   |
| `space-20` | 80  | Marketing section (desktop) |
| `space-24` | 96  | Hero breathing room         |

### 4.2 Content widths

| Token     | Max width | Use                       |
| --------- | --------- | ------------------------- |
| `prose`   | 680px     | Legal, FAQ reading        |
| `form`    | 420px     | Auth forms                |
| `content` | 1120px    | Dashboard main            |
| `wide`    | 1280px    | Marketing                 |
| `ultra`   | 1440px    | Cap—never stretch forever |

### 4.3 Radius

| Token         | Value  | Use                               |
| ------------- | ------ | --------------------------------- |
| `radius-sm`   | 8px    | Inputs (compact)                  |
| `radius-md`   | 12px   | Buttons (pill preferred for CTAs) |
| `radius-lg`   | 16px   | Small cards                       |
| `radius-xl`   | 24px   | Primary cards                     |
| `radius-2xl`  | 32px   | Hero panels, empty states         |
| `radius-full` | 9999px | CTAs, chips, avatars              |

### 4.4 Elevation

| Level        | Shadow                                                        | Use                    |
| ------------ | ------------------------------------------------------------- | ---------------------- |
| `0`          | none                                                          | Flat text              |
| `1` soft     | `0 1px 2px rgba(7,17,32,0.04), 0 4px 12px rgba(7,17,32,0.04)` | Default card           |
| `2` elevated | `0 8px 24px rgba(7,17,32,0.08)`                               | Hover / modal          |
| `3` dual     | soft + gold glow `0 0 0 1px rgba(200,155,60,0.15)`            | Premium / AI highlight |

---

## 5. Materials & motifs

### 5.1 Glassmorphism

- Blur: **12–20px** backdrop
- Fill: white 6–12% (dark) / white 72–88% (light)
- Border: 1px `rgba` hairline
- Never opaque frost that kills photography

### 5.2 Aurora

- Large, slow, low-opacity blobs (gold + temple blue + indigo)
- Behind content only; never on text
- Reduce or freeze under `prefers-reduced-motion`

### 5.3 Sacred geometry

- Mandala: **opacity 8–20%**, soft-light blend, decorative only
- Never competing with CTAs or scores

### 5.4 Lotus dividers

- Thin horizontal rule with centered lotus/mark motif
- Use between major marketing sections or empty-state headers

### 5.5 Photography & illustration

- **Editorial:** Indian wedding/ceremony atmosphere, couples, soft interiors—not stock “swipe faces”
- Prefer full-bleed heroes; avoid inset collage cards on landing first viewport
- Illustrations: line/ink with gold accents; no cartoon zodiac mascots

### 5.6 Iconography

- Lucide (or equivalent) stroke icons, 1.5–2px
- Rounded joins; paired with soft icon wells (gold/blue tint at 10%)
- No emoji as UI decoration

---

## 6. Responsive design — redesign per breakpoint

Do **not** only stack. Each breakpoint gets a distinct layout composition.

| Name                  | Width          | Layout principle                                                                                 |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| **Mobile**            | 0–639          | Single column; bottom nav (app); full-bleed hero; sticky primary CTA; master–detail → push pages |
| **Foldable / narrow** | 280–639 (tall) | Same as mobile; avoid horizontal clip; safe-area insets; one primary action per fold             |
| **Tablet**            | 640–1023       | 2-column cards; collapsible sidebar; split chat when space allows                                |
| **Laptop**            | 1024–1279      | Sidebar + main; 3-col match grids; sticky insight rail optional                                  |
| **Desktop**           | 1280–1535      | Grouped nav; max-width content; dual panes (list + detail)                                       |
| **Wide**              | 1536+          | Same as desktop with wider gutters; never stretch cards beyond `wide`                            |

### Breakpoint tokens

```
sm  640
md  768
lg  1024
xl  1280
2xl 1536
```

### Per-surface examples

| Surface       | Mobile                                   | Tablet                     | Desktop                                         |
| ------------- | ---------------------------------------- | -------------------------- | ----------------------------------------------- |
| Landing hero  | Brand + H1 + CTA stacked over full-bleed | Same, more side padding    | Brand left, geometry right, centered vertically |
| Matches       | Vertical photo cards + filter sheet      | 2-col + top filters        | 3-col + sticky explain panel                    |
| Compatibility | Score → accordion kootas                 | Score + radar side by side | Full analytics canvas                           |
| Chat          | Thread full screen                       | Optional list drawer       | Master–detail persistent                        |
| Kundli        | Chart full width, tabs below             | Chart + planet list        | Chart studio + inspector                        |

---

## 7. Motion (Framer Motion)

| Pattern                | Spec                            | Notes                  |
| ---------------------- | ------------------------------- | ---------------------- |
| Page transition        | opacity 0→1, y 12→0, 280–400ms  | Shared layout wrappers |
| Fade-in                | whileInView, once, margin −80px | Section content        |
| Stagger                | 40–80ms child delay             | Grids, lists           |
| Floating décor         | slow y/rotate loops 8–80s       | Hero geometry only     |
| Stats                  | count-up 1–1.2s ease-out        | When in view           |
| Hover depth            | y −4 to −6, shadow L1→L2        | Cards                  |
| Button press           | scale 0.98 + optional ripple    | Primary CTAs           |
| Skeletons              | shimmer 1.2s linear infinite    | All async shells       |
| Progressive disclosure | height/opacity accordion        | Reports, koota detail  |

**Easing:** `[0.22, 1, 0.36, 1]` (ease-out-expo family)  
**Reduced motion:** disable parallax, ken burns, float, count-up; keep opacity fades ≤150ms or instant.

---

## 8. Mandatory UI states (every page)

| State       | Design rule                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| **Empty**   | Lotus divider + display title + one sentence + single CTA; never blank white |
| **Loading** | Skeleton matching final layout geometry (not spinners alone)                 |
| **Error**   | Calm ruby accent, plain language, retry action                               |
| **Success** | Emerald confirmation, brief; optional confetti never                         |
| **Partial** | Progressive disclosure—show known data, skeleton the rest                    |

All states must work in **light** and **dark** mode with AA contrast.

---

## 9. Accessibility

- WCAG **2.1 AA** minimum
- Focus rings visible on ivory and navy
- Skip to main content on marketing + app
- Keyboard complete for nav, dialogs, chat
- Charts: text/table alternative
- Live regions for chat / toast
- `prefers-reduced-motion` honored
- Semantic headings; brand not only in image

---

## 10. Component visual language

### Cards

- Radius `xl`–`2xl`
- Elevation L1; hover L2
- Padding `space-6` mobile / `space-8` desktop
- Optional glass + glow border for AI/premium

### Buttons

- Primary: gold dual / brand dual fill, ivory text, pill
- Secondary: temple blue fill or outline
- Ghost: muted hover on ivory/navy
- Never bright red primary

### Match / profile media

- Large photography, soft gradient scrim
- Dual score rings (Vedic / AI) — explainable, not gamified hearts spam

### Forms

- Generous label spacing; 44×44 min touch
- Rounded-xl inputs on ivory

---

## 11. Voice of the interface (microcopy tone)

- Calm, precise, respectful of families and seekers
- “Clarity,” “alignment,” “timing,” “intelligence”—not “find hot matches”
- AI always paired with **why** + confidence

---

## 12. Token file mapping (implementation later)

When frontend applies this identity, map to:

| Source of truth   | Target                                               |
| ----------------- | ---------------------------------------------------- |
| This document     | `docs/design/VISUAL_IDENTITY.md`                     |
| Runtime tokens    | `src/app/globals.css` + `src/lib/constants/brand.ts` |
| Motion primitives | `src/components/animations/*`                        |
| Page shells       | empty / loading / error / success components         |

**Do not implement until this identity is approved.**

---

## 13. Acceptance checklist

- [ ] Hero passes brand test (remove nav → still unmistakably VedaMilan)
- [ ] Colors match §2 hex values exactly
- [ ] No dating / astrology cliché chrome
- [ ] Whitespace feels Apple-calm, not sparse empty
- [ ] Glass + aurora + mandala used as atmosphere, not decoration overload
- [ ] Each breakpoint is a redesigned composition
- [ ] Motion respects reduced-motion
- [ ] Empty / loading / error / success on every surface
- [ ] Light + dark parity
- [ ] Global audience readability + subtle Vedic identity

---

## Gate

**Visual identity established.** Frontend redesign and token migration may proceed **only after explicit approval** of this document.
