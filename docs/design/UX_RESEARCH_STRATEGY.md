# VedaMilan AI — UX Research & UI Strategy

> Research-first deliverable. **No UI implementation in this document.**  
> Companion canvas: `vedamilan-ux-research-strategy.canvas.tsx`

## Objective

Position VedaMilan AI as a **premium global Relationship Intelligence OS**—not a traditional matrimonial portal and not an astrology marketplace.

---

## 1. UX Audit (category patterns)

### Indian matrimony (Shaadi, Jeevansathi, Bharat Matrimony, Betterhalf, Community Matrimony)

| Dimension | Pattern                                                             |
| --------- | ------------------------------------------------------------------- |
| IA        | Register → Preferences → Search/Matches → Interest → Chat → Premium |
| Hero      | Trust volume, search forms, app download, dense inventory framing   |
| Profiles  | Photo + demographics + community; verification badges               |
| Search    | Deep filters (religion, community, city, education); saved searches |
| Trust     | ID verification, privacy controls, elite relationship managers      |
| Premium   | Contact unlock, spotlight, unlimited messaging                      |
| Weakness  | Marketplace noise, weak explainability, dated or pink-red chrome    |

### Astrology (AstroTalk, AstroSage, InstaAstro, ClickAstro, AstroVed)

| Dimension    | Pattern                                                          |
| ------------ | ---------------------------------------------------------------- |
| IA           | Free kundli/horoscope → wallet → live consult → reports/products |
| Charts       | Deep engines (dasha, KP, matching) but cluttered navigation      |
| Monetization | Pay-per-minute, wallet anxiety, remedy/product upsells           |
| AI           | Emerging AI kundli chat; rarely explainable relationship ranking |
| Weakness     | Fear-based CTAs; session urgency over calm decision support      |

### Dating (Bumble, Hinge, Tinder, Aisle)

| Dimension | Pattern                                               |
| --------- | ----------------------------------------------------- |
| Discovery | Large photography, prompts, intentional openers       |
| Messaging | Context-rich; low family/ceremony affordances         |
| Steal     | Photo-forward cards, quality signals, calm chat       |
| Avoid     | Infinite swipe addiction; casual framing for marriage |

### World-class SaaS / consumer (Apple, Linear, Notion, Stripe, Airbnb, Vercel, Framer, Arc, Headspace, Spotify)

| Dimension  | Pattern                                                             |
| ---------- | ------------------------------------------------------------------- |
| Craft      | Hierarchy, whitespace, restrained motion, progressive disclosure    |
| Conversion | Honest pricing, value-before-gate                                   |
| Emotion    | Atmosphere + calm (Airbnb/Headspace), personalization without panic |

---

## 2. Competitor comparison (steal / avoid)

See interactive matrix in the canvas. Summary:

- **Steal from matrimony:** verification, saved search, interest gating, community as first-class filter
- **Steal from astrology:** chart completeness, PDF reports, expert booking patterns
- **Steal from dating:** photo cards, prompts, intentional messaging
- **Steal from SaaS:** typography, IA clarity, pricing honesty, empty/loading craft
- **Avoid:** portal density, pink marketplace UI, wallet panic, cheesy zodiac, fear CTAs, swipe addiction

---

## 3. UI pain points

1. Inventory browsing over decision clarity
2. Compatibility as opaque score
3. Family participation bolted on
4. Kundli either clinical or cluttered
5. Premium lock walls without value moments
6. Mobile = stacked desktop
7. Trust = badges only
8. AI as gimmick
9. Chat lacks match context
10. Astrology monetization anxiety

## 4. UI opportunities

1. Relationship Intelligence OS framing
2. Photo discovery + dual Vedic/AI scores
3. Compatibility as calm analytics
4. Birth → Chart → Timing → Match → Consult continuum
5. Explainable AI with confidence
6. Family advisor share for reports
7. Premium at insight moments
8. Cinematic, section-budgeted landing
9. Workspace IA: Discover / Vedic / Intelligence / Connect
10. Designed empty/loading/error states

---

## 5. Design language

**Luxury Vedic × Spiritual Technology** — calm, ceremonial, explainable, modern. Glass and aurora used sparingly. Sacred geometry as texture—not cartoon astrology.

