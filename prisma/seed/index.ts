import "dotenv/config";

import { createHash } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import {
  City,
  ContentStatus,
  Country,
  CouponType,
  Language,
  NotificationChannel,
  NotificationType,
  PrismaClient,
  RecordStatus,
  Role,
  State,
  SubscriptionPlan,
} from "../../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function seedRolesAndPermissions() {
  const roles: Array<{ code: Role; name: string; description: string }> = [
    { code: Role.SUPER_ADMIN, name: "Super Admin", description: "Full platform control" },
    { code: Role.ADMIN, name: "Admin", description: "Operational administration" },
    { code: Role.MODERATOR, name: "Moderator", description: "Content and profile moderation" },
    { code: Role.SUPPORT, name: "Support", description: "Member support operations" },
    { code: Role.ASTROLOGER, name: "Astrologer", description: "Consultation provider" },
    { code: Role.CONTENT_MANAGER, name: "Content Manager", description: "CMS and blogs" },
    { code: Role.FINANCE, name: "Finance", description: "Billing and refunds" },
    { code: Role.ANALYST, name: "Analyst", description: "Read-only analytics" },
    { code: Role.MEMBER, name: "Member", description: "Standard member" },
    { code: Role.PREMIUM_MEMBER, name: "Premium Member", description: "Paid member" },
    { code: Role.GUEST, name: "Guest", description: "Unauthenticated visitor role mapping" },
  ];

  for (const role of roles) {
    await prisma.appRole.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description, status: RecordStatus.ACTIVE },
      create: role,
    });
  }

  const permissions = [
    { code: "users.read", resource: "users", action: "read", description: "View users" },
    { code: "users.write", resource: "users", action: "write", description: "Edit users" },
    { code: "matches.read", resource: "matches", action: "read", description: "View matches" },
    { code: "payments.read", resource: "payments", action: "read", description: "View payments" },
    {
      code: "payments.refund",
      resource: "payments",
      action: "refund",
      description: "Issue refunds",
    },
    { code: "content.publish", resource: "content", action: "publish", description: "Publish CMS" },
    {
      code: "analytics.read",
      resource: "analytics",
      action: "read",
      description: "View analytics",
    },
    { code: "settings.write", resource: "settings", action: "write", description: "Edit settings" },
    { code: "admin.full", resource: "admin", action: "full", description: "Super admin access" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      },
      create: permission,
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const adminRole = await prisma.appRole.findUniqueOrThrow({ where: { code: Role.ADMIN } });
  const superAdminRole = await prisma.appRole.findUniqueOrThrow({
    where: { code: Role.SUPER_ADMIN },
  });

  for (const role of [adminRole, superAdminRole]) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: { status: RecordStatus.ACTIVE },
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}

