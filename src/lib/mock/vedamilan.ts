/** Production-quality mock datasets for VedaMilan AI frontend demos. */

export const mockUser = {
  id: "usr_ananya_01",
  name: "Ananya Sharma",
  email: "ananya.sharma@email.com",
  phone: "+91 98765 43210",
  age: 28,
  gender: "Female",
  city: "Bengaluru",
  state: "Karnataka",
  religion: "Hindu",
  caste: "Brahmin",
  motherTongue: "Hindi",
  profession: "Product Designer",
  company: "Flipkart",
  education: "B.Des, NID Ahmedabad",
  height: "5'5\"",
  maritalStatus: "Never Married",
  about:
    "Design-led, family-oriented, and curious about Vedic philosophy. Looking for a thoughtful partner who values growth, kindness, and shared rituals.",
  photos: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  ],
  membership: "Sangam Premium",
  profileStrength: 86,
  verified: true,
};

export const mockBirthDetails = {
  date: "1997-08-14",
  time: "06:42",
  place: "Jaipur, Rajasthan, India",
  latitude: 26.9124,
  longitude: 75.7873,
  timezone: "Asia/Kolkata",
  ayanamsa: "Lahiri",
  lagna: "Leo",
  rashi: "Gemini",
  nakshatra: "Ardra",
  pada: 2,
};

export const mockPreferences = {
  ageRange: [26, 34],
  heightRange: ["5'4\"", "6'2\""],
  cities: ["Bengaluru", "Mumbai", "Hyderabad", "Delhi NCR"],
  religions: ["Hindu"],
  education: ["Graduate", "Post Graduate", "Professional"],
  professions: ["Technology", "Design", "Business", "Medicine"],
  manglik: "No preference",
  diet: ["Vegetarian", "Eggetarian"],
  smoking: "Never",
  drinking: "Occasionally",
};

export const mockMatches = [
  {
    id: "m_rohan",
    name: "Rohan Mehta",
    age: 31,
    city: "Bengaluru",
    profession: "Staff Engineer",
    company: "Google",
    education: "B.Tech, IIT Bombay",
    score: 92,
    aiScore: 89,
    guna: 30.5,
    manglik: "No",
    headline:
      "Moon–Venus harmony with aligned family values and overlapping career windows in 2026.",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    lastActive: "2h ago",
  },
  {
    id: "m_kabir",
    name: "Kabir Iyer",
    age: 30,
    city: "Hyderabad",
    profession: "Product Manager",
    company: "Microsoft",
    education: "MBA, ISB",
    score: 88,
    aiScore: 91,
    guna: 28,
    manglik: "No",
    headline:
      "Strong communication compatibility with complementary dasha periods for introductions.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    lastActive: "5h ago",
  },
  {
    id: "m_arjun",
    name: "Arjun Desai",
    age: 32,
    city: "Mumbai",
    profession: "Founder",
    company: "Lumen Health",
    education: "B.Com, SRCC",
    score: 85,
    aiScore: 84,
    guna: 27.5,
    manglik: "Partial",
    headline: "High values alignment; recommend detailed Nadi review before family introduction.",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    lastActive: "Yesterday",
  },
  {
    id: "m_dev",
    name: "Dev Kapoor",
    age: 29,
    city: "Delhi NCR",
    profession: "UX Lead",
    company: "Swiggy",
    education: "M.Des, IDC IIT Bombay",
    score: 87,
    aiScore: 90,
    guna: 29,
    manglik: "No",
    headline:
      "Creative lifestyles resonate; Jupiter transit favors sincere conversations this quarter.",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    lastActive: "1d ago",
  },
  {
    id: "m_vihaan",
    name: "Vihaan Reddy",
    age: 33,
    city: "Bengaluru",
    profession: "Cardiologist",
    company: "Apollo Hospitals",
    education: "MD, AIIMS",
    score: 83,
    aiScore: 82,
    guna: 26.5,
    manglik: "No",
    headline: "Stable Saturn support for long-term bonding; schedules may need intentional pacing.",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    lastActive: "3d ago",
  },
  {
    id: "m_isha",
    name: "Isha Nair",
    age: 27,
    city: "Chennai",
    profession: "Research Scientist",
    company: "Biocon",
    education: "PhD, IISc",
    score: 90,
    aiScore: 88,
    guna: 31,
    manglik: "No",
    headline: "Exceptional intellectual and spiritual alignment with calming Venus aspects.",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    lastActive: "4h ago",
  },
];

