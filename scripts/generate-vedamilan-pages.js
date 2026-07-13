const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "../src/app");

const pages = [
  ["(landing)/about/page.tsx", "About", "The story behind VedaMilan AI", "about"],
  ["(landing)/pricing/page.tsx", "Pricing", "Memberships with intention", "pricing"],
  ["(landing)/blog/page.tsx", "Blog", "Research and relationship intelligence", "blog"],
  ["(landing)/faq/page.tsx", "FAQ", "Answers with clarity", "faq"],
  ["(landing)/contact/page.tsx", "Contact", "We respond with care", "contact"],
  ["(landing)/help/page.tsx", "Help Center", "Guides for every journey", "help"],
  ["(landing)/support/page.tsx", "Support", "Talk to our care team", "support"],
  ["(landing)/terms/page.tsx", "Terms of Service", "Agreements that protect both sides", "terms"],
  ["(landing)/privacy/page.tsx", "Privacy Policy", "How we treat your sacred data", "privacy"],
  ["(landing)/cookies/page.tsx", "Cookie Policy", "Transparent preference storage", "cookies"],
  [
    "(dashboard)/dashboard/profile/page.tsx",
    "Profile",
    "Your public and private identity",
    "profile",
  ],
  [
    "(dashboard)/dashboard/profile/edit/page.tsx",
    "Edit Profile",
    "Refine how you are discovered",
    "edit-profile",
  ],
  [
    "(dashboard)/dashboard/preferences/page.tsx",
    "Partner Preferences",
    "Intentional filters for discovery",
    "preferences",
  ],
  [
    "(dashboard)/dashboard/birth-details/page.tsx",
    "Birth Details",
    "Precision inputs for Vedic charts",
    "birth",
  ],
  ["(dashboard)/dashboard/kundli/page.tsx", "Kundli", "Your Vedic chart workspace", "kundli"],
  [
    "(dashboard)/dashboard/kundli/north/page.tsx",
    "North Indian Chart",
    "Diamond-style kundli view",
    "chart-north",
  ],
  [
    "(dashboard)/dashboard/kundli/south/page.tsx",
    "South Indian Chart",
    "Grid-style kundli view",
    "chart-south",
  ],
  [
    "(dashboard)/dashboard/kundli/east/page.tsx",
    "East Indian Chart",
    "Eastern chart presentation",
    "chart-east",
  ],
  [
    "(dashboard)/dashboard/kundli/planets/page.tsx",
    "Planet Details",
    "Positions, dignity, and themes",
    "planets",
  ],
  [
    "(dashboard)/dashboard/kundli/nakshatra/page.tsx",
    "Nakshatra",
    "Lunar mansion insights",
    "nakshatra",
  ],
  [
    "(dashboard)/dashboard/kundli/dasha/page.tsx",
    "Dasha Timeline",
    "Mahadasha and antardasha clarity",
    "dasha",
  ],
  [
    "(dashboard)/dashboard/kundli/transit/page.tsx",
    "Transit Analysis",
    "Current planetary weather",
    "transit",
  ],
  [
    "(dashboard)/dashboard/kundli/marriage-timing/page.tsx",
    "Marriage Timing",
    "Activation windows with context",
    "timing",
  ],
  [
    "(dashboard)/dashboard/compatibility/page.tsx",
    "Compatibility",
    "Guna Milan and AI harmony",
    "compat",
  ],
  [
    "(dashboard)/dashboard/compatibility/report/page.tsx",
    "Compatibility Report",
    "Shareable relationship dossier",
    "compat-report",
  ],
  [
    "(dashboard)/dashboard/ai-insights/page.tsx",
    "AI Insights",
    "Explainable relationship intelligence",
    "ai",
  ],
  [
    "(dashboard)/dashboard/recommendations/page.tsx",
    "Recommendations",
    "Prioritized next actions",
    "recs",
  ],
  ["(dashboard)/dashboard/search/page.tsx", "Search", "Discover with intention", "search"],
  [
    "(dashboard)/dashboard/search/filters/page.tsx",
    "Advanced Filters",
    "Precision discovery controls",
    "filters",
  ],
  [
    "(dashboard)/dashboard/matches/profile/page.tsx",
    "Match Profile",
    "Deep profile and chart context",
    "match-profile",
  ],
  ["(dashboard)/dashboard/visitors/page.tsx", "Visitors", "Who viewed your profile", "visitors"],
  ["(dashboard)/dashboard/likes/page.tsx", "Likes", "Interest signals", "likes"],
  [
    "(dashboard)/dashboard/shortlisted/page.tsx",
    "Shortlisted",
    "Profiles you are considering",
    "shortlist",
  ],
  ["(dashboard)/dashboard/messages/page.tsx", "Messages", "Secure conversations", "messages"],
  [
    "(dashboard)/dashboard/notifications/page.tsx",
    "Notifications",
    "Matches, messages, and reports",
    "notifications",
  ],
  ["(dashboard)/dashboard/premium/page.tsx", "Premium", "Unlock full intelligence", "premium"],
  ["(dashboard)/dashboard/billing/invoices/page.tsx", "Invoices", "Payment history", "invoices"],
  ["(dashboard)/dashboard/downloads/page.tsx", "Downloads", "Reports and exports", "downloads"],
  ["(dashboard)/dashboard/reports/page.tsx", "Reports", "Generated Vedic dossiers", "reports"],
  [
    "(dashboard)/dashboard/consultation/page.tsx",
    "Consultation",
    "Speak with verified experts",
    "consult",
  ],
  [
    "(dashboard)/dashboard/consultation/book/page.tsx",
    "Book Consultation",
    "Choose time with an expert",
    "book",
  ],
  [
    "(dashboard)/dashboard/consultation/astrologer/page.tsx",
    "Astrologer Profile",
    "Expert credentials and slots",
    "astrologer",
  ],
  [
    "(dashboard)/dashboard/calendar/page.tsx",
    "Calendar",
    "Sessions and timing windows",
    "calendar",
  ],
  [
    "(dashboard)/dashboard/settings/security/page.tsx",
    "Security",
    "Password and sessions",
    "security",
  ],
  [
    "(dashboard)/dashboard/settings/privacy/page.tsx",
    "Privacy",
    "Visibility and data controls",
    "privacy-settings",
  ],
];