async function seedPlans() {
  const plans = [
    {
      code: SubscriptionPlan.FREE,
      name: "Free",
      description: "Essential discovery",
      priceInrPaise: 0,
      billingPeriodDays: 30,
      featuresJson: { matchesPerDay: 5, chat: false },
      sortOrder: 0,
    },
    {
      code: SubscriptionPlan.ESSENCE,
      name: "Essence",
      description: "AI matchmaking starter",
      priceInrPaise: 99900,
      billingPeriodDays: 30,
      featuresJson: { matchesPerDay: 25, chat: true, reports: 1 },
      sortOrder: 1,
    },
    {
      code: SubscriptionPlan.SANGAM,
      name: "Sangam",
      description: "Full compatibility intelligence",
      priceInrPaise: 249900,
      billingPeriodDays: 30,
      featuresJson: { matchesPerDay: 100, chat: true, reports: 10, priority: true },
      sortOrder: 2,
    },
    {
      code: SubscriptionPlan.PARAMPARA,
      name: "Parampara",
      description: "Concierge-grade membership",
      priceInrPaise: 599900,
      billingPeriodDays: 30,
      featuresJson: { matchesPerDay: -1, chat: true, reports: -1, concierge: true },
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
}

async function seedGeo() {
  const india = await prisma.geoCountry.upsert({
    where: { code: Country.IN },
    update: { name: "India", phoneCode: "+91" },
    create: { code: Country.IN, name: "India", phoneCode: "+91" },
  });

  const states: Array<{ code: State; name: string; cities: Array<{ code: City; name: string }> }> =
    [
      {
        code: State.MH,
        name: "Maharashtra",
        cities: [
          { code: City.MUMBAI, name: "Mumbai" },
          { code: City.PUNE, name: "Pune" },
        ],
      },
      {
        code: State.KA,
        name: "Karnataka",
        cities: [{ code: City.BENGALURU, name: "Bengaluru" }],
      },
      {
        code: State.DL,
        name: "Delhi",
        cities: [{ code: City.DELHI, name: "Delhi" }],
      },
      {
        code: State.TN,
        name: "Tamil Nadu",
        cities: [
          { code: City.CHENNAI, name: "Chennai" },
          { code: City.COIMBATORE, name: "Coimbatore" },
        ],
      },
      {
        code: State.TS,
        name: "Telangana",
        cities: [{ code: City.HYDERABAD, name: "Hyderabad" }],
      },
      {
        code: State.GJ,
        name: "Gujarat",
        cities: [
          { code: City.AHMEDABAD, name: "Ahmedabad" },
          { code: City.SURAT, name: "Surat" },
        ],
      },
      {
        code: State.WB,
        name: "West Bengal",
        cities: [{ code: City.KOLKATA, name: "Kolkata" }],
      },
      {
        code: State.RJ,
        name: "Rajasthan",
        cities: [{ code: City.JAIPUR, name: "Jaipur" }],
      },
      {
        code: State.UP,
        name: "Uttar Pradesh",
        cities: [
          { code: City.LUCKNOW, name: "Lucknow" },
          { code: City.NOIDA, name: "Noida" },
        ],
      },
      {
        code: State.KL,
        name: "Kerala",
        cities: [{ code: City.KOCHI, name: "Kochi" }],
      },
    ];

  for (const state of states) {
    const geoState = await prisma.geoState.upsert({
      where: { countryId_code: { countryId: india.id, code: state.code } },
      update: { name: state.name },
      create: { countryId: india.id, code: state.code, name: state.name },
    });

    for (const city of state.cities) {
      await prisma.geoCity.upsert({
        where: {
          countryId_stateId_name: {
            countryId: india.id,
            stateId: geoState.id,
            name: city.name,
          },
        },
        update: { cityEnum: city.code },
        create: {
          countryId: india.id,
          stateId: geoState.id,
          name: city.name,
          cityEnum: city.code,
          timezone: "Asia/Kolkata",
        },
      });
    }
  }
}

async function seedContentAndFlags() {
  const faqs = [
    {
      question: "Is VedaMilan AI only a matrimonial site?",
      answer:
        "No. It is a Vedic relationship intelligence platform covering matchmaking, kundli, compatibility, timing, AI coaching, reports, and expert consultation.",
      category: "product",
      sortOrder: 1,
    },
    {
      question: "Which ayanamsa do you use?",
      answer:
        "Lahiri is the default ayanamsa. Chart recomputation supports alternate systems where configured.",
      category: "astrology",
      sortOrder: 2,
    },
    {
      question: "Are AI recommendations explainable?",
      answer:
        "Yes. Every match and insight surfaces the drivers—guna factors, planetary themes, preference fit, and timing context.",
      category: "ai",
      sortOrder: 3,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: faq.question, deletedAt: null },
    });
    if (existing) {
      await prisma.faqItem.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          contentStatus: ContentStatus.PUBLISHED,
        },
      });
    } else {
      await prisma.faqItem.create({
        data: {
          ...faq,
          contentStatus: ContentStatus.PUBLISHED,
        },
      });
    }
  }

  await prisma.featureFlag.upsert({
    where: { key: "ai_matchmaking_v1" },
    update: { enabled: true },
    create: {
      key: "ai_matchmaking_v1",
      enabled: true,
      description: "Enable AI match ranking pipeline",
    },
  });

  await prisma.appSetting.upsert({
    where: { key: "default_locale" },
    update: { valueJson: { language: Language.ENGLISH, country: Country.IN } },
    create: {
      key: "default_locale",
      valueJson: { language: Language.ENGLISH, country: Country.IN },
      description: "Default locale for new members",
    },
  });

  await prisma.notificationTemplate.upsert({
    where: { code: "welcome_email" },
    update: {
      subject: "Welcome to VedaMilan AI",
      bodyTemplate: "Namaste {{name}}, your journey begins now.",
    },
    create: {
      code: "welcome_email",
      type: NotificationType.SYSTEM,
      channel: NotificationChannel.EMAIL,
      subject: "Welcome to VedaMilan AI",
      bodyTemplate: "Namaste {{name}}, your journey begins now.",
      locale: Language.ENGLISH,
    },
  });

  await prisma.notificationTemplate.upsert({
    where: { code: "otp_sms" },
    update: {
      subject: "VedaMilan OTP",
      bodyTemplate: "Your VedaMilan AI verification code is {{otp}}. Valid for 10 minutes.",
    },
    create: {
      code: "otp_sms",
      type: NotificationType.SECURITY,
      channel: NotificationChannel.SMS,
      subject: "VedaMilan OTP",
      bodyTemplate: "Your VedaMilan AI verification code is {{otp}}. Valid for 10 minutes.",
      locale: Language.ENGLISH,
    },
  });
}