export const mockPlanets = [
  {
    name: "Sun",
    sign: "Cancer",
    house: 12,
    degree: "21°14'",
    dignity: "Friendly",
    nature: "Soul / Ego",
  },
  {
    name: "Moon",
    sign: "Gemini",
    house: 11,
    degree: "08°42'",
    dignity: "Neutral",
    nature: "Mind / Emotions",
  },
  {
    name: "Mars",
    sign: "Virgo",
    house: 2,
    degree: "14°05'",
    dignity: "Enemy",
    nature: "Energy / Drive",
  },
  {
    name: "Mercury",
    sign: "Leo",
    house: 1,
    degree: "02°33'",
    dignity: "Friendly",
    nature: "Intellect",
  },
  {
    name: "Jupiter",
    sign: "Aquarius",
    house: 7,
    degree: "19°51'",
    dignity: "Neutral",
    nature: "Wisdom / Expansion",
  },
  {
    name: "Venus",
    sign: "Gemini",
    house: 11,
    degree: "27°18'",
    dignity: "Own",
    nature: "Love / Harmony",
  },
  {
    name: "Saturn",
    sign: "Pisces",
    house: 8,
    degree: "11°07'",
    dignity: "Friendly",
    nature: "Karma / Structure",
  },
  {
    name: "Rahu",
    sign: "Scorpio",
    house: 4,
    degree: "05°22'",
    dignity: "—",
    nature: "Desire / Obsession",
  },
  {
    name: "Ketu",
    sign: "Taurus",
    house: 10,
    degree: "05°22'",
    dignity: "—",
    nature: "Detachment / Insight",
  },
];

export const mockYogas = [
  {
    name: "Budhaditya Yoga",
    strength: "Moderate",
    note: "Sharpens intellect and articulate self-expression.",
  },
  {
    name: "Gaja Kesari",
    strength: "Strong",
    note: "Supports reputation, wisdom, and thoughtful leadership.",
  },
  {
    name: "Dhana Yoga",
    strength: "Present",
    note: "Indicates resourcefulness when paired with disciplined effort.",
  },
];

export const mockDoshas = [
  {
    name: "Manglik",
    status: "Absent",
    severity: "None",
    note: "Mars placement does not indicate classical Manglik dosha.",
  },
  {
    name: "Kaal Sarp",
    status: "Absent",
    severity: "None",
    note: "Nodes do not enclose all planets.",
  },
  {
    name: "Pitra",
    status: "Mild indicators",
    severity: "Low",
    note: "Remedial rituals optional; consult for family context.",
  },
];

export const mockDasha = [
  {
    planet: "Venus",
    start: "2019-03-12",
    end: "2039-03-12",
    active: true,
    theme: "Relationships, aesthetics, partnership growth",
  },
  {
    planet: "Sun",
    start: "2039-03-12",
    end: "2045-03-12",
    active: false,
    theme: "Visibility, authority, purposeful leadership",
  },
  {
    planet: "Moon",
    start: "2045-03-12",
    end: "2055-03-12",
    active: false,
    theme: "Emotional depth, home, intuitive decisions",
  },
  {
    planet: "Mars",
    start: "2055-03-12",
    end: "2062-03-12",
    active: false,
    theme: "Drive, courage, decisive action",
  },
];

export const mockAntardasha = [
  {
    planet: "Venus–Venus",
    period: "Mar 2019 – Jul 2022",
    note: "Foundation of values and attraction patterns.",
  },
  {
    planet: "Venus–Sun",
    period: "Jul 2022 – Jul 2023",
    note: "Recognition and clarity in life direction.",
  },
  {
    planet: "Venus–Moon",
    period: "Jul 2023 – Mar 2025",
    note: "Emotional bonding and family themes heighten.",
  },
  {
    planet: "Venus–Mars",
    period: "Mar 2025 – May 2026",
    note: "Active pursuit windows for introductions.",
  },
  {
    planet: "Venus–Rahu",
    period: "May 2026 – May 2029",
    note: "Unconventional opportunities; discern carefully.",
  },
];

