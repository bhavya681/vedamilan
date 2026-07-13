import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

describe("Module 1 — Database schema", () => {
  it("passes prisma validate", () => {
    const output = execSync("npx prisma validate", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    expect(output).toMatch(/valid/i);
  });

  it("contains multi-file schema domains", () => {
    const schemaDir = path.join(root, "prisma/schema");
    const files = fs.readdirSync(schemaDir);
    for (const required of [
      "schema.prisma",
      "enums.prisma",
      "01-auth.prisma",
      "02-profile.prisma",
      "03-birth.prisma",
      "04-horoscope.prisma",
      "05-dasha.prisma",
      "06-match-engine.prisma",
      "07-ai.prisma",
      "08-matchmaking.prisma",
      "09-chat.prisma",
      "10-notifications.prisma",
      "11-payments.prisma",
      "12-reports.prisma",
      "13-consultation.prisma",
      "14-content.prisma",
      "15-admin.prisma",
      "16-analytics.prisma",
      "17-explicit-named.prisma",
    ]) {
      expect(files).toContain(required);
    }
  });

  it("includes Better Auth Verification + User name/image", () => {
    const auth = fs.readFileSync(path.join(root, "prisma/schema/01-auth.prisma"), "utf8");
    expect(auth).toContain("model Verification");
    expect(auth).toMatch(/\bname\s+String/);
    expect(auth).toContain("image");
    expect(auth).toContain("refreshTokenExpiresAt");
  });

  it("includes payment integrity models", () => {
    const payments = fs.readFileSync(path.join(root, "prisma/schema/11-payments.prisma"), "utf8");
    expect(payments).toContain("model PaymentWebhookEvent");
    expect(payments).toContain("model CouponRedemption");
    expect(payments).toContain("model StripeCustomer");
    expect(payments).toContain("paymentTransactionId");
  });

  it("wires explicit-named foreign keys", () => {
    const explicit = fs.readFileSync(
      path.join(root, "prisma/schema/17-explicit-named.prisma"),
      "utf8",
    );
    expect(explicit).toContain("user          User");
    expect(explicit).toContain("compatibilityReport CompatibilityReport?");
    expect(explicit).toContain("aiReport      AiReport?");
  });

  it("includes GrahaMaitriAttribute", () => {
    const horoscope = fs.readFileSync(path.join(root, "prisma/schema/04-horoscope.prisma"), "utf8");
    expect(horoscope).toContain("model GrahaMaitriAttribute");
    expect(horoscope).toContain("grahaMaitri   GrahaMaitriAttribute?");
  });

  it("ships baseline + integrity migrations", () => {
    const migrations = fs.readdirSync(path.join(root, "prisma/migrations"));
    expect(migrations).toContain("20260713100000_complete_domain_schema");
    expect(migrations).toContain("20260713120000_module1_integrity");
  });

  it("seed targets VedaMilan bootstrap identities", () => {
    const seed = fs.readFileSync(path.join(root, "prisma/seed/index.ts"), "utf8");
    expect(seed).toContain("admin@vedamilan.ai");
    expect(seed).toContain("ananya.sharma@email.com");
    expect(seed).toContain("VEDALAUNCH20");
    expect(seed).toContain("Welcome to VedaMilan AI");
  });
});
