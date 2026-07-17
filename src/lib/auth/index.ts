import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import type { Db, MongoClient } from "mongodb";

import { connectMongo, getMongoClient, getMongoDb } from "@/infrastructure/database/mongodb";
import { logger } from "@/lib/utils/logger";

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

function createAuth(db: Db, client: MongoClient) {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

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
        logger.info({ email: user.email, url }, "Password reset link queued");
        if (process.env.NODE_ENV !== "production") {
          console.info(`[dev] Password reset for ${user.email}: ${url}`);
        }
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        logger.info({ email: user.email, url }, "Email verification link queued");
        if (process.env.NODE_ENV !== "production") {
          console.info(`[dev] Verify email for ${user.email}: ${url}`);
        }
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
        maxAge: 60 * 5,
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
        // Built-in roles only unless custom access control (`ac` + `roles`) is defined
        adminRoles: ["admin"],
      }),
      // Kept for email-verification / forgot-password OTP — passwordless login is disabled in UI
      emailOTP({
        disableSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          if (type === "sign-in") {
            logger.info({ email }, "OTP sign-in disabled — ignoring request");
            return;
          }
          logger.info({ email, type }, "Email OTP generated");
          if (process.env.NODE_ENV !== "production") {
            console.info(`[dev] Email OTP (${type}) for ${email}: ${otp}`);
          }
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