async function seedCoupons() {
  const sangam = await prisma.plan.findUnique({ where: { code: SubscriptionPlan.SANGAM } });
  const coupon = await prisma.coupon.upsert({
    where: { code: "VEDALAUNCH20" },
    update: {
      couponType: CouponType.PERCENTAGE,
      value: 20,
      maxRedemptions: 1000,
      planId: sangam?.id,
    },
    create: {
      code: "VEDALAUNCH20",
      couponType: CouponType.PERCENTAGE,
      value: 20,
      maxRedemptions: 1000,
      planId: sangam?.id,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "LAUNCH20" },
    update: { campaignName: "Launch campaign", couponId: coupon.id },
    create: {
      code: "LAUNCH20",
      couponId: coupon.id,
      campaignName: "Launch campaign",
      usageLimitPerUser: 1,
    },
  });
}

async function seedBootstrapUsers() {
  const passwordHash = sha256("ChangeMe-VedaMilan-Admin-2026!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@vedamilan.ai" },
    update: {
      name: "VedaMilan Admin",
      displayName: "VedaMilan Admin",
      emailVerified: true,
      passwordHash,
    },
    create: {
      email: "admin@vedamilan.ai",
      name: "VedaMilan Admin",
      displayName: "VedaMilan Admin",
      emailVerified: true,
      passwordHash,
      timezone: "Asia/Kolkata",
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "ananya.sharma@email.com" },
    update: {
      name: "Ananya Sharma",
      displayName: "Ananya Sharma",
      emailVerified: true,
      passwordHash,
    },
    create: {
      email: "ananya.sharma@email.com",
      name: "Ananya Sharma",
      displayName: "Ananya Sharma",
      emailVerified: true,
      passwordHash,
      phone: "+919876543210",
      phoneVerified: true,
      timezone: "Asia/Kolkata",
    },
  });

  const superAdminRole = await prisma.appRole.findUniqueOrThrow({
    where: { code: Role.SUPER_ADMIN },
  });
  const memberRole = await prisma.appRole.findUniqueOrThrow({ where: { code: Role.MEMBER } });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: { status: RecordStatus.ACTIVE },
    create: { userId: admin.id, roleId: superAdminRole.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: member.id, roleId: memberRole.id } },
    update: { status: RecordStatus.ACTIVE },
    create: { userId: member.id, roleId: memberRole.id },
  });

  await prisma.wallet.upsert({
    where: { userId: member.id },
    update: {},
    create: { userId: member.id, balanceMinor: 0 },
  });
}

async function main() {
  await seedRolesAndPermissions();
  await seedPlans();
  await seedGeo();
  await seedContentAndFlags();
  await seedCoupons();
  await seedBootstrapUsers();
  console.log("VedaMilan AI database seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
