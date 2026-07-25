import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, emailOTP } from "better-auth/plugins";
import { adminAc, defaultAc, userAc } from "better-auth/plugins/admin/access";
import { nextCookies } from "better-auth/next-js";
import type { Db, MongoClient } from "mongodb";

import { connectMongo, getMongoClient, getMongoDb } from "@/infrastructure/database/mongodb";
import { sendEmail } from "@/lib/emails/send";
import {
  emailOtpTemplate,
  emailVerificationEmail,
  passwordResetEmail,
} from "@/lib/emails/templates";
import { logger } from "@/lib/utils/logger";

/** Super-admin access — includes impersonate-admins beyond the default admin role. */
const superAdminAc = defaultAc.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

function assertAuthSecretConfigured() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new Error(
        "BETTER_AUTH_SECRET must be set to a strong secret (min 32 characters) in production",
      );
    }
  } else if (!secret) {
    logger.warn("BETTER_AUTH_SECRET is empty — set a secret before deploying");
  }
}

function createAuth(db: Db, client: MongoClient) {
  assertAuthSecretConfigured();
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const isProd = process.env.NODE_ENV === "production";

  return betterAuth({
    appName: process.env.NEXT_PUBLIC_APP_NAME || "VedaMilan AI",
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        // Never log reset URLs or tokens — they are bearer credentials.
        logger.info({ email: user.email }, "Password reset email requested");
        const template = passwordResetEmail(user.name || "there", url);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        logger.info({ email: user.email }, "Email verification requested");
        const template = emailVerificationEmail(user.name || "there", url);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      },
    },
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : undefined,
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        // Shorter cache reduces stale session/role windows after logout/privilege change.
        maxAge: 60,
      },
    },
    advanced: {
      useSecureCookies: isProd,
      defaultCookieAttributes: {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
      },
    },
    user: {
      additionalFields: {
        phone: {
          type: "string",
          required: false,
          input: true,
        },
        displayName: {
          type: "string",
          required: false,
          input: true,
        },
      },
    },
    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin", "super_admin"],
        roles: {
          user: userAc,
          admin: adminAc,
          super_admin: superAdminAc,
        },
      }),
      // Kept for email-verification / forgot-password OTP — passwordless login is disabled in UI
      emailOTP({
        disableSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          if (type === "sign-in") {
            logger.info({ email }, "OTP sign-in disabled — ignoring request");
            return;
          }
          // Never log OTP values.
          logger.info({ email, type }, "Email OTP requested");
          const purpose =
            type === "forget-password"
              ? "password reset"
              : type === "email-verification"
                ? "email verification"
                : "account verification";
          const template = emailOtpTemplate(email, otp, purpose);
          await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          });
        },
        otpLength: 6,
        expiresIn: 600,
      }),
      nextCookies(),
    ],
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"].filter(Boolean),
  });
}

export async function getAuth() {
  if (authInstance) return authInstance;
  await connectMongo();
  const client = getMongoClient() as unknown as MongoClient;
  const db = getMongoDb() as unknown as Db;
  authInstance = createAuth(db, client);
  return authInstance;
}

export type Auth = AuthInstance;
