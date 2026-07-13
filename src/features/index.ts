export const authenticationFeature = {
  name: "authentication",
  description: "Identity, sessions, and access control powered by Better Auth",
} as const;

export const dashboardFeature = {
  name: "dashboard",
  description: "Member hub for matches, charts, and relationship activity",
} as const;

export const matchmakingFeature = {
  name: "matchmaking",
  description: "AI-assisted compatibility ranking and recommendations",
} as const;

export const horoscopeFeature = {
  name: "horoscope",
  description: "Vedic natal charts, dashas, and daily guidance",
} as const;

export const chatFeature = {
  name: "chat",
  description: "Realtime secure messaging between matched members",
} as const;

export const paymentsFeature = {
  name: "payments",
  description: "Stripe and Razorpay billing, subscriptions, and invoices",
} as const;

export const notificationsFeature = {
  name: "notifications",
  description: "Transactional email, push, and in-app alerts",
} as const;

export const reportsFeature = {
  name: "reports",
  description: "Compatibility reports and downloadable chart summaries",
} as const;

export const adminFeature = {
  name: "admin",
  description: "Operations console for moderation, metrics, and configuration",
} as const;