const imports = `import Link from "next/link";
import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard, StatCard, MatchCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/constants/routes";
import {
  mockMatches,
  mockPlanets,
  mockDasha,
  mockTransits,
  mockMarriageTiming,
  mockGunaMilan,
  mockAiInsights,
  mockNotifications,
  mockAstrologers,
  mockReports,
  mockInvoices,
  mockBlogPosts,
  mockFaqs,
  mockPricingPlans,
  mockUser,
  mockBirthDetails,
  mockPreferences,
  mockVisitors,
  mockLikes,
  mockShortlisted,
  mockHoroscopeDaily,
  mockConversations,
  mockAntardasha,
} from "@/lib/mock/vedamilan";
`;

const bodies = {
  about: `<>
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-2xl">Built for intentional unions</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            VedaMilan AI is a relationship intelligence platform—not a scrolling marketplace.
            We combine Swiss-Ephemeris-grade Vedic charts, explainable AI matching, marriage timing,
            dasha narratives, and expert consultation in one calm workspace.
          </p>
          <div className="lotus-divider mt-8" />
          <p className="mt-8 text-sm text-muted-foreground">
            Designed for modern professionals and families who want clarity without fear-based astrology.
          </p>
        </GlassCard>
        <div className="space-y-4">
          <StatCard label="Members exploring" value="48k+" hint="India + NRI" tone="gold" />
          <StatCard label="Avg. compatibility clarity" value="87%" hint="Explainable scores" tone="ai" />
        </div>
      </div>
    </>`,
  pricing: `<>
      <div className="grid gap-6 lg:grid-cols-3">
        {mockPricingPlans.map((plan) => (
          <GlassCard key={plan.name} glow={plan.highlighted} className={plan.highlighted ? "bg-navy text-ivory" : ""}>
            <h2 className="font-display text-2xl">{plan.name}</h2>
            <p className={\`mt-2 text-sm \${plan.highlighted ? "text-ivory/75" : "text-muted-foreground"}\`}>{plan.description}</p>
            <p className="mt-6 font-display text-4xl">{plan.price}<span className="text-base opacity-70">{plan.period}</span></p>
            <ul className="mt-6 space-y-2 text-sm">{plan.features.map((f) => <li key={f}>• {f}</li>)}</ul>
            <Button asChild className="mt-8 w-full" variant={plan.highlighted ? "default" : "outline"}>
              <Link href={routes.register}>Choose {plan.name}</Link>
            </Button>
          </GlassCard>
        ))}
      </div>
    </>`,
  blog: `<>
      <div className="grid gap-4 md:grid-cols-3">
        {mockBlogPosts.map((post) => (
          <GlassCard key={post.slug}>
            <Badge>{post.tag}</Badge>
            <h2 className="mt-3 font-display text-xl">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-4 text-xs text-muted-foreground">{post.author} · {post.date}</p>
          </GlassCard>
        ))}
      </div>
    </>`,
  faq: `<>
      <div className="space-y-3">
        {mockFaqs.map((item) => (
          <GlassCard key={item.q}>
            <h2 className="font-display text-xl">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </GlassCard>
        ))}
      </div>
    </>`,
  contact: `<>
      <GlassCard className="max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" defaultValue="Ananya Sharma" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" defaultValue="ananya.sharma@email.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" rows={5} defaultValue="I would like guidance on marriage timing reports for my family." />
        </div>
        <Button type="button">Send message</Button>
      </GlassCard>
    </>`,
  help: `<>
      <div className="grid gap-4 md:grid-cols-2">
        {["Getting started", "Kundli basics", "Compatibility reports", "Billing and premium"].map((t) => (
          <GlassCard key={t}>
            <h2 className="font-display text-xl">{t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Step-by-step guidance with calm explanations.</p>
          </GlassCard>
        ))}
      </div>
    </>`,
  support: `<>
      <GlassCard>
        <p className="text-sm text-muted-foreground">Care hours: Mon–Sat · 9:00 AM – 9:00 PM IST</p>
        <p className="mt-4 font-display text-2xl">support@vedamilan.ai</p>
        <Button asChild className="mt-6"><Link href={routes.contact}>Open contact form</Link></Button>
      </GlassCard>
    </>`,
  terms: `<>
      <GlassCard>
        <p className="text-sm leading-relaxed text-muted-foreground">These demo Terms describe how members use VedaMilan AI for relationship intelligence, matchmaking, and Vedic reports.</p>
        <p className="mt-4 text-sm text-muted-foreground">Members agree to provide accurate birth details, respect privacy of other members, and use AI insights as guidance—not absolute destiny.</p>
      </GlassCard>
    </>`,
  privacy: `<>
      <GlassCard>
        <p className="text-sm leading-relaxed text-muted-foreground">Birth data, charts, and messages are treated as sensitive. This frontend demo uses mock data only and does not transmit personal information to a backend.</p>
        <p className="mt-4 text-sm text-muted-foreground">You control profile visibility, photo access, and report sharing from Privacy settings.</p>
      </GlassCard>
    </>`,
  cookies: `<>
      <GlassCard>
        <p className="text-sm text-muted-foreground">Essential cookies keep you signed in and remember theme preference. Analytics cookies are optional in production builds.</p>
      </GlassCard>
    </>`,
  profile: `<>
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl">{mockUser.name}</h2>
              <p className="mt-1 text-muted-foreground">{mockUser.age} · {mockUser.city} · {mockUser.profession}</p>
              <div className="mt-3 flex gap-2"><Badge>{mockUser.membership}</Badge>{mockUser.verified ? <Badge variant="secondary">Verified</Badge> : null}</div>
            </div>
            <Button asChild><Link href={routes.editProfile}>Edit profile</Link></Button>
          </div>
          <p className="mt-6 text-sm leading-relaxed">{mockUser.about}</p>
        </GlassCard>
        <StatCard label="Profile strength" value={\`\${mockUser.profileStrength}%\`} hint="Complete family details" tone="gold" />
      </div>
    </>`,
  "edit-profile": `<>
      <GlassCard className="max-w-2xl space-y-4">
        {[["Full name", mockUser.name],["Profession", mockUser.profession],["City", mockUser.city],["Education", mockUser.education]].map(([label, value]) => (
          <div key={label}><label className="text-sm font-medium">{label}</label><input className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" defaultValue={value} /></div>
        ))}
        <div><label className="text-sm font-medium">About</label><textarea className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" rows={4} defaultValue={mockUser.about} /></div>
        <Button type="button">Save changes</Button>
      </GlassCard>
    </>`,
  preferences: `<>
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard><p className="text-xs uppercase text-muted-foreground">Age</p><p className="mt-2 font-display text-2xl">{mockPreferences.ageRange[0]} – {mockPreferences.ageRange[1]}</p></GlassCard>
        <GlassCard><p className="text-xs uppercase text-muted-foreground">Cities</p><p className="mt-2 text-sm">{mockPreferences.cities.join(" · ")}</p></GlassCard>
        <GlassCard><p className="text-xs uppercase text-muted-foreground">Education</p><p className="mt-2 text-sm">{mockPreferences.education.join(" · ")}</p></GlassCard>
        <GlassCard><p className="text-xs uppercase text-muted-foreground">Lifestyle</p><p className="mt-2 text-sm">Diet: {mockPreferences.diet.join(", ")} · Smoking: {mockPreferences.smoking}</p></GlassCard>
      </div>
    </>`,
  birth: `<>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(mockBirthDetails).map(([k,v]) => (
          <GlassCard key={k}><p className="text-xs uppercase text-muted-foreground">{k}</p><p className="mt-2 font-medium">{String(v)}</p></GlassCard>
        ))}
      </div>
    </>`,
  kundli: `<>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{t:"North Indian",h:routes.chartNorth},{t:"South Indian",h:routes.chartSouth},{t:"East Indian",h:routes.chartEast},{t:"Planets",h:routes.planets},{t:"Nakshatra",h:routes.nakshatra},{t:"Dasha",h:routes.dasha},{t:"Transit",h:routes.transit},{t:"Marriage Timing",h:routes.marriageTiming}].map((i) => (
          <Link key={i.t} href={i.h}><GlassCard className="transition hover:-translate-y-1"><h2 className="font-display text-xl">{i.t}</h2><p className="mt-2 text-sm text-muted-foreground">Open workspace</p></GlassCard></Link>
        ))}
      </div>
    </>`,
  "chart-north": `<>
      <GlassCard>
        <div className="mx-auto flex aspect-square max-w-md items-center justify-center rounded-3xl border border-gold/30 bg-brand-dual-soft p-6">
          <p className="font-display text-2xl text-brand-dual">North Indian Kundli</p>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Lagna {mockBirthDetails.lagna} · Moon {mockBirthDetails.rashi} · {mockBirthDetails.nakshatra} pada {mockBirthDetails.pada}</p>
      </GlassCard>
    </>`,
  "chart-south": `<>
      <GlassCard>
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 rounded-2xl border border-border p-2">
          {Array.from({length:16}).map((_,i)=>(<div key={i} className="flex aspect-square items-center justify-center rounded-lg bg-muted/60 text-[10px] text-muted-foreground">{i+1}</div>))}
        </div>
      </GlassCard>
    </>`,
  "chart-east": `<>
      <GlassCard className="text-center"><p className="font-display text-3xl text-brand-dual">East Indian Chart</p><p className="mt-3 text-sm text-muted-foreground">Ceremonial layout with house-first reading order.</p></GlassCard>
    </>`,
  planets: `<>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {mockPlanets.map((p) => (
          <GlassCard key={p.name}>
            <div className="flex items-center justify-between"><h2 className="font-display text-xl">{p.name}</h2><Badge>{p.sign}</Badge></div>
            <p className="mt-2 text-sm text-muted-foreground">House {p.house} · {p.degree} · {p.dignity}</p>
            <p className="mt-2 text-xs text-ai">{p.nature}</p>
          </GlassCard>
        ))}
      </div>
    </>`,
  nakshatra: `<>
      <GlassCard>
        <h2 className="font-display text-3xl">{mockBirthDetails.nakshatra}</h2>
        <p className="mt-2 text-muted-foreground">Pada {mockBirthDetails.pada} · Moon in {mockBirthDetails.rashi}</p>
        <p className="mt-6 text-sm leading-relaxed">Ardra brings intensity, curiosity, and transformative emotional intelligence. Channel this into honest conversations and creative problem-solving in partnerships.</p>
      </GlassCard>
    </>`,
  dasha: `<>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">{mockDasha.map((d) => (
          <GlassCard key={d.planet} glow={d.active}>
            <div className="flex justify-between gap-3"><h2 className="font-display text-xl">{d.planet}</h2>{d.active ? <Badge>Active</Badge> : null}</div>
            <p className="mt-1 text-xs text-muted-foreground">{d.start} → {d.end}</p>
            <p className="mt-3 text-sm">{d.theme}</p>
          </GlassCard>
        ))}</div>
        <div className="space-y-3">{mockAntardasha.map((a) => (
          <GlassCard key={a.planet}><p className="font-medium">{a.planet}</p><p className="text-xs text-muted-foreground">{a.period}</p><p className="mt-2 text-sm text-muted-foreground">{a.note}</p></GlassCard>
        ))}</div>
      </div>
    </>`,
  transit: `<>
      <div className="space-y-3">{mockTransits.map((t) => (
        <GlassCard key={t.planet + t.date}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-xl">{t.planet}</h2><Badge variant="secondary">{t.date}</Badge></div>
          <p className="mt-2 text-sm">{t.from} → {t.to}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t.impact}</p>
        </GlassCard>
      ))}</div>
    </>`,
  timing: `<>
      <div className="space-y-4">{mockMarriageTiming.map((w) => (
        <GlassCard key={w.window} glow={w.score > 90}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs uppercase text-crimson">{w.label}</p><h2 className="font-display text-2xl">{w.window}</h2></div>
            <p className="font-display text-3xl text-brand-dual">{w.score}</p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{w.reason}</p>
        </GlassCard>
      ))}</div>
    </>`,
  compat: `<>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockGunaMilan.map((g) => (
          <GlassCard key={g.koota}>
            <p className="text-xs uppercase text-muted-foreground">{g.koota}</p>
            <p className="mt-2 font-display text-3xl text-rose">{g.score}/{g.max}</p>
            <p className="mt-2 text-xs text-muted-foreground">{g.note}</p>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6"><Button asChild><Link href={routes.compatibilityReport}>Open full report</Link></Button></div>
    </>`,
  "compat-report": `<>
      <GlassCard>
        <h2 className="font-display text-3xl">Ananya × Rohan</h2>
        <p className="mt-2 text-muted-foreground">Total Guna {mockGunaMilan.reduce((s,g)=>s+g.score,0)} / 36 · AI harmony 89%</p>
        <p className="mt-6 text-sm leading-relaxed">Families can share this dossier securely. Strengths center on Graha Maitri and Nadi clarity, with practical pacing advised around career travel months.</p>
        <Button className="mt-6" variant="secondary">Download PDF</Button>
      </GlassCard>
    </>`,
  ai: `<>
      <div className="space-y-4">{mockAiInsights.map((i) => (
        <GlassCard key={i.id} className="glow-border">
          <div className="flex flex-wrap gap-2">{i.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
          <h2 className="mt-3 font-display text-2xl">{i.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
          <p className="mt-4 text-xs text-ai">Confidence {i.confidence}%</p>
        </GlassCard>
      ))}</div>
    </>`,
  recs: `<>
      <div className="grid gap-4 md:grid-cols-2">
        {mockMatches.slice(0,4).map((m) => (
          <MatchCard key={m.id} name={m.name} age={m.age} city={m.city} profession={m.profession} score={m.score} aiScore={m.aiScore} headline={m.headline} />
        ))}
      </div>
    </>`,
  search: `<>
      <GlassCard className="mb-6">
        <input className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder="Search by city, profession, values…" defaultValue="Bengaluru designer family-oriented" />
        <div className="mt-3 flex gap-2"><Button>Search</Button><Button asChild variant="outline"><Link href={routes.filters}>Advanced filters</Link></Button></div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2">{mockMatches.map((m) => (
        <MatchCard key={m.id} name={m.name} age={m.age} city={m.city} profession={m.profession} score={m.score} aiScore={m.aiScore} headline={m.headline} />
      ))}</div>
    </>`,
  filters: `<>
      <GlassCard className="grid gap-4 md:grid-cols-2">
        {["Age range","Height","City","Education","Manglik","Diet"].map((f) => (
          <div key={f}><label className="text-sm font-medium">{f}</label><select className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"><option>Any</option><option>Preferred</option></select></div>
        ))}
        <Button className="md:col-span-2">Apply filters</Button>
      </GlassCard>
    </>`,
  "match-profile": `<>
      <GlassCard>
        <h2 className="font-display text-3xl">{mockMatches[0].name}</h2>
        <p className="mt-1 text-muted-foreground">{mockMatches[0].age} · {mockMatches[0].city} · {mockMatches[0].profession} @ {mockMatches[0].company}</p>
        <p className="mt-6 text-sm leading-relaxed">{mockMatches[0].headline}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button>Send interest</Button>
          <Button variant="secondary">Shortlist</Button>
          <Button asChild variant="outline"><Link href={routes.compatibility}>Run compatibility</Link></Button>
        </div>
      </GlassCard>
    </>`,
  visitors: `<>
      <div className="space-y-3">{mockVisitors.map((v) => (
        <GlassCard key={v.name} className="flex items-center justify-between"><div><p className="font-medium">{v.name}</p><p className="text-xs text-muted-foreground">{v.city} · {v.when}</p></div><Badge>{v.score}%</Badge></GlassCard>
      ))}</div>
    </>`,
  likes: `<>
      <div className="space-y-3">{mockLikes.map((l) => (
        <GlassCard key={l.name} className="flex items-center justify-between"><div><p className="font-medium">{l.name}</p><p className="text-xs text-muted-foreground">{l.city} · {l.mutual ? "Mutual" : "Liked you"}</p></div><Badge>{l.score}%</Badge></GlassCard>
      ))}</div>
    </>`,
  shortlist: `<>
      <div className="space-y-3">{mockShortlisted.map((s) => (
        <GlassCard key={s.name}><div className="flex justify-between"><p className="font-display text-xl">{s.name}</p><Badge>{s.score}%</Badge></div><p className="mt-2 text-sm text-muted-foreground">{s.note}</p></GlassCard>
      ))}</div>
    </>`,
  messages: `<>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">{mockConversations.map((c) => (
          <GlassCard key={c.id}><p className="font-medium">{c.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{c.preview}</p></GlassCard>
        ))}</div>
        <GlassCard className="lg:col-span-2">
          <p className="font-display text-2xl">{mockConversations[0].name}</p>
          <div className="mt-4 space-y-3">{mockConversations[0].messages.map((m) => (
            <div key={m.id} className={\`max-w-[80%] rounded-2xl px-3 py-2 text-sm \${m.from==="me" ? "ml-auto bg-primary/15" : "bg-muted"}\`}>{m.text}</div>
          ))}</div>
        </GlassCard>
      </div>
    </>`,
  notifications: `<>
      <div className="space-y-3">{mockNotifications.map((n) => (
        <GlassCard key={n.id} className={!n.read ? "glow-border" : ""}>
          <div className="flex justify-between gap-3"><p className="font-medium">{n.title}</p><span className="text-xs text-muted-foreground">{n.time}</span></div>
          <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
        </GlassCard>
      ))}</div>
    </>`,
  premium: `<>
      <GlassCard glow>
        <h2 className="font-display text-3xl">Sangam Premium</h2>
        <p className="mt-2 text-muted-foreground">You are on the recommended plan for full relationship intelligence.</p>
        <div className="mt-6 flex gap-2"><Button asChild><Link href={routes.checkout}>Manage billing</Link></Button><Button asChild variant="outline"><Link href={routes.pricing}>Compare plans</Link></Button></div>
      </GlassCard>
    </>`,
  invoices: `<>
      <div className="space-y-3">{mockInvoices.map((inv) => (
        <GlassCard key={inv.id} className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-medium">{inv.id}</p><p className="text-xs text-muted-foreground">{inv.plan} · {inv.date}</p></div>
          <div className="text-right"><p className="font-display text-xl">{inv.amount}</p><Badge>{inv.status}</Badge></div>
        </GlassCard>
      ))}</div>
    </>`,
  downloads: `<>
      <div className="space-y-3">{mockReports.filter((r)=>r.status==="Ready").map((r) => (
        <GlassCard key={r.id} className="flex items-center justify-between"><div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.size} · {r.date}</p></div><Button size="sm" variant="secondary">Download</Button></GlassCard>
      ))}</div>
    </>`,
  reports: `<>
      <div className="space-y-3">{mockReports.map((r) => (
        <GlassCard key={r.id} className="flex items-center justify-between"><div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.type} · {r.date}</p></div><Badge variant={r.status==="Ready"?"default":"secondary"}>{r.status}</Badge></GlassCard>
      ))}</div>
    </>`,
  consult: `<>
      <div className="grid gap-4 md:grid-cols-3">{mockAstrologers.map((a) => (
        <GlassCard key={a.id}>
          <h2 className="font-display text-xl">{a.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{a.specialty}</p>
          <p className="mt-3 text-xs">{a.experience} · ★ {a.rating} ({a.reviews})</p>
          <p className="mt-2 text-sm">{a.price}</p>
          <Button asChild className="mt-4 w-full" size="sm"><Link href={routes.bookConsultation}>Book {a.nextSlot}</Link></Button>
        </GlassCard>
      ))}</div>
    </>`,
  book: `<>
      <GlassCard className="max-w-xl space-y-4">
        <p className="text-sm text-muted-foreground">Booking with {mockAstrologers[0].name}</p>
        <div><label className="text-sm font-medium">Topic</label><select className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"><option>Marriage timing</option><option>Compatibility mediation</option><option>Dasha counseling</option></select></div>
        <div><label className="text-sm font-medium">Slot</label><input className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" defaultValue={mockAstrologers[0].nextSlot} /></div>
        <Button>Confirm booking</Button>
      </GlassCard>
    </>`,
  astrologer: `<>
      <GlassCard>
        <h2 className="font-display text-3xl">{mockAstrologers[0].name}</h2>
        <p className="mt-2 text-muted-foreground">{mockAstrologers[0].bio}</p>
        <p className="mt-4 text-sm">Languages: {mockAstrologers[0].languages.join(", ")}</p>
        <Button asChild className="mt-6"><Link href={routes.bookConsultation}>Book session</Link></Button>
      </GlassCard>
    </>`,
  calendar: `<>
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard><h2 className="font-display text-xl">Upcoming</h2><p className="mt-3 text-sm">Thu · Consultation with Acharya Meera Joshi</p><p className="mt-2 text-sm text-muted-foreground">Primary marriage window reminder · Aug 2026</p></GlassCard>
        <GlassCard><h2 className="font-display text-xl">Today&apos;s horoscope</h2><p className="mt-3 text-sm">{mockHoroscopeDaily.summary}</p></GlassCard>
      </div>
    </>`,
  security: `<>
      <GlassCard className="max-w-lg space-y-4">
        <div><label className="text-sm font-medium">Current password</label><input type="password" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" defaultValue="••••••••••" /></div>
        <div><label className="text-sm font-medium">New password</label><input type="password" className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" /></div>
        <Button>Update password</Button>
      </GlassCard>
    </>`,
  "privacy-settings": `<>
      <div className="space-y-3">
        {["Show profile in search","Allow photo views for premium members","Share compatibility reports with family","AI coaching suggestions"].map((s) => (
          <GlassCard key={s} className="flex items-center justify-between"><p className="text-sm">{s}</p><Badge>Enabled</Badge></GlassCard>
        ))}
      </div>
    </>`,
};

for (const [rel, title, desc, kind] of pages) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const isMarketing = rel.startsWith("(landing)/");
  const actions = isMarketing
    ? `<Button asChild variant="secondary"><Link href={routes.home}>Home</Link></Button>`
    : `<Button asChild variant="secondary"><Link href={routes.dashboard}>Back to overview</Link></Button>`;
  const content = `${imports}
export const metadata = { title: "${title}" };

export default function Page() {
  return (
    <div className="relative">
      <PageHeader
        eyebrow="VedaMilan AI"
        title="${title}"
        description="${desc}"
        actions={${actions}}
      />
      ${bodies[kind]}
    </div>
  );
}
`;
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}
console.log("done", pages.length);