## 6–8. Color, type, spacing

**Superseded** by the canonical visual identity: [`VISUAL_IDENTITY.md`](./VISUAL_IDENTITY.md).

Key tokens (authoritative):

| Token                      | Hex                    |
| -------------------------- | ---------------------- |
| Royal Gold (primary)       | `#C89B3C`              |
| Temple Blue (secondary)    | `#1D4ED8`              |
| Sacred Saffron (accent)    | `#E88A14`              |
| Warm Ivory (background)    | `#FAF8F4`              |
| Midnight Navy (dark)       | `#071120`              |
| AI Aurora                  | Purple → Blue → Gold   |
| Success / Warning / Danger | Emerald / Amber / Ruby |

## 9. Component inventory

Buttons, inputs, selects, tabs, accordion, dialog/drawer, toast, tooltip, avatar, badge, progress, skeleton, empty/error, GlassCard, StatCard, MatchCard (photo+ring), PlanetCard, HoroscopeCard, CompatibilityCard, AIInsightCard, Timeline, RadarChart, Stepper, Calendar, ChatBubble, VoiceWave, PricingCard, TrustBadge, PremiumGate, overlay/sidebar/bottom nav

## 10. Sitemap

**Marketing:** `/` about pricing blog faq contact help support terms privacy cookies  
**Auth:** login register otp forgot/reset/verify  
**Workspace:** dashboard, profile, preferences, birth, kundli (+ charts/planets/nakshatra/dasha/transit/timing), horoscope, compatibility, AI insights, search, matches, visitors/likes/shortlist, chat, notifications, premium/billing, reports, consultation, settings, admin

## 11. User flows

1. **Seeker match:** Land → Register → Birth → Chart → Preferences → Matches → Compatibility → Chat → optional Consult → family share
2. **Intelligence-first:** Demo kundli/timing → Register → Windows → Match by timing+guna → Shortlist
3. **Family advisor:** Invite → Shared dossier → Approve → Member continues privately
4. **Premium:** Insight moment → Value preview → Plans → Checkout → Unlock

## 12. Wireframe recommendations

- Landing: brand-first cinematic hero; few sections; one job each
- Dashboard: greeting + stats + horoscope/AI + photo matches + timing rail
- Matches: filters + photo cards + sticky explain panel
- Compatibility: score header + radar + koota + AI narrative
- Chat: master–detail on mobile; score context header

## 13. Responsive strategy

Breakpoints 640/768/1024/1280/1536+ · Mobile bottom nav · Tablet collapsible sidebar · Desktop grouped sidebar · Ultra-wide max-width, not stretched cards · Redesign per breakpoint

## 14. Motion guidelines

160/280/520ms · ease-out-expo · page fade+rise · stagger 40–80ms · hover 4–6px · parallax with reduced-motion off · transform/opacity only

## 15. Accessibility

WCAG AA · focus rings · skip links · keyboard · alt text · chart text alternatives · chat live regions · reduced motion · semantic headings · dark mode parity

## 16. Premium placement

Soft gates after value (reports, timing, family seats, priority). Hard gates sparingly. Upgrade at timing window / PDF ready—not on every row.

## 17. AI experience

Always drivers + confidence. Ranking, coaching, timing narrative, report summary, search understanding. AI interprets; Vedic engine calculates. Privacy-scoped memory. Streaming insights.

## 18. Final UI strategy

**Thesis:** Calm Relationship Intelligence OS = Vedic truth + explainable AI + intentional discovery + expert consult + Apple/Linear craft + Airbnb warmth.

**North-star screens (design order):** Landing → Match feed → Profile → Dashboard → Compatibility → Horoscope studio → Chat → Premium → Consultation → Onboarding birth→chart

**Success criteria:** Brand-test hero · trust in &lt;10s · explainable matches · ceremonial-modern charts · earned premium · redesigned mobile · AA · visually distinct from Shaadi/AstroTalk

---

## Gate

Research complete. Frontend design may proceed **only** against this strategy: preserve functionality, invent original Luxury Vedic × AI language, do not clone portal layouts.
