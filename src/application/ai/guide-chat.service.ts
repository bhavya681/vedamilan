import { routes } from "@/lib/constants/routes";
import { trySolveMath } from "@/application/ai/chat-intent";

type GuideTopic = {
  keys: string[];
  title: string;
  answer: string;
};

const TOPICS: GuideTopic[] = [
  {
    keys: [
      "how it works",
      "how does vedamilan",
      "how does the app",
      "get started",
      "getting started",
      "begin",
      "overview",
      "steps",
    ],
    title: "How VedaMilan works",
    answer: `VedaMilan is a **Vedic relationship intelligence** platform — matchmaking plus kundli, compatibility, timing, and AI guidance.

### Three steps
1. **Create an account** and complete your profile (photo required).
2. **Save birth details** (date, time, place) so we can generate your kundli.
3. **Explore matches**, run **Ashta Koota** compatibility, and ask **AI Guru** for chart-backed insights.

Start here: [Register](${routes.register}) → [Birth details](${routes.birthDetails}) after login.`,
  },
  {
    keys: ["kundli", "chart", "horoscope", "birth", "lagna", "ayanamsa", "ephemeris"],
    title: "Kundli & birth details",
    answer: `Your kundli is calculated by our **Swiss Ephemeris rule engine** (not invented by the AI).

### What you do
1. Open **Birth details** and enter accurate date, time, and place.
2. Generate / refresh your kundli from the dashboard.
3. View North/South/East charts, planets, nakshatra, dasha, and transit pages.

AI (**AI Guru**) only **explains** engine output — it does not recalculate positions.

Default ayanamsa: **Lahiri**.`,
  },
  {
    keys: ["match", "matching", "recommend", "search", "like", "shortlist", "discover", "feed"],
    title: "Matching & discovery",
    answer: `After your profile and kundli are ready:

- **Matches / Recommendations** — ranked profiles with Vedic + preference fit.
- **Search** — filter by city, profession, and more.
- **Likes & Shortlist** — save people you want to revisit.
- **Visitors** — see who viewed your profile.

Tip: complete preferences and upload a clear photo so ranking and first impressions stay strong.`,
  },
  {
    keys: [
      "compat",
      "compatibility",
      "guna milan",
      "guna",
      "ashta koota",
      "ashta",
      "manglik",
      "dosha",
    ],
    title: "Compatibility (Ashta Koota)",
    answer: `Open **Compatibility**, pick a candidate, and run **deep milan**.

You get:
- **Shukra Milan** (Venus-sign matching)
- Weighted modules (personality, Moon, 7th, D9, longevity…)
- Classical **Ashta Koota (Guna Milan)**
- Decision summary + practical remedies

Reports stay in your dashboard so you can revisit and compare thoughtfully.`,
  },
  {
    keys: ["ai", "guru", "insight", "chat", "coach", "astrologer"],
    title: "AI Guru",
    answer: `Inside the app, **AI Insights** is your **AI Guru** chat.

Ask about:
- Raja Yogas and chart themes
- Current Mahadasha / Antardasha
- Gochar (transits)
- Marriage timing windows

Answers are grounded in **your stored kundli data**. On this home helper, I explain how the product works — for personal chart readings, sign in and open AI Guru.`,
  },
  {
    keys: ["price", "pricing", "plan", "premium", "billing", "payment", "subscription"],
    title: "Plans & billing",
    answer: `Plans are listed on the [Pricing](${routes.pricing}) page (Essence, Sangam, Parampara).

- Free / starter access covers core onboarding and kundli basics (see current plan limits in-app).
- Premium unlocks richer matching, timing, coaching, and reports.
- Billing lives under **Dashboard → Billing** after you sign in.

For invoice or payment issues, use [Support](${routes.support}) or [Contact](${routes.contact}).`,
  },
  {
    keys: ["privacy", "secure", "data", "safe", "consent", "password"],
    title: "Privacy & safety",
    answer: `Birth details are **not shown publicly** without your control. Profile visibility and privacy settings live in **Settings**.

- Photos and personal data follow our [Privacy Policy](${routes.privacy}).
- You can report concerns from the app and via [Support](${routes.support}).
- Use a strong password and verify email during signup.`,
  },
  {
    keys: ["message", "chat", "video", "talk", "conversation"],
    title: "Messaging",
    answer: `Once you connect with a match, use **Messages / Chat** in the dashboard for secure conversation.

Video chat is available where enabled on your plan. Keep conversations respectful — VedaMilan is built for intentional introductions, not spam.`,
  },
  {
    keys: ["consult", "expert", "book", "astrologer session"],
    title: "Expert consultation",
    answer: `Prefer a human astrologer? Open **Consultation** in the dashboard to book a session.

Use AI Insights for everyday chart Q&A; use consultation when you want deeper, live guidance.`,
  },
  {
    keys: ["account", "register", "login", "sign up", "signup", "sign in"],
    title: "Account",
    answer: `### New here
1. [Create an account](${routes.register})
2. Verify email / OTP if prompted
3. Complete profile + photo
4. Add birth details and generate kundli

### Returning
[Sign in](${routes.login}) to reach your dashboard.`,
  },
];

const FALLBACK = `I can help you understand **how VedaMilan works**.

Try asking about:
- Getting started / how it works
- Kundli & birth details
- Matching & search
- Compatibility (Guna Milan)
- AI Guru / chart insights
- Pricing or privacy

Or jump in: [Register](${routes.register}) · [Pricing](${routes.pricing}) · [FAQ](${routes.faq}) · [Help](${routes.help})`;

function scoreTopic(message: string, topic: GuideTopic): number {
  const q = message.toLowerCase();
  let score = 0;
  for (const key of topic.keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const re = new RegExp(`\\b${escaped}\\b`, "i");
    if (!re.test(q)) continue;
    const weight = key.length >= 5 ? 4 : key.length >= 4 ? 3 : 1;
    score += weight;
  }
  return score;
}

export function answerProductGuide(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return FALLBACK;

  const math = trySolveMath(trimmed);
  if (math) {
    return `${math}\n\nFor VedaMilan help, ask about getting started, kundli, matching, compatibility, or AI Guru.`;
  }

  if (/^(hi|hello|hey|namaste)\b/i.test(trimmed) && trimmed.length < 40) {
    return `Namaste — I am the **landing guide** for VedaMilan.\n\nAsk me how the app works, how kundli is calculated, matching, compatibility, or billing. For chart readings after login, open **AI Guru** in your dashboard.`;
  }

  let best: GuideTopic | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const s = scoreTopic(trimmed, topic);
    if (s > bestScore) {
      bestScore = s;
      best = topic;
    }
  }

  if (!best || bestScore < 1) {
    return `I am best at product questions about VedaMilan (getting started, kundli, matching, compatibility, AI Guru, billing).\n\nYou asked: “${trimmed.slice(0, 160)}” — try rephrasing toward how the platform works, or [register](${routes.register}) and ask **AI Guru** for chart-backed guidance.`;
  }

  return `### ${best.title}\n\n${best.answer}`;
}