export const mockTransits = [
  {
    planet: "Jupiter",
    from: "Taurus",
    to: "Gemini",
    date: "2025-05-14",
    impact: "Expands communication and learning themes.",
  },
  {
    planet: "Saturn",
    from: "Aquarius",
    to: "Pisces",
    date: "2025-03-29",
    impact: "Deepens emotional responsibility and long-term bonds.",
  },
  {
    planet: "Rahu",
    from: "Pisces",
    to: "Aquarius",
    date: "2025-05-18",
    impact: "Shifts collective focus toward networks and ideals.",
  },
];

export const mockMarriageTiming = [
  {
    window: "Aug 2026 – Jan 2027",
    score: 94,
    label: "Primary window",
    reason: "Venus–Mars antardasha + Jupiter aspect on 7th.",
  },
  {
    window: "Oct 2027 – Mar 2028",
    score: 88,
    label: "Strong alternate",
    reason: "Supportive transit of Jupiter over lagna lord.",
  },
  {
    window: "May 2029 – Sep 2029",
    score: 79,
    label: "Secondary",
    reason: "Favorable for ceremonies if earlier windows pass.",
  },
];

export const mockCompatibilityRadar = [
  { axis: "Emotional", score: 88 },
  { axis: "Communication", score: 91 },
  { axis: "Finance", score: 76 },
  { axis: "Children", score: 82 },
  { axis: "Career", score: 85 },
  { axis: "Spiritual", score: 79 },
];

export const mockGunaMilan = [
  { koota: "Varna", score: 1, max: 1, note: "Spiritual compatibility aligned." },
  { koota: "Vashya", score: 2, max: 2, note: "Mutual attraction and influence balanced." },
  { koota: "Tara", score: 2.5, max: 3, note: "Birth star harmony largely supportive." },
  { koota: "Yoni", score: 3, max: 4, note: "Physical and instinctive comfort present." },
  { koota: "Graha Maitri", score: 4.5, max: 5, note: "Mental friendship between lords is strong." },
  { koota: "Gana", score: 5, max: 6, note: "Temperament pairing is largely compatible." },
  { koota: "Bhakoot", score: 6, max: 7, note: "Relative Moon signs favor bonding." },
  { koota: "Nadi", score: 8, max: 8, note: "No Nadi dosha indicated." },
];

export const mockAiInsights = [
  {
    id: "ai_1",
    title: "Why Rohan ranks #1 this week",
    body: "Shared Leo lagna dynamics with complementary Moon signs create emotional fluency. Career timelines overlap in late 2026—ideal for sincere introductions.",
    confidence: 91,
    tags: ["Matchmaking", "Timing"],
  },
  {
    id: "ai_2",
    title: "Conversation opener for Kabir",
    body: "Ask about the ISB product case that shaped his leadership style—Mercury–Jupiter patterns suggest he enjoys thoughtful intellectual exchange.",
    confidence: 86,
    tags: ["Coach", "Messaging"],
  },
  {
    id: "ai_3",
    title: "Marriage timing clarity",
    body: "Your Venus mahadasha with Mars antardasha (Mar 2025–May 2026) is an activation corridor. Prioritize verified profiles with guna ≥ 28.",
    confidence: 93,
    tags: ["Timing", "Strategy"],
  },
];

