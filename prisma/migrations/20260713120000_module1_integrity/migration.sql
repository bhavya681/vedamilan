-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- Backfill Better Auth name from display_name when present
UPDATE "users" SET "name" = COALESCE(NULLIF("display_name", ''), split_part("email", '@', 1))
WHERE "name" = '';

CREATE INDEX IF NOT EXISTS "users_name_idx" ON "users"("name");

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" TIMESTAMPTZ(6);

-- CreateTable: Better Auth verification
CREATE TABLE IF NOT EXISTS "verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "verifications_identifier_idx" ON "verifications"("identifier");
CREATE INDEX IF NOT EXISTS "verifications_expires_at_idx" ON "verifications"("expires_at");

-- CreateTable: Graha Maitri person-level attribute
CREATE TABLE IF NOT EXISTS "graha_maitri_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "moon_lord" "PlanetName" NOT NULL,
    "friendship_class" VARCHAR(40) NOT NULL,
    "notes" TEXT,
    CONSTRAINT "graha_maitri_attributes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "graha_maitri_attributes_chart_id_key" ON "graha_maitri_attributes"("chart_id");
CREATE INDEX IF NOT EXISTS "graha_maitri_attributes_status_deleted_at_idx" ON "graha_maitri_attributes"("status", "deleted_at");

DO $$ BEGIN
  ALTER TABLE "graha_maitri_attributes"
    ADD CONSTRAINT "graha_maitri_attributes_chart_id_fkey"
    FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payment integrity columns
ALTER TABLE "razorpay_orders" ADD COLUMN IF NOT EXISTS "payment_transaction_id" UUID;
ALTER TABLE "stripe_payments" ADD COLUMN IF NOT EXISTS "payment_transaction_id" UUID;

CREATE INDEX IF NOT EXISTS "razorpay_orders_payment_transaction_id_idx" ON "razorpay_orders"("payment_transaction_id");
CREATE INDEX IF NOT EXISTS "stripe_payments_payment_transaction_id_idx" ON "stripe_payments"("payment_transaction_id");

DO $$ BEGIN
  ALTER TABLE "razorpay_orders"
    ADD CONSTRAINT "razorpay_orders_payment_transaction_id_fkey"
    FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "stripe_payments"
    ADD CONSTRAINT "stripe_payments_payment_transaction_id_fkey"
    FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Coupon redemptions
CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "promo_code_id" UUID,
    "invoice_id" UUID,
    "redeemed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discount_minor" INTEGER NOT NULL,
    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "coupon_redemptions_user_id_redeemed_at_idx" ON "coupon_redemptions"("user_id", "redeemed_at");
CREATE INDEX IF NOT EXISTS "coupon_redemptions_coupon_id_redeemed_at_idx" ON "coupon_redemptions"("coupon_id", "redeemed_at");
CREATE INDEX IF NOT EXISTS "coupon_redemptions_invoice_id_idx" ON "coupon_redemptions"("invoice_id");
CREATE INDEX IF NOT EXISTS "coupon_redemptions_status_deleted_at_idx" ON "coupon_redemptions"("status", "deleted_at");

DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Stripe customers
CREATE TABLE IF NOT EXISTS "stripe_customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "default_currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "meta_json" JSONB,
    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "stripe_customers_user_id_key" ON "stripe_customers"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_customers_stripe_customer_id_key" ON "stripe_customers"("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "stripe_customers_status_deleted_at_idx" ON "stripe_customers"("status", "deleted_at");

DO $$ BEGIN
  ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Webhook inbox (idempotent processing)
CREATE TABLE IF NOT EXISTS "payment_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" VARCHAR(40) NOT NULL,
    "event_id" VARCHAR(191) NOT NULL,
    "event_type" VARCHAR(120) NOT NULL,
    "payload_json" JSONB NOT NULL,
    "processed_at" TIMESTAMPTZ(6),
    "processing_error" TEXT,
    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_webhook_events_provider_event_id_key" ON "payment_webhook_events"("provider", "event_id");
CREATE INDEX IF NOT EXISTS "payment_webhook_events_event_type_created_at_idx" ON "payment_webhook_events"("event_type", "created_at");
CREATE INDEX IF NOT EXISTS "payment_webhook_events_processed_at_idx" ON "payment_webhook_events"("processed_at");
CREATE INDEX IF NOT EXISTS "payment_webhook_events_status_deleted_at_idx" ON "payment_webhook_events"("status", "deleted_at");

-- Explicit-named FK integrity
DO $$ BEGIN
  ALTER TABLE "marriage_timing_windows" ADD CONSTRAINT "marriage_timing_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "career_timing_windows" ADD CONSTRAINT "career_timing_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "education_timing_windows" ADD CONSTRAINT "education_timing_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "foreign_settlement_windows" ADD CONSTRAINT "foreign_settlement_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "horoscope_pdf_reports" ADD CONSTRAINT "horoscope_pdf_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "horoscope_pdf_reports" ADD CONSTRAINT "horoscope_pdf_reports_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "horoscope_pdf_reports_chart_id_idx" ON "horoscope_pdf_reports"("chart_id");

DO $$ BEGIN
  ALTER TABLE "compatibility_pdf_reports" ADD CONSTRAINT "compatibility_pdf_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "compatibility_pdf_reports" ADD CONSTRAINT "compatibility_pdf_reports_compatibility_report_id_fkey" FOREIGN KEY ("compatibility_report_id") REFERENCES "compatibility_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "compatibility_pdf_reports_compatibility_report_id_idx" ON "compatibility_pdf_reports"("compatibility_report_id");

DO $$ BEGIN
  ALTER TABLE "marriage_timing_pdf_reports" ADD CONSTRAINT "marriage_timing_pdf_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ai_summary_pdf_reports" ADD CONSTRAINT "ai_summary_pdf_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ai_summary_pdf_reports" ADD CONSTRAINT "ai_summary_pdf_reports_ai_report_id_fkey" FOREIGN KEY ("ai_report_id") REFERENCES "ai_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "ai_summary_pdf_reports_ai_report_id_idx" ON "ai_summary_pdf_reports"("ai_report_id");

DO $$ BEGIN
  ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "push_notifications_device_id_idx" ON "push_notifications"("device_id");

DO $$ BEGIN
  ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "email_notifications_user_id_idx" ON "email_notifications"("user_id");

DO $$ BEGIN
  ALTER TABLE "sms_notifications" ADD CONSTRAINT "sms_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "sms_notifications_user_id_idx" ON "sms_notifications"("user_id");

DO $$ BEGIN
  ALTER TABLE "in_app_notifications" ADD CONSTRAINT "in_app_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Canonical compatibility pair ordering (user_a_id < user_b_id lexicographically as UUID text)
DO $$ BEGIN
  ALTER TABLE "compatibility_reports"
    ADD CONSTRAINT "compatibility_reports_canonical_pair_chk"
    CHECK ("user_a_id"::text < "user_b_id"::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Soft-delete friendly unique email: keep hard unique for now; document partial unique strategy for Module 2
