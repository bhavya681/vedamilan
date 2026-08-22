export const routes = {
  home: "/",
  about: "/about",
  pricing: "/pricing",
  blog: "/blog",
  faq: "/faq",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  cookies: "/cookies",
  help: "/help",
  support: "/support",

  login: "/login",
  register: "/register",
  otp: "/otp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",

  dashboard: "/dashboard",
  astrology: "/dashboard/astrology",
  numerology: "/dashboard/astrology/numerology",
  astrologyYogas: "/dashboard/astrology/yogas",
  astrologyNakshatra: "/dashboard/astrology/nakshatra",
  astrologyDasha: "/dashboard/astrology/dasha",
  astrologyDivisionalCharts: "/dashboard/astrology/divisional-charts",
  astrologyNorthHorizon: "/dashboard/astrology/north-horizon",
  astrologyMuhurta: "/dashboard/astrology/muhurta",
  astrologyRemedies: "/dashboard/astrology/remedies",
  astrologySpiritualJourney: "/dashboard/astrology/spiritual-journey",
  astrologyPanchanga: "/dashboard/astrology/panchanga",
  astrologyPlanetStrength: "/dashboard/astrology/planet-strength",
  astrologyChartComparison: "/dashboard/astrology/chart-comparison",
  matrimony: "/dashboard/matrimony",
  onboarding: "/dashboard/onboarding",
  profile: "/dashboard/profile",
  editProfile: "/dashboard/profile/edit",
  preferences: "/dashboard/preferences",
  situationalAlignment: "/dashboard/preferences/situational",
  birthDetails: "/dashboard/birth-details",

  kundli: "/dashboard/kundli",
  chartNorth: "/dashboard/kundli/north",
  chartSouth: "/dashboard/kundli/south",
  chartEast: "/dashboard/kundli/east",
  planets: "/dashboard/kundli/planets",
  grahaKatha: "/dashboard/kundli/graha-katha",
  nakshatra: "/dashboard/kundli/nakshatra",
  dasha: "/dashboard/kundli/dasha",
  transit: "/dashboard/kundli/transit",
  gochar: "/dashboard/kundli/gochar",
  astrologyGochar: "/dashboard/astrology/gochar",
  /** Yogas & doshas detail view (implemented on the transit extras page). */
  yogas: "/dashboard/kundli/transit",
  rajaYogas: "/dashboard/kundli/raja-yogas",
  natalProfile: "/dashboard/kundli/natal-profile",
  divisionalCharts: "/dashboard/kundli/charts",
  astrologyAshtakavarga: "/dashboard/astrology/ashtakavarga",
  astrologyShadbala: "/dashboard/astrology/shadbala",
  astrologyJaimini: "/dashboard/astrology/jaimini",
  astrologyBnn: "/dashboard/astrology/bnn",
  astrologyMarriageIntelligence: "/dashboard/astrology/marriage-intelligence",
  remedies: "/dashboard/remedies",
  lalKitab: "/dashboard/remedies",
  predictions: "/dashboard/predictions",
  marriageTiming: "/dashboard/kundli/marriage-timing",
  horoscope: "/dashboard/horoscope",

  compatibility: "/dashboard/compatibility",
  compatibilityReport: "/dashboard/compatibility/report",
  aiInsights: "/dashboard/ai-insights",
  vedicWisdom: "/dashboard/vedic-wisdom",
  wisdomJournal: "/dashboard/vedic-wisdom/journal",
  askTheSages: "/dashboard/vedic-wisdom/ask-the-sages",
  wisdomVoice: "/dashboard/vedic-wisdom", // append `/${guideId}/voice`
  recommendations: "/dashboard/recommendations",

  search: "/dashboard/search",
  filters: "/dashboard/search/filters",
  matches: "/dashboard/matches",
  matchCompare: "/dashboard/matches/compare",
  matchProfile: "/dashboard/matches/profile",
  visitors: "/dashboard/visitors",
  likes: "/dashboard/likes",
  shortlisted: "/dashboard/shortlisted",
  connections: "/dashboard/connections",
  yourConnection: "/dashboard/your-connection",

  messages: "/dashboard/messages",
  chat: "/dashboard/chat",
  chatVideo: "/dashboard/chat/video",
  notifications: "/dashboard/notifications",

  premium: "/dashboard/premium",
  payments: "/dashboard/billing",
  checkout: "/dashboard/billing/checkout",
  paymentSuccess: "/dashboard/billing/success",
  paymentFailure: "/dashboard/billing/failure",
  invoice: "/dashboard/billing/invoice",
  invoices: "/dashboard/billing/invoices",
  downloads: "/dashboard/downloads",
  reports: "/dashboard/reports",

  consultation: "/dashboard/consultation",
  bookConsultation: "/dashboard/consultation/book",
  astrologer: "/dashboard/consultation/astrologer",
  calendar: "/dashboard/calendar",
  marriageGuru: "/dashboard/matrimony/marriage-guru",

  settings: "/dashboard/settings",
  security: "/dashboard/settings/security",
  privacySettings: "/dashboard/settings/privacy",
  appearance: "/dashboard/settings/appearance",
  languageRegion: "/dashboard/settings/language",
  blocked: "/dashboard/settings/blocked",

  admin: "/admin",
  adminUsers: "/admin/users",
  adminReports: "/admin/reports",
  adminPayments: "/admin/payments",
  adminAi: "/admin/ai",
  adminAnalytics: "/admin/analytics",
  adminCms: "/admin/cms",

  maintenance: "/maintenance",
  health: "/api/health",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

/** Unified Panchanga + Muhurta studio. */
export function panchangaHref(opts?: {
  tab?: "almanac" | "muhurta" | "guide";
  date?: string;
  activity?: string;
}) {
  const q = new URLSearchParams();
  if (opts?.tab && opts.tab !== "almanac") q.set("tab", opts.tab);
  if (opts?.date) q.set("date", opts.date);
  if (opts?.activity) q.set("activity", opts.activity);
  const qs = q.toString();
  return qs ? `${routes.astrologyPanchanga}?${qs}` : routes.astrologyPanchanga;
}

/** Deep-link into North Horizon at a calculated instant. */
export function northHorizonHref(opts?: {
  at?: string | Date | number;
  mode?: "live" | "birth";
  intent?: "muhurta" | "marriage";
}) {
  const q = new URLSearchParams();
  if (opts?.mode) q.set("mode", opts.mode);
  if (opts?.at != null) {
    const d = typeof opts.at === "number" ? new Date(opts.at) : new Date(opts.at);
    if (!Number.isNaN(d.getTime())) q.set("at", d.toISOString());
  }
  if (opts?.intent) q.set("intent", opts.intent);
  const qs = q.toString();
  return qs ? `${routes.astrologyNorthHorizon}?${qs}` : routes.astrologyNorthHorizon;
}

/** Graha Katha detail path */
export function grahaKathaPlanet(grahaId: string) {
  return `${routes.grahaKatha}/${grahaId}`;
}

/** Consultation virtual-astrologer deep links */
export const consultationPaths = {
  astrologer: (id: string) => `${routes.consultation}/${id}`,
  chat: (id: string) => `${routes.consultation}/${id}/chat`,
  voice: (id: string) => `${routes.consultation}/${id}/voice`,
} as const;