export const mockConversations = [
  {
    id: "c1",
    name: "Rohan Mehta",
    preview: "Would love to hear what traditions feel meaningful in your home.",
    time: "10:24",
    unread: 2,
    online: true,
    messages: [
      {
        id: "1",
        from: "them",
        text: "Namaste Ananya—your profile felt unusually thoughtful.",
        time: "09:12",
      },
      {
        id: "2",
        from: "me",
        text: "Thank you, Rohan. I appreciated your note on family rituals.",
        time: "09:40",
      },
      {
        id: "3",
        from: "them",
        text: "Would love to hear what traditions feel meaningful in your home.",
        time: "10:24",
      },
    ],
  },
  {
    id: "c2",
    name: "Kabir Iyer",
    preview: "The compatibility report was surprisingly nuanced.",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      {
        id: "1",
        from: "them",
        text: "The compatibility report was surprisingly nuanced.",
        time: "Yesterday",
      },
      {
        id: "2",
        from: "me",
        text: "Agreed—happy to walk through the dasha section together.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "c3",
    name: "Dev Kapoor",
    preview: "Coffee next weekend in Indiranagar?",
    time: "Mon",
    unread: 0,
    online: false,
    messages: [{ id: "1", from: "them", text: "Coffee next weekend in Indiranagar?", time: "Mon" }],
  },
];

export const mockAiReplies = [
  "I appreciated your note about family values—mine are similarly rooted in respect and openness.",
  "Would you be open to sharing what traditions feel most meaningful in your home?",
  "Your career path is inspiring. How do you balance ambition with personal time?",
];

export const mockNotifications = [
  {
    id: "n1",
    type: "match",
    title: "New AI match",
    body: "Isha Nair scored 90% overall compatibility.",
    time: "12m ago",
    read: false,
  },
  {
    id: "n2",
    type: "message",
    title: "Rohan replied",
    body: "Would love to hear what traditions feel meaningful…",
    time: "1h ago",
    read: false,
  },
  {
    id: "n3",
    type: "report",
    title: "Kundli PDF ready",
    body: "North Indian chart report is ready to download.",
    time: "3h ago",
    read: true,
  },
  {
    id: "n4",
    type: "consult",
    title: "Consultation confirmed",
    body: "Acharya Meera Joshi · Thu 6:30 PM IST",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n5",
    type: "system",
    title: "Profile strength +4%",
    body: "Adding family details improved discovery ranking.",
    time: "2d ago",
    read: true,
  },
];

export const mockAstrologers = [
  {
    id: "ast_1",
    name: "Acharya Meera Joshi",
    specialty: "Marriage timing & compatibility",
    experience: "18 years",
    rating: 4.9,
    reviews: 1264,
    languages: ["Hindi", "English", "Marathi"],
    price: "₹1,499 / 30 min",
    nextSlot: "Thu · 6:30 PM",
    bio: "Specializes in guna milan mediation for modern professionals and NRI families.",
  },
  {
    id: "ast_2",
    name: "Pandit Arvind Rao",
    specialty: "Dasha & transit counseling",
    experience: "22 years",
    rating: 4.8,
    reviews: 980,
    languages: ["English", "Telugu", "Hindi"],
    price: "₹1,799 / 30 min",
    nextSlot: "Fri · 11:00 AM",
    bio: "Known for calm, evidence-led dasha narratives without fear-based framing.",
  },
  {
    id: "ast_3",
    name: "Dr. Kavya Menon",
    specialty: "Relationship psychology + Vedic",
    experience: "12 years",
    rating: 4.95,
    reviews: 742,
    languages: ["English", "Malayalam"],
    price: "₹2,199 / 45 min",
    nextSlot: "Sat · 4:00 PM",
    bio: "Blends clinical counseling frameworks with classical Jyotish for couples.",
  },
];

export const mockReports = [
  {
    id: "r1",
    title: "Full Kundli Dossier",
    type: "PDF",
    size: "2.4 MB",
    date: "12 Jul 2026",
    status: "Ready",
  },
  {
    id: "r2",
    title: "Compatibility · Ananya × Rohan",
    type: "PDF",
    size: "1.8 MB",
    date: "11 Jul 2026",
    status: "Ready",
  },
  {
    id: "r3",
    title: "Marriage Timing Brief",
    type: "PDF",
    size: "940 KB",
    date: "09 Jul 2026",
    status: "Ready",
  },
  {
    id: "r4",
    title: "Annual Horoscope 2026",
    type: "PDF",
    size: "3.1 MB",
    date: "01 Jul 2026",
    status: "Generating",
  },
];

export const mockInvoices = [
  {
    id: "INV-20481",
    plan: "Sangam Premium",
    amount: "₹2,499",
    date: "01 Jul 2026",
    status: "Paid",
  },
  {
    id: "INV-20312",
    plan: "Consultation · Meera Joshi",
    amount: "₹1,499",
    date: "28 Jun 2026",
    status: "Paid",
  },
  {
    id: "INV-20190",
    plan: "Compatibility Report Pack",
    amount: "₹799",
    date: "14 Jun 2026",
    status: "Paid",
  },
];

export const mockDashboardStats = [
  { label: "Profile strength", value: "86%", hint: "Add family details", tone: "gold" as const },
  { label: "New matches", value: "12", hint: "This week", tone: "ai" as const },
  { label: "Messages", value: "4", hint: "Awaiting reply", tone: "default" as const },
  { label: "Compatibility avg", value: "87", hint: "Across top 10", tone: "rose" as const },
];

export const mockAdminMetrics = [
  { label: "Active members", value: "48,920", delta: "+6.2%" },
  { label: "Paid conversions", value: "12.4%", delta: "+1.1%" },
  { label: "AI requests / day", value: "182k", delta: "+9%" },
  { label: "NPS", value: "72", delta: "+3" },
];

export const mockBlogPosts = [
  {
    slug: "marriage-timing-venus-dasha",
    title: "How Venus dasha shapes marriage timing",
    excerpt: "A calm, practical guide to reading activation windows without fear-based astrology.",
    author: "Dr. Kavya Menon",
    date: "08 Jul 2026",
    tag: "Timing",
  },
  {
    slug: "ai-guna-milan-explained",
    title: "AI + Guna Milan: explainable compatibility",
    excerpt: "Why transparent scoring builds family trust—and how VedaMilan structures it.",
    author: "VedaMilan Research",
    date: "02 Jul 2026",
    tag: "AI",
  },
  {
    slug: "modern-kundli-etiquette",
    title: "Modern kundli etiquette for first conversations",
    excerpt: "How to discuss charts with warmth, privacy, and mutual respect.",
    author: "Acharya Meera Joshi",
    date: "24 Jun 2026",
    tag: "Culture",
  },
];

export const mockFaqs = [
  {
    q: "Is VedaMilan AI only a matrimonial site?",
    a: "No. It is a Vedic relationship intelligence platform—matchmaking is one layer alongside kundli, compatibility, timing, AI coaching, reports, and expert consultation.",
  },
  {
    q: "Which ayanamsa do you use?",
    a: "Lahiri by default, with transparent settings for advanced users who prefer alternate systems.",
  },
  {
    q: "Are AI recommendations explainable?",
    a: "Yes. Every match and insight surfaces the drivers—guna factors, planetary themes, preference fit, and timing context.",
  },
  {
    q: "Is my birth data private?",
    a: "Birth details are encrypted at rest in production architectures and never shown publicly without your consent. This demo uses mock data only.",
  },
  {
    q: "Can families join the journey?",
    a: "Premium plans support advisor sharing for compatibility reports and guided introductions.",
  },
];

export const mockPricingPlans = [
  {
    name: "Essence",
    price: "₹999",
    period: "/month",
    description: "Begin intentional discovery with core AI matches and kundli overview.",
    features: ["AI match feed", "Basic kundli", "Secure messaging", "Daily horoscope"],
    highlighted: false,
  },
  {
    name: "Sangam",
    price: "₹2,499",
    period: "/month",
    description: "Full relationship intelligence for serious seekers and families.",
    features: [
      "Advanced guna milan",
      "Marriage timing windows",
      "AI relationship coach",
      "Priority ranking",
      "Report downloads",
    ],
    highlighted: true,
  },
  {
    name: "Parampara",
    price: "₹5,999",
    period: "/month",
    description: "Concierge-grade guidance for NRI families and multi-chart decisions.",
    features: [
      "Dedicated specialist",
      "Unlimited compatibility reports",
      "Consultation credits",
      "Verified profile priority",
      "Family advisor seats",
    ],
    highlighted: false,
  },
];

export const mockHoroscopeDaily = {
  date: "13 Jul 2026",
  rashi: "Gemini",
  summary:
    "A gentle Mercury hour favors sincere messages. Avoid rushing introductions before evening—Venus supports warmth after sunset.",
  love: 84,
  career: 78,
  health: 81,
  spirituality: 88,
};

export const mockVisitors = [
  { name: "Rohan Mehta", city: "Bengaluru", when: "35m ago", score: 92 },
  { name: "Kabir Iyer", city: "Hyderabad", when: "2h ago", score: 88 },
  { name: "Vihaan Reddy", city: "Bengaluru", when: "Yesterday", score: 83 },
];

export const mockLikes = [
  { name: "Isha Nair", city: "Chennai", mutual: true, score: 90 },
  { name: "Dev Kapoor", city: "Delhi NCR", mutual: false, score: 87 },
];

export const mockShortlisted = [
  { name: "Rohan Mehta", note: "Family intro pending chart share", score: 92 },
  { name: "Kabir Iyer", note: "Strong AI coach suggestions", score: 88 },
];
