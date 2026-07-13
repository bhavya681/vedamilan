-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'JAIN', 'BUDDHIST', 'PARSI', 'JEWISH', 'SPIRITUAL', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE', 'ANNULLED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'ESSENCE', 'SANGAM', 'PARAMPARA', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SUGGESTED', 'LIKED', 'INTERESTED', 'MUTUAL', 'REQUESTED', 'ACCEPTED', 'REJECTED', 'BLOCKED', 'EXPIRED', 'SHORTLISTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH', 'MESSAGE', 'PAYMENT', 'SUBSCRIPTION', 'SYSTEM', 'SECURITY', 'CONSULTATION', 'REPORT_READY', 'PROMOTION', 'REMINDER');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL', 'SMS', 'IN_APP', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'ASTROLOGER', 'CONTENT_MANAGER', 'FINANCE', 'ANALYST', 'MEMBER', 'PREMIUM_MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "AstrologyReportStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HoroscopeType" AS ENUM ('RASI', 'NAVAMSA', 'DASHAMSA', 'MOON_CHART', 'SUN_CHART', 'BHAVA', 'KP', 'JAIMINI', 'CHALLIT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RelationshipIntent" AS ENUM ('MARRIAGE', 'SERIOUS_RELATIONSHIP', 'FAMILY_INTRODUCED', 'OPEN_TO_EXPLORE');

-- CreateEnum
CREATE TYPE "LifestyleType" AS ENUM ('TRADITIONAL', 'MODERATE', 'MODERN', 'LIBERAL', 'SPIRITUAL');

-- CreateEnum
CREATE TYPE "FoodPreference" AS ENUM ('VEGETARIAN', 'EGGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'JAIN_VEGETARIAN', 'FLEXITARIAN');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('JOINT', 'NUCLEAR', 'EXTENDED', 'OTHER');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'DOCTORATE', 'PROFESSIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "IncomeRange" AS ENUM ('UNDER_3L', 'L3_TO_5L', 'L5_TO_7L', 'L7_TO_10L', 'L10_TO_15L', 'L15_TO_25L', 'L25_TO_50L', 'L50_TO_1CR', 'ABOVE_1CR', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "HeightRange" AS ENUM ('UNDER_4_10', 'H4_10_TO_5_0', 'H5_0_TO_5_2', 'H5_2_TO_5_4', 'H5_4_TO_5_6', 'H5_6_TO_5_8', 'H5_8_TO_5_10', 'H5_10_TO_6_0', 'H6_0_TO_6_2', 'ABOVE_6_2');

-- CreateEnum
CREATE TYPE "WeightRange" AS ENUM ('UNDER_45', 'W45_TO_55', 'W55_TO_65', 'W65_TO_75', 'W75_TO_85', 'W85_TO_95', 'ABOVE_95', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ProfessionType" AS ENUM ('PRIVATE_JOB', 'GOVERNMENT', 'BUSINESS', 'SELF_EMPLOYED', 'DOCTOR', 'ENGINEER', 'LAWYER', 'CA_CS', 'TEACHER', 'DEFENCE', 'CIVIL_SERVICES', 'IT_SOFTWARE', 'FINANCE', 'MEDIA', 'HEALTHCARE', 'HOSPITALITY', 'STUDENT', 'HOMEMAKER', 'RETIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'HINDI', 'BENGALI', 'TELUGU', 'MARATHI', 'TAMIL', 'URDU', 'GUJARATI', 'KANNADA', 'ODIA', 'MALAYALAM', 'PUNJABI', 'ASSAMESE', 'SANSKRIT', 'OTHER');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('IN', 'US', 'AE', 'GB', 'CA', 'AU', 'SG', 'NZ', 'QA', 'SA', 'KW', 'OM', 'BH', 'MY', 'DE', 'FR', 'NL', 'SE', 'CH', 'JP', 'OTHER');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('AN', 'AP', 'AR', 'AS', 'BR', 'CH', 'CT', 'DL', 'DH', 'GA', 'GJ', 'HR', 'HP', 'JK', 'JH', 'KA', 'KL', 'LA', 'LD', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OR', 'PY', 'PB', 'RJ', 'SK', 'TN', 'TS', 'TR', 'UP', 'UK', 'WB', 'OTHER');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('MUMBAI', 'DELHI', 'BENGALURU', 'HYDERABAD', 'AHMEDABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'JAIPUR', 'SURAT', 'LUCKNOW', 'KANPUR', 'NAGPUR', 'INDORE', 'THANE', 'BHOPAL', 'VISAKHAPATNAM', 'PIMPRI_CHINCHWAD', 'PATNA', 'VADODARA', 'GHAZIABAD', 'LUDHIANA', 'AGRA', 'NASHIK', 'FARIDABAD', 'MEERUT', 'RAJKOT', 'VARANASI', 'SRINAGAR', 'AURANGABAD', 'CHANDIGARH', 'NOIDA', 'GURUGRAM', 'KOCHI', 'COIMBATORE', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanetName" AS ENUM ('SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU', 'URANUS', 'NEPTUNE', 'PLUTO', 'ASCENDANT');

-- CreateEnum
CREATE TYPE "ZodiacSign" AS ENUM ('ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES');

-- CreateEnum
CREATE TYPE "NakshatraName" AS ENUM ('ASHWINI', 'BHARANI', 'KRITTIKA', 'ROHINI', 'MRIGASHIRA', 'ARDRA', 'PUNARVASU', 'PUSHYA', 'ASHLESHA', 'MAGHA', 'PURVA_PHALGUNI', 'UTTARA_PHALGUNI', 'HASTA', 'CHITRA', 'SWATI', 'VISHAKHA', 'ANURADHA', 'JYESHTHA', 'MULA', 'PURVA_ASHADHA', 'UTTARA_ASHADHA', 'SHRAVANA', 'DHANISHTA', 'SHATABHISHA', 'PURVA_BHADRAPADA', 'UTTARA_BHADRAPADA', 'REVATI');

-- CreateEnum
CREATE TYPE "DashaLevel" AS ENUM ('MAHADASHA', 'ANTARDASHA', 'PRATYANTARDASHA', 'SOOKSHMA', 'PRANA');

-- CreateEnum
CREATE TYPE "DashaWindowType" AS ENUM ('MARRIAGE', 'CAREER', 'EDUCATION', 'FOREIGN_SETTLEMENT', 'HEALTH', 'WEALTH', 'SPIRITUAL', 'CHILD_BIRTH');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GOVERNMENT_ID', 'PASSPORT', 'AADHAAR', 'PAN', 'DRIVING_LICENSE', 'BIRTH_CERTIFICATE', 'EDUCATION_CERTIFICATE', 'INCOME_PROOF', 'ADDRESS_PROOF', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'PDF', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PrivacyVisibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'CONNECTIONS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('AUDIO', 'VIDEO');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'RINGING', 'ANSWERED', 'MISSED', 'REJECTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL_DAYS');

-- CreateEnum
CREATE TYPE "WalletTxnType" AS ENUM ('CREDIT', 'DEBIT', 'HOLD', 'RELEASE', 'REFUND');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'HTML', 'JSON');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENAI', 'ANTHROPIC', 'AZURE_OPENAI', 'LOCAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EmbeddingSource" AS ENUM ('PROFILE', 'BIO', 'PREFERENCE', 'HOROSCOPE_SUMMARY', 'CONVERSATION', 'REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE', 'PAYMENT', 'EXPORT', 'IMPERSONATE', 'CONFIG_CHANGE');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'REGISTER', 'PASSWORD_RESET', 'EMAIL_VERIFY', 'PHONE_VERIFY', 'SENSITIVE_ACTION');

-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'APPLE', 'LINKEDIN', 'TRUECALLER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "email" CITEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(20),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "display_name" VARCHAR(120),
    "last_login_at" TIMESTAMPTZ(6),
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_reason" TEXT,
    "locale" "Language" NOT NULL DEFAULT 'ENGLISH',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "device_id" UUID,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(6),
    "scope" TEXT,
    "id_token" TEXT,
    "password" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "replaced_by_token_id" UUID,
    "device_id" UUID,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "failure_reason" TEXT,
    "location_label" TEXT,
    "device_id" UUID,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "device_fingerprint" TEXT NOT NULL,
    "platform" VARCHAR(64),
    "os_version" VARCHAR(64),
    "app_version" VARCHAR(64),
    "push_token" TEXT,
    "last_seen_at" TIMESTAMPTZ(6),
    "trusted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "destination" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "ip_address" VARCHAR(64),

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_logins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" CITEXT,
    "profile_url" TEXT,
    "raw_profile" JSONB,

    CONSTRAINT "social_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "code" "Role" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,

    CONSTRAINT "app_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "code" VARCHAR(120) NOT NULL,
    "resource" VARCHAR(120) NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_countries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "code" "Country" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "phone_code" VARCHAR(8),

    CONSTRAINT "geo_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "country_id" UUID NOT NULL,
    "code" "State" NOT NULL,
    "name" VARCHAR(120) NOT NULL,

    CONSTRAINT "geo_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_cities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "country_id" UUID NOT NULL,
    "state_id" UUID,
    "name" VARCHAR(160) NOT NULL,
    "city_enum" "City",
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "timezone" VARCHAR(64),

    CONSTRAINT "geo_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(80) NOT NULL,
    "middle_name" VARCHAR(80),
    "last_name" VARCHAR(80),
    "gender" "Gender" NOT NULL,
    "marital_status" "MaritalStatus" NOT NULL,
    "relationship_intent" "RelationshipIntent" NOT NULL DEFAULT 'MARRIAGE',
    "height_cm" INTEGER,
    "weight_kg" INTEGER,
    "height_range" "HeightRange",
    "weight_range" "WeightRange",
    "blood_group" VARCHAR(8),
    "complexion" VARCHAR(40),
    "mother_tongue" "Language",
    "about_me" TEXT,
    "profile_completeness" INTEGER NOT NULL DEFAULT 0,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "profile_slug" VARCHAR(120),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_bios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "profile_id" UUID NOT NULL,
    "headline" VARCHAR(180),
    "summary" TEXT,
    "family_details" TEXT,
    "partner_expectations" TEXT,

    CONSTRAINT "profile_bios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "min_age" INTEGER NOT NULL DEFAULT 21,
    "max_age" INTEGER NOT NULL DEFAULT 40,
    "genders" "Gender"[],
    "marital_statuses" "MaritalStatus"[],
    "religions" "Religion"[],
    "countries" "Country"[],
    "states" "State"[],
    "cities" "City"[],
    "height_min_cm" INTEGER,
    "height_max_cm" INTEGER,
    "education_levels" "EducationLevel"[],
    "profession_types" "ProfessionType"[],
    "income_ranges" "IncomeRange"[],
    "food_preferences" "FoodPreference"[],
    "lifestyle_types" "LifestyleType"[],
    "family_types" "FamilyType"[],
    "mother_tongues" "Language"[],
    "manglik_accept" BOOLEAN,
    "max_distance_km" INTEGER,
    "must_have_notes" TEXT,
    "deal_breakers" TEXT,

    CONSTRAINT "partner_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "cloudinary_public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "moderation_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "width" INTEGER,
    "height" INTEGER,

    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "storage_url" TEXT NOT NULL,
    "mime_type" VARCHAR(120),
    "file_size_bytes" INTEGER,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "storage_url" TEXT NOT NULL,
    "id_number_masked" VARCHAR(64),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "caption" VARCHAR(280),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visibility" "PrivacyVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "field_of_study" VARCHAR(160),
    "year_from" INTEGER,
    "year_to" INTEGER,
    "is_highest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "profession_type" "ProfessionType" NOT NULL,
    "organization" VARCHAR(200),
    "designation" VARCHAR(160),
    "income_range" "IncomeRange",
    "work_city" VARCHAR(120),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "years_experience" INTEGER,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifestyles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "lifestyle_type" "LifestyleType" NOT NULL,
    "food_preference" "FoodPreference" NOT NULL,
    "smoking" VARCHAR(40),
    "drinking" VARCHAR(40),
    "workout" VARCHAR(40),
    "sleep_schedule" VARCHAR(80),
    "pets" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lifestyles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "religion_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "religion" "Religion" NOT NULL,
    "caste" VARCHAR(120),
    "sub_caste" VARCHAR(120),
    "gotra" VARCHAR(120),
    "manglik_self_declared" BOOLEAN,
    "practicing_level" VARCHAR(80),

    CONSTRAINT "religion_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "community_name" VARCHAR(160) NOT NULL,
    "sub_community" VARCHAR(160),
    "family_type" "FamilyType" NOT NULL,
    "family_values" TEXT,
    "ancestral_origin" VARCHAR(160),

    CONSTRAINT "community_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_languages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "language" "Language" NOT NULL,
    "proficiency" VARCHAR(40),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_hobbies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(80),

    CONSTRAINT "user_hobbies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "country_id" UUID,
    "state_id" UUID,
    "city_id" UUID,
    "country_enum" "Country",
    "state_enum" "State",
    "city_enum" "City",
    "address_line" TEXT,
    "postal_code" VARCHAR(20),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "is_hometown" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "profile_visibility" "PrivacyVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "photo_visibility" "PrivacyVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "contact_visibility" "PrivacyVisibility" NOT NULL DEFAULT 'CONNECTIONS_ONLY',
    "horoscope_visibility" "PrivacyVisibility" NOT NULL DEFAULT 'CONNECTIONS_ONLY',
    "show_online_status" BOOLEAN NOT NULL DEFAULT true,
    "show_last_active" BOOLEAN NOT NULL DEFAULT true,
    "allow_ai_matching" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "privacy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "reason" TEXT,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reported_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reporter_id" UUID NOT NULL,
    "reported_id" UUID NOT NULL,
    "reason_code" VARCHAR(80) NOT NULL,
    "details" TEXT,
    "resolution" TEXT,
    "resolved_at" TIMESTAMPTZ(6),

    CONSTRAINT "reported_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "saver_id" UUID NOT NULL,
    "saved_id" UUID NOT NULL,
    "note" VARCHAR(280),

    CONSTRAINT "saved_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "viewer_id" UUID NOT NULL,
    "viewed_id" UUID NOT NULL,
    "viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "view_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "recently_viewed_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortlisted_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "shortlister_id" UUID NOT NULL,
    "shortlisted_id" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "shortlisted_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birth_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "birth_time" TIMESTAMPTZ(6) NOT NULL,
    "birth_place_label" VARCHAR(200) NOT NULL,
    "geo_city_id" UUID,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "timezone" VARCHAR(64) NOT NULL,
    "utc_offset_minutes" INTEGER NOT NULL,
    "dst_observed" BOOLEAN NOT NULL DEFAULT false,
    "source_accuracy" VARCHAR(40) NOT NULL,
    "birth_certificate_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "birth_certificate_url" TEXT,
    "julian_day_ut" DECIMAL(18,10),
    "ayanamsa" VARCHAR(40) DEFAULT 'LAHIRI',

    CONSTRAINT "birth_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horoscope_charts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "chart_type" "HoroscopeType" NOT NULL,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',
    "ayanamsa" VARCHAR(40) NOT NULL DEFAULT 'LAHIRI',
    "house_system" VARCHAR(40) NOT NULL DEFAULT 'WHOLE_SIGN',
    "lagna_sign" "ZodiacSign",
    "moon_sign" "ZodiacSign",
    "sun_sign" "ZodiacSign",
    "computed_at" TIMESTAMPTZ(6),
    "engine_version" VARCHAR(40),
    "raw_payload" JSONB,

    CONSTRAINT "horoscope_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planet_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "longitude" DECIMAL(10,6) NOT NULL,
    "latitude" DECIMAL(10,6) NOT NULL,
    "speed" DECIMAL(10,6) NOT NULL,
    "house_number" INTEGER NOT NULL,
    "sign" "ZodiacSign" NOT NULL,
    "is_retrograde" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "planet_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planet_degrees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "absolute_degree" DECIMAL(10,6) NOT NULL,
    "sign_degree" DECIMAL(10,6) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,

    CONSTRAINT "planet_degrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_cusps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "house_number" INTEGER NOT NULL,
    "cusp_longitude" DECIMAL(10,6) NOT NULL,
    "sign" "ZodiacSign" NOT NULL,

    CONSTRAINT "house_cusps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_lords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "house_number" INTEGER NOT NULL,
    "lord_planet" "PlanetName" NOT NULL,
    "lord_house" INTEGER NOT NULL,
    "lord_sign" "ZodiacSign" NOT NULL,

    CONSTRAINT "house_lords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nakshatra_placements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "nakshatra" "NakshatraName" NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "pada" INTEGER NOT NULL,

    CONSTRAINT "nakshatra_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pada_placements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "pada_number" INTEGER NOT NULL,
    "navamsa_sign" "ZodiacSign" NOT NULL,

    CONSTRAINT "pada_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sign_placements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "sign" "ZodiacSign" NOT NULL,
    "dignity" VARCHAR(40),

    CONSTRAINT "sign_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planet_strengths" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "strength_score" DECIMAL(8,4) NOT NULL,
    "strength_label" VARCHAR(40),
    "notes" TEXT,

    CONSTRAINT "planet_strengths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadbala" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "sthana_bala" DECIMAL(10,4) NOT NULL,
    "dig_bala" DECIMAL(10,4) NOT NULL,
    "kala_bala" DECIMAL(10,4) NOT NULL,
    "chesta_bala" DECIMAL(10,4) NOT NULL,
    "naisargika_bala" DECIMAL(10,4) NOT NULL,
    "drik_bala" DECIMAL(10,4) NOT NULL,
    "total_bala" DECIMAL(10,4) NOT NULL,
    "rupa" DECIMAL(10,4) NOT NULL,

    CONSTRAINT "shadbala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exaltations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "is_exalted" BOOLEAN NOT NULL,
    "sign" "ZodiacSign" NOT NULL,
    "degree_diff" DECIMAL(8,4),

    CONSTRAINT "exaltations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debilitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "is_debilitated" BOOLEAN NOT NULL,
    "sign" "ZodiacSign" NOT NULL,
    "degree_diff" DECIMAL(8,4),

    CONSTRAINT "debilitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combustions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "is_combust" BOOLEAN NOT NULL,
    "orb_degrees" DECIMAL(8,4),

    CONSTRAINT "combustions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrogrades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "is_retrograde" BOOLEAN NOT NULL,
    "speed" DECIMAL(10,6),

    CONSTRAINT "retrogrades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conjunctions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet_a" "PlanetName" NOT NULL,
    "planet_b" "PlanetName" NOT NULL,
    "orb_degrees" DECIMAL(8,4) NOT NULL,
    "house_number" INTEGER,
    "sign" "ZodiacSign",

    CONSTRAINT "conjunctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "from_planet" "PlanetName" NOT NULL,
    "to_planet" "PlanetName" NOT NULL,
    "aspect_type" VARCHAR(40) NOT NULL,
    "orb_degrees" DECIMAL(8,4) NOT NULL,
    "is_applying" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "aspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planetary_yogas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "yoga_code" VARCHAR(80) NOT NULL,
    "yoga_name" VARCHAR(160) NOT NULL,
    "strength" DECIMAL(8,4),
    "description" TEXT,
    "planets_involved" "PlanetName"[],

    CONSTRAINT "planetary_yogas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raj_yogas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "yoga_name" VARCHAR(160) NOT NULL,
    "lords_involved" "PlanetName"[],
    "houses_involved" INTEGER[],
    "strength" DECIMAL(8,4),
    "notes" TEXT,

    CONSTRAINT "raj_yogas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dhana_yogas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "yoga_name" VARCHAR(160) NOT NULL,
    "planets_involved" "PlanetName"[],
    "strength" DECIMAL(8,4),
    "notes" TEXT,

    CONSTRAINT "dhana_yogas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vipreet_raj_yogas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "subtype" VARCHAR(80) NOT NULL,
    "planets_involved" "PlanetName"[],
    "houses_involved" INTEGER[],
    "notes" TEXT,

    CONSTRAINT "vipreet_raj_yogas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neecha_bhanga" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "is_cancelled" BOOLEAN NOT NULL,
    "cancellation_type" VARCHAR(80),
    "notes" TEXT,

    CONSTRAINT "neecha_bhanga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doshas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "dosha_code" VARCHAR(80) NOT NULL,
    "dosha_name" VARCHAR(160) NOT NULL,
    "severity" VARCHAR(40),
    "is_present" BOOLEAN NOT NULL,
    "notes" TEXT,

    CONSTRAINT "doshas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manglik_doshas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "is_manglik" BOOLEAN NOT NULL,
    "intensity" VARCHAR(40),
    "mars_house" INTEGER,
    "exceptions" TEXT[],
    "notes" TEXT,

    CONSTRAINT "manglik_doshas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kaal_sarp_doshas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "is_present" BOOLEAN NOT NULL,
    "subtype" VARCHAR(80),
    "intensity" VARCHAR(40),
    "notes" TEXT,

    CONSTRAINT "kaal_sarp_doshas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pitru_doshas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "is_present" BOOLEAN NOT NULL,
    "indicators" TEXT[],
    "notes" TEXT,

    CONSTRAINT "pitru_doshas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nadi_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "nadi_type" VARCHAR(40) NOT NULL,
    "source_planet" "PlanetName" NOT NULL DEFAULT 'MOON',

    CONSTRAINT "nadi_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bhakoot_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "moon_sign" "ZodiacSign" NOT NULL,
    "bhakoot_group" VARCHAR(40),

    CONSTRAINT "bhakoot_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yoni_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "yoni_type" VARCHAR(40) NOT NULL,
    "nakshatra" "NakshatraName" NOT NULL,

    CONSTRAINT "yoni_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "varna_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "varna_type" VARCHAR(40) NOT NULL,
    "moon_sign" "ZodiacSign" NOT NULL,

    CONSTRAINT "varna_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vashya_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "vashya_type" VARCHAR(40) NOT NULL,
    "moon_sign" "ZodiacSign" NOT NULL,

    CONSTRAINT "vashya_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tara_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "birth_nakshatra" "NakshatraName" NOT NULL,
    "tara_sequence" INTEGER[],

    CONSTRAINT "tara_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gana_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "gana_type" VARCHAR(40) NOT NULL,
    "nakshatra" "NakshatraName" NOT NULL,

    CONSTRAINT "gana_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navamsa_charts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "lagna_sign" "ZodiacSign" NOT NULL,
    "summary_json" JSONB NOT NULL,

    CONSTRAINT "navamsa_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashamsa_charts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "lagna_sign" "ZodiacSign" NOT NULL,
    "career_hints" TEXT,
    "summary_json" JSONB NOT NULL,

    CONSTRAINT "dashamsa_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moon_chart_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "moon_sign" "ZodiacSign" NOT NULL,
    "moon_nakshatra" "NakshatraName" NOT NULL,
    "moon_pada" INTEGER NOT NULL,
    "summary_json" JSONB NOT NULL,

    CONSTRAINT "moon_chart_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kp_data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "cuspal_sub_lords" JSONB NOT NULL,
    "significators" JSONB NOT NULL,
    "notes" TEXT,

    CONSTRAINT "kp_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jaimini_data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "karakas" JSONB NOT NULL,
    "chara_dasha" JSONB,
    "notes" TEXT,

    CONSTRAINT "jaimini_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upapada_lagnas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "sign" "ZodiacSign" NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "upapada_lagnas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "darakarakas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "degree" DECIMAL(10,6) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "darakarakas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atmakarakas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "planet" "PlanetName" NOT NULL,
    "degree" DECIMAL(10,6) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "atmakarakas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karakamsas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "chart_id" UUID NOT NULL,
    "sign" "ZodiacSign" NOT NULL,
    "atmakaraka_planet" "PlanetName" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "karakamsas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dasha_timelines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "system" VARCHAR(40) NOT NULL DEFAULT 'VIMSHOTTARI',
    "computed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dasha_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dasha_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeline_id" UUID NOT NULL,
    "level" "DashaLevel" NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "parent_period_id" UUID,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dasha_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_dashas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeline_id" UUID NOT NULL,
    "mahadasha_lord" "PlanetName" NOT NULL,
    "antardasha_lord" "PlanetName" NOT NULL,
    "pratyantar_lord" "PlanetName",
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "snapshot_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "current_dashas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "future_dashas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeline_id" UUID NOT NULL,
    "level" "DashaLevel" NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "future_dashas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "previous_dashas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeline_id" UUID NOT NULL,
    "level" "DashaLevel" NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "previous_dashas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dasha_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "window_type" "DashaWindowType" NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "confidence" DECIMAL(5,2),
    "mahadasha_lord" "PlanetName",
    "antardasha_lord" "PlanetName",
    "rationale" TEXT,
    "score" DECIMAL(5,2),

    CONSTRAINT "dasha_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibility_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_a_id" UUID NOT NULL,
    "user_b_id" UUID NOT NULL,
    "overall_match_score" DECIMAL(5,2) NOT NULL,
    "ai_match_score" DECIMAL(5,2),
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',
    "summary" TEXT,
    "computed_at" TIMESTAMPTZ(6),

    CONSTRAINT "compatibility_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ashta_koota_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "varna" DECIMAL(4,2) NOT NULL,
    "vashya" DECIMAL(4,2) NOT NULL,
    "tara" DECIMAL(4,2) NOT NULL,
    "yoni" DECIMAL(4,2) NOT NULL,
    "graha_maitri" DECIMAL(4,2) NOT NULL,
    "gana" DECIMAL(4,2) NOT NULL,
    "bhakoot" DECIMAL(4,2) NOT NULL,
    "nadi" DECIMAL(4,2) NOT NULL,
    "total" DECIMAL(5,2) NOT NULL,
    "max_total" DECIMAL(5,2) NOT NULL DEFAULT 36,

    CONSTRAINT "ashta_koota_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planet_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "planet_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navamsa_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "navamsa_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moon_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "moon_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venus_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "venus_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mars_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "mars_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seventh_house_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "seventh_house_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dasha_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "dasha_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transit_matching_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "as_of_date" DATE NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "transit_matching_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotional_compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "emotional_compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "communication_compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "finance_compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children_compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "children_compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "career_compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spiritual_compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "spiritual_compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conflict_indicators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "severity" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,
    "mitigation" TEXT,

    CONSTRAINT "conflict_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "report_type" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "model" VARCHAR(80) NOT NULL,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'COMPLETED',
    "token_usage_id" UUID,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompt_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "purpose" VARCHAR(80) NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "provider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "model" VARCHAR(80) NOT NULL,
    "latency_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ai_prompt_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_ai_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "ai_report_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content_json" JSONB NOT NULL,
    "checksum" VARCHAR(128) NOT NULL,

    CONSTRAINT "generated_ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "recommended_user_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "reason_codes" TEXT[],
    "explanation" TEXT,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_explanation_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "ai_report_id" UUID,
    "cache_key" VARCHAR(191) NOT NULL,
    "explanation" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_explanation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_embeddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "source" "EmbeddingSource" NOT NULL,
    "source_ref_id" UUID,
    "model" VARCHAR(80) NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "vector_json" JSONB NOT NULL,
    "content_hash" VARCHAR(128) NOT NULL,

    CONSTRAINT "ai_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_memories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "memory_key" VARCHAR(120) NOT NULL,
    "memory_value" JSONB NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversation_contexts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "session_key" VARCHAR(120) NOT NULL,
    "context_json" JSONB NOT NULL,
    "last_message_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversation_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_token_usages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "provider" "AiProvider" NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "estimated_cost_usd" DECIMAL(12,6),
    "purpose" VARCHAR(80) NOT NULL,

    CONSTRAINT "ai_token_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "liker_id" UUID NOT NULL,
    "liked_id" UUID NOT NULL,
    "match_status" "MatchStatus" NOT NULL DEFAULT 'LIKED',

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID NOT NULL,
    "message" VARCHAR(500),
    "match_status" "MatchStatus" NOT NULL DEFAULT 'INTERESTED',

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutual_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_a_id" UUID NOT NULL,
    "user_b_id" UUID NOT NULL,
    "matched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_status" "MatchStatus" NOT NULL DEFAULT 'MUTUAL',
    "conversation_id" UUID,

    CONSTRAINT "mutual_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID NOT NULL,
    "note" VARCHAR(500),
    "match_status" "MatchStatus" NOT NULL DEFAULT 'REQUESTED',
    "responded_at" TIMESTAMPTZ(6),

    CONSTRAINT "connection_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accepted_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_a_id" UUID NOT NULL,
    "user_b_id" UUID NOT NULL,
    "accepted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_status" "MatchStatus" NOT NULL DEFAULT 'ACCEPTED',

    CONSTRAINT "accepted_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rejected_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "rejector_id" UUID NOT NULL,
    "rejected_id" UUID NOT NULL,
    "reason" VARCHAR(280),
    "match_status" "MatchStatus" NOT NULL DEFAULT 'REJECTED',

    CONSTRAINT "rejected_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "reason" TEXT,
    "match_status" "MatchStatus" NOT NULL DEFAULT 'BLOCKED',

    CONSTRAINT "blocked_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "candidate_user_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "match_status" "MatchStatus" NOT NULL DEFAULT 'SUGGESTED',
    "algorithm_version" VARCHAR(40) NOT NULL,
    "features_json" JSONB NOT NULL,
    "shown_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "match_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_group" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(160),
    "last_message_at" TIMESTAMPTZ(6),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ(6),
    "muted_until" TIMESTAMPTZ(6),
    "last_read_at" TIMESTAMPTZ(6),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "body" TEXT,
    "message_status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "reply_to_message_id" UUID,
    "client_message_id" VARCHAR(80),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "read_receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "message_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "read_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "message_id" UUID NOT NULL,
    "uploader_id" UUID NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" VARCHAR(120),
    "file_size_bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "message_id" UUID NOT NULL,
    "uploader_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "waveform_json" JSONB,

    CONSTRAINT "voice_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_calls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "conversation_id" UUID NOT NULL,
    "initiator_id" UUID NOT NULL,
    "call_type" "CallType" NOT NULL DEFAULT 'VIDEO',
    "call_status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "provider_room_id" VARCHAR(160),

    CONSTRAINT "video_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "conversation_id" UUID NOT NULL,
    "video_call_id" UUID,
    "user_id" UUID NOT NULL,
    "call_type" "CallType" NOT NULL,
    "call_status" "CallStatus" NOT NULL,
    "duration_seconds" INTEGER,
    "happened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deleted_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "message_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "deleted_for_everyone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "deleted_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "payload_json" JSONB,
    "read_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "template_id" UUID,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "code" VARCHAR(80) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" VARCHAR(200),
    "body_template" TEXT NOT NULL,
    "locale" "Language" NOT NULL DEFAULT 'ENGLISH',

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notification_id" UUID,
    "template_id" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "provider_ref" VARCHAR(160),
    "delivery_status" VARCHAR(40) NOT NULL,
    "error_message" TEXT,
    "meta_json" JSONB,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "code" "SubscriptionPlan" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "price_inr_paise" INTEGER NOT NULL,
    "price_usd_cents" INTEGER,
    "billing_period_days" INTEGER NOT NULL,
    "features_json" JSONB NOT NULL,
    "stripe_price_id" TEXT,
    "razorpay_plan_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6),
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "cancelled_at" TIMESTAMPTZ(6),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "subscription_id" UUID,
    "invoice_number" VARCHAR(64) NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "amount_minor" INTEGER NOT NULL,
    "tax_minor" INTEGER NOT NULL DEFAULT 0,
    "total_minor" INTEGER NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMPTZ(6),
    "pdf_url" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "invoice_id" UUID,
    "provider" VARCHAR(40) NOT NULL,
    "provider_payment_id" TEXT,
    "amount_minor" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "payment_status" "PaymentStatus" NOT NULL,
    "meta_json" JSONB,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "code" VARCHAR(64) NOT NULL,
    "coupon_type" "CouponType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "max_redemptions" INTEGER,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "plan_id" UUID,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "coupon_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "campaign_name" VARCHAR(120),
    "usage_limit_per_user" INTEGER,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "balance_minor" INTEGER NOT NULL DEFAULT 0,
    "held_minor" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "wallet_id" UUID NOT NULL,
    "txn_type" "WalletTxnType" NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "balance_after_minor" INTEGER NOT NULL,
    "reference" VARCHAR(160),
    "meta_json" JSONB,

    CONSTRAINT "wallet_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "reason" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider_refund_id" TEXT,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "razorpay_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "receipt" VARCHAR(120) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "notes_json" JSONB,

    CONSTRAINT "razorpay_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "stripe_payment_intent_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "amount_minor" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "meta_json" JSONB,

    CONSTRAINT "stripe_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "report_kind" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "storage_url" TEXT,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',
    "source_ref_id" UUID,
    "meta_json" JSONB,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_downloads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "report_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "downloaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(64),

    CONSTRAINT "report_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "astrologers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "bio" TEXT,
    "experience_years" INTEGER NOT NULL,
    "specialties" TEXT[],
    "languages" "Language"[],
    "hourly_rate_minor" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "astrologers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "astrologer_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "astrologer_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time_utc" VARCHAR(8) NOT NULL,
    "end_time_utc" VARCHAR(8) NOT NULL,
    "timezone" VARCHAR(64) NOT NULL,

    CONSTRAINT "astrologer_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "client_id" UUID NOT NULL,
    "astrologer_id" UUID NOT NULL,
    "scheduled_start" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_end" TIMESTAMPTZ(6) NOT NULL,
    "booking_status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "amount_minor" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "notes" TEXT,

    CONSTRAINT "consultation_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_meetings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "booking_id" UUID NOT NULL,
    "meeting_url" TEXT,
    "provider_room_id" VARCHAR(160),
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "recording_url" TEXT,

    CONSTRAINT "consultation_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "booking_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "astrologer_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(160),
    "body" TEXT,

    CONSTRAINT "consultation_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "booking_id" UUID NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" VARCHAR(40),
    "provider_payment_id" TEXT,

    CONSTRAINT "consultation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(120) NOT NULL,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "author_id" UUID NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "excerpt" TEXT,
    "content_markdown" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "post_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "blog_post_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "post_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "blog_post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "parent_id" UUID,
    "body" TEXT NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" VARCHAR(80),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "display_name" VARCHAR(120) NOT NULL,
    "location_label" VARCHAR(120),
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'REVIEW',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "success_stories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "partner_names" VARCHAR(200) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "story" TEXT NOT NULL,
    "wedding_date" DATE,
    "cover_image_url" TEXT,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'REVIEW',

    CONSTRAINT "success_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "employee_code" VARCHAR(64),
    "department" VARCHAR(80),
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "actor_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" UUID,
    "before_json" JSONB,
    "after_json" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "event_name" VARCHAR(120) NOT NULL,
    "properties_json" JSONB,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "permission_id" UUID,
    "actor_user_id" UUID,
    "target_user_id" UUID,
    "change_type" VARCHAR(40) NOT NULL,
    "details" TEXT,

    CONSTRAINT "permission_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "key" VARCHAR(120) NOT NULL,
    "value_json" JSONB NOT NULL,
    "description" TEXT,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "key" VARCHAR(120) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "rules_json" JSONB,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "audience" VARCHAR(40) NOT NULL DEFAULT 'ALL',
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "slug" VARCHAR(180) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "content_status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "seo_json" JSONB,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_daily_active_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "active_users" INTEGER NOT NULL,
    "new_users" INTEGER NOT NULL DEFAULT 0,
    "returning_users" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_daily_active_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_revenue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'INR',
    "gross_minor" INTEGER NOT NULL,
    "net_minor" INTEGER NOT NULL,
    "refund_minor" INTEGER NOT NULL DEFAULT 0,
    "transaction_count" INTEGER NOT NULL,

    CONSTRAINT "analytics_revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "plan_code" "SubscriptionPlan" NOT NULL,
    "active_count" INTEGER NOT NULL,
    "new_count" INTEGER NOT NULL DEFAULT 0,
    "churned_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_retention" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "cohort_date" DATE NOT NULL,
    "day_n" INTEGER NOT NULL,
    "cohort_size" INTEGER NOT NULL,
    "retained_users" INTEGER NOT NULL,
    "retention_rate" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "analytics_retention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_conversions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "funnel_name" VARCHAR(80) NOT NULL,
    "step_name" VARCHAR(80) NOT NULL,
    "users_entered" INTEGER NOT NULL,
    "users_converted" INTEGER NOT NULL,
    "conversion_rate" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "analytics_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_compatibility_success" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "reports_generated" INTEGER NOT NULL,
    "mutual_matches" INTEGER NOT NULL,
    "avg_overall_score" DECIMAL(5,2),
    "avg_ai_score" DECIMAL(5,2),

    CONSTRAINT "analytics_compatibility_success_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_ai_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "request_count" INTEGER NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "estimated_cost_usd" DECIMAL(12,6),

    CONSTRAINT "analytics_ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_chat_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "active_conversations" INTEGER NOT NULL,
    "messages_sent" INTEGER NOT NULL,
    "voice_notes_sent" INTEGER NOT NULL DEFAULT 0,
    "video_calls" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_chat_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "provider" VARCHAR(40) NOT NULL,
    "success_count" INTEGER NOT NULL,
    "failure_count" INTEGER NOT NULL,
    "volume_minor" INTEGER NOT NULL,

    CONSTRAINT "analytics_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_report_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metric_date" DATE NOT NULL,
    "report_kind" VARCHAR(80) NOT NULL,
    "generated_count" INTEGER NOT NULL,
    "download_count" INTEGER NOT NULL,

    CONSTRAINT "analytics_report_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahadashas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeline_id" UUID NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mahadashas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antardashas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "mahadasha_id" UUID NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "antardashas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pratyantar_dashas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "antardasha_id" UUID NOT NULL,
    "lord" "PlanetName" NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pratyantar_dashas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marriage_timing_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "score" DECIMAL(5,2),
    "rationale" TEXT,

    CONSTRAINT "marriage_timing_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_timing_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "score" DECIMAL(5,2),
    "rationale" TEXT,

    CONSTRAINT "career_timing_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_timing_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "score" DECIMAL(5,2),
    "rationale" TEXT,

    CONSTRAINT "education_timing_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foreign_settlement_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "score" DECIMAL(5,2),
    "rationale" TEXT,

    CONSTRAINT "foreign_settlement_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horoscope_pdf_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "chart_id" UUID,
    "storage_url" TEXT NOT NULL,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "horoscope_pdf_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibility_pdf_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "compatibility_report_id" UUID,
    "storage_url" TEXT NOT NULL,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "compatibility_pdf_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marriage_timing_pdf_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "storage_url" TEXT NOT NULL,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "marriage_timing_pdf_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_summary_pdf_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "ai_report_id" UUID,
    "storage_url" TEXT NOT NULL,
    "report_status" "AstrologyReportStatus" NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "ai_summary_pdf_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "device_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "payload_json" JSONB,
    "sent_at" TIMESTAMPTZ(6),
    "delivery_status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "to_email" CITEXT NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "body_html" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "delivery_status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "provider_message_id" TEXT,

    CONSTRAINT "email_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID,
    "to_phone" VARCHAR(20) NOT NULL,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "delivery_status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "provider_message_id" TEXT,

    CONSTRAINT "sms_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "in_app_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" TEXT,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "in_app_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_deleted_at_idx" ON "users"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "sessions_status_deleted_at_idx" ON "sessions"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "accounts_status_deleted_at_idx" ON "accounts"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_id_account_id_key" ON "accounts"("provider_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_status_deleted_at_idx" ON "refresh_tokens"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "login_history_user_id_created_at_idx" ON "login_history"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "login_history_success_created_at_idx" ON "login_history"("success", "created_at");

-- CreateIndex
CREATE INDEX "login_history_status_deleted_at_idx" ON "login_history"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "devices_push_token_idx" ON "devices"("push_token");

-- CreateIndex
CREATE INDEX "devices_status_deleted_at_idx" ON "devices"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "devices_user_id_device_fingerprint_key" ON "devices"("user_id", "device_fingerprint");

-- CreateIndex
CREATE INDEX "otps_destination_purpose_expires_at_idx" ON "otps"("destination", "purpose", "expires_at");

-- CreateIndex
CREATE INDEX "otps_user_id_purpose_idx" ON "otps"("user_id", "purpose");

-- CreateIndex
CREATE INDEX "otps_status_deleted_at_idx" ON "otps"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_hash_key" ON "password_resets"("token_hash");

-- CreateIndex
CREATE INDEX "password_resets_user_id_expires_at_idx" ON "password_resets"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "password_resets_status_deleted_at_idx" ON "password_resets"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_hash_key" ON "email_verifications"("token_hash");

-- CreateIndex
CREATE INDEX "email_verifications_user_id_email_idx" ON "email_verifications"("user_id", "email");

-- CreateIndex
CREATE INDEX "email_verifications_status_deleted_at_idx" ON "email_verifications"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "social_logins_user_id_idx" ON "social_logins"("user_id");

-- CreateIndex
CREATE INDEX "social_logins_status_deleted_at_idx" ON "social_logins"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "social_logins_provider_provider_user_id_key" ON "social_logins"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_roles_code_key" ON "app_roles"("code");

-- CreateIndex
CREATE INDEX "app_roles_status_deleted_at_idx" ON "app_roles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_status_deleted_at_idx" ON "permissions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_status_deleted_at_idx" ON "user_roles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "role_permissions_status_deleted_at_idx" ON "role_permissions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "geo_countries_code_key" ON "geo_countries"("code");

-- CreateIndex
CREATE INDEX "geo_countries_status_deleted_at_idx" ON "geo_countries"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "geo_states_status_deleted_at_idx" ON "geo_states"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "geo_states_country_id_code_key" ON "geo_states"("country_id", "code");

-- CreateIndex
CREATE INDEX "geo_cities_city_enum_idx" ON "geo_cities"("city_enum");

-- CreateIndex
CREATE INDEX "geo_cities_name_idx" ON "geo_cities"("name");

-- CreateIndex
CREATE INDEX "geo_cities_status_deleted_at_idx" ON "geo_cities"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "geo_cities_country_id_state_id_name_key" ON "geo_cities"("country_id", "state_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_profile_slug_key" ON "user_profiles"("profile_slug");

-- CreateIndex
CREATE INDEX "user_profiles_gender_marital_status_status_idx" ON "user_profiles"("gender", "marital_status", "status");

-- CreateIndex
CREATE INDEX "user_profiles_verification_status_idx" ON "user_profiles"("verification_status");

-- CreateIndex
CREATE INDEX "user_profiles_profile_completeness_idx" ON "user_profiles"("profile_completeness");

-- CreateIndex
CREATE INDEX "user_profiles_status_deleted_at_idx" ON "user_profiles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "profile_bios_profile_id_key" ON "profile_bios"("profile_id");

-- CreateIndex
CREATE INDEX "profile_bios_status_deleted_at_idx" ON "profile_bios"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "partner_preferences_user_id_key" ON "partner_preferences"("user_id");

-- CreateIndex
CREATE INDEX "partner_preferences_min_age_max_age_idx" ON "partner_preferences"("min_age", "max_age");

-- CreateIndex
CREATE INDEX "partner_preferences_status_deleted_at_idx" ON "partner_preferences"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "profile_images_user_id_is_primary_idx" ON "profile_images"("user_id", "is_primary");

-- CreateIndex
CREATE INDEX "profile_images_moderation_status_idx" ON "profile_images"("moderation_status");

-- CreateIndex
CREATE INDEX "profile_images_status_deleted_at_idx" ON "profile_images"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "user_documents_user_id_document_type_idx" ON "user_documents"("user_id", "document_type");

-- CreateIndex
CREATE INDEX "user_documents_status_deleted_at_idx" ON "user_documents"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "verification_documents_user_id_verification_status_idx" ON "verification_documents"("user_id", "verification_status");

-- CreateIndex
CREATE INDEX "verification_documents_status_deleted_at_idx" ON "verification_documents"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "gallery_items_user_id_sort_order_idx" ON "gallery_items"("user_id", "sort_order");

-- CreateIndex
CREATE INDEX "gallery_items_status_deleted_at_idx" ON "gallery_items"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "education_user_id_level_idx" ON "education"("user_id", "level");

-- CreateIndex
CREATE INDEX "education_status_deleted_at_idx" ON "education"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "careers_user_id_is_current_idx" ON "careers"("user_id", "is_current");

-- CreateIndex
CREATE INDEX "careers_profession_type_income_range_idx" ON "careers"("profession_type", "income_range");

-- CreateIndex
CREATE INDEX "careers_status_deleted_at_idx" ON "careers"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "lifestyles_user_id_key" ON "lifestyles"("user_id");

-- CreateIndex
CREATE INDEX "lifestyles_lifestyle_type_food_preference_idx" ON "lifestyles"("lifestyle_type", "food_preference");

-- CreateIndex
CREATE INDEX "lifestyles_status_deleted_at_idx" ON "lifestyles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "religion_profiles_user_id_key" ON "religion_profiles"("user_id");

-- CreateIndex
CREATE INDEX "religion_profiles_religion_caste_idx" ON "religion_profiles"("religion", "caste");

-- CreateIndex
CREATE INDEX "religion_profiles_status_deleted_at_idx" ON "religion_profiles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "community_profiles_user_id_key" ON "community_profiles"("user_id");

-- CreateIndex
CREATE INDEX "community_profiles_community_name_idx" ON "community_profiles"("community_name");

-- CreateIndex
CREATE INDEX "community_profiles_status_deleted_at_idx" ON "community_profiles"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "user_languages_status_deleted_at_idx" ON "user_languages"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_languages_user_id_language_key" ON "user_languages"("user_id", "language");

-- CreateIndex
CREATE INDEX "user_hobbies_status_deleted_at_idx" ON "user_hobbies"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_hobbies_user_id_name_key" ON "user_hobbies"("user_id", "name");

-- CreateIndex
CREATE INDEX "user_interests_status_deleted_at_idx" ON "user_interests"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_user_id_name_key" ON "user_interests"("user_id", "name");

-- CreateIndex
CREATE INDEX "user_locations_user_id_is_current_idx" ON "user_locations"("user_id", "is_current");

-- CreateIndex
CREATE INDEX "user_locations_country_enum_state_enum_city_enum_idx" ON "user_locations"("country_enum", "state_enum", "city_enum");

-- CreateIndex
CREATE INDEX "user_locations_latitude_longitude_idx" ON "user_locations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "user_locations_status_deleted_at_idx" ON "user_locations"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_settings_user_id_key" ON "privacy_settings"("user_id");

-- CreateIndex
CREATE INDEX "privacy_settings_status_deleted_at_idx" ON "privacy_settings"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "blocked_users_blocked_id_idx" ON "blocked_users"("blocked_id");

-- CreateIndex
CREATE INDEX "blocked_users_status_deleted_at_idx" ON "blocked_users"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_blocker_id_blocked_id_key" ON "blocked_users"("blocker_id", "blocked_id");

-- CreateIndex
CREATE INDEX "reported_users_reported_id_created_at_idx" ON "reported_users"("reported_id", "created_at");

-- CreateIndex
CREATE INDEX "reported_users_status_deleted_at_idx" ON "reported_users"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "saved_profiles_saved_id_idx" ON "saved_profiles"("saved_id");

-- CreateIndex
CREATE INDEX "saved_profiles_status_deleted_at_idx" ON "saved_profiles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "saved_profiles_saver_id_saved_id_key" ON "saved_profiles"("saver_id", "saved_id");

-- CreateIndex
CREATE INDEX "recently_viewed_profiles_viewer_id_viewed_at_idx" ON "recently_viewed_profiles"("viewer_id", "viewed_at");

-- CreateIndex
CREATE INDEX "recently_viewed_profiles_viewed_id_viewed_at_idx" ON "recently_viewed_profiles"("viewed_id", "viewed_at");

-- CreateIndex
CREATE INDEX "recently_viewed_profiles_status_deleted_at_idx" ON "recently_viewed_profiles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_profiles_viewer_id_viewed_id_key" ON "recently_viewed_profiles"("viewer_id", "viewed_id");

-- CreateIndex
CREATE INDEX "shortlisted_profiles_shortlisted_id_idx" ON "shortlisted_profiles"("shortlisted_id");

-- CreateIndex
CREATE INDEX "shortlisted_profiles_status_deleted_at_idx" ON "shortlisted_profiles"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "shortlisted_profiles_shortlister_id_shortlisted_id_key" ON "shortlisted_profiles"("shortlister_id", "shortlisted_id");

-- CreateIndex
CREATE UNIQUE INDEX "birth_details_user_id_key" ON "birth_details"("user_id");

-- CreateIndex
CREATE INDEX "birth_details_date_of_birth_idx" ON "birth_details"("date_of_birth");

-- CreateIndex
CREATE INDEX "birth_details_latitude_longitude_idx" ON "birth_details"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "birth_details_status_deleted_at_idx" ON "birth_details"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "horoscope_charts_report_status_computed_at_idx" ON "horoscope_charts"("report_status", "computed_at");

-- CreateIndex
CREATE INDEX "horoscope_charts_status_deleted_at_idx" ON "horoscope_charts"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "horoscope_charts_user_id_chart_type_key" ON "horoscope_charts"("user_id", "chart_type");

-- CreateIndex
CREATE INDEX "planet_positions_planet_sign_idx" ON "planet_positions"("planet", "sign");

-- CreateIndex
CREATE INDEX "planet_positions_status_deleted_at_idx" ON "planet_positions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "planet_positions_chart_id_planet_key" ON "planet_positions"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "planet_degrees_status_deleted_at_idx" ON "planet_degrees"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "planet_degrees_chart_id_planet_key" ON "planet_degrees"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "house_cusps_status_deleted_at_idx" ON "house_cusps"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "house_cusps_chart_id_house_number_key" ON "house_cusps"("chart_id", "house_number");

-- CreateIndex
CREATE INDEX "house_lords_lord_planet_idx" ON "house_lords"("lord_planet");

-- CreateIndex
CREATE INDEX "house_lords_status_deleted_at_idx" ON "house_lords"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "house_lords_chart_id_house_number_key" ON "house_lords"("chart_id", "house_number");

-- CreateIndex
CREATE INDEX "nakshatra_placements_nakshatra_pada_idx" ON "nakshatra_placements"("nakshatra", "pada");

-- CreateIndex
CREATE INDEX "nakshatra_placements_status_deleted_at_idx" ON "nakshatra_placements"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "nakshatra_placements_chart_id_planet_key" ON "nakshatra_placements"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "pada_placements_status_deleted_at_idx" ON "pada_placements"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "pada_placements_chart_id_planet_key" ON "pada_placements"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "sign_placements_sign_idx" ON "sign_placements"("sign");

-- CreateIndex
CREATE INDEX "sign_placements_status_deleted_at_idx" ON "sign_placements"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "sign_placements_chart_id_planet_key" ON "sign_placements"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "planet_strengths_status_deleted_at_idx" ON "planet_strengths"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "planet_strengths_chart_id_planet_key" ON "planet_strengths"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "shadbala_status_deleted_at_idx" ON "shadbala"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "shadbala_chart_id_planet_key" ON "shadbala"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "exaltations_status_deleted_at_idx" ON "exaltations"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "exaltations_chart_id_planet_key" ON "exaltations"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "debilitations_status_deleted_at_idx" ON "debilitations"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "debilitations_chart_id_planet_key" ON "debilitations"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "combustions_status_deleted_at_idx" ON "combustions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "combustions_chart_id_planet_key" ON "combustions"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "retrogrades_status_deleted_at_idx" ON "retrogrades"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "retrogrades_chart_id_planet_key" ON "retrogrades"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "conjunctions_chart_id_planet_a_planet_b_idx" ON "conjunctions"("chart_id", "planet_a", "planet_b");

-- CreateIndex
CREATE INDEX "conjunctions_status_deleted_at_idx" ON "conjunctions"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "aspects_chart_id_from_planet_to_planet_idx" ON "aspects"("chart_id", "from_planet", "to_planet");

-- CreateIndex
CREATE INDEX "aspects_status_deleted_at_idx" ON "aspects"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "planetary_yogas_chart_id_yoga_code_idx" ON "planetary_yogas"("chart_id", "yoga_code");

-- CreateIndex
CREATE INDEX "planetary_yogas_status_deleted_at_idx" ON "planetary_yogas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "raj_yogas_chart_id_idx" ON "raj_yogas"("chart_id");

-- CreateIndex
CREATE INDEX "raj_yogas_status_deleted_at_idx" ON "raj_yogas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "dhana_yogas_chart_id_idx" ON "dhana_yogas"("chart_id");

-- CreateIndex
CREATE INDEX "dhana_yogas_status_deleted_at_idx" ON "dhana_yogas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "vipreet_raj_yogas_chart_id_subtype_idx" ON "vipreet_raj_yogas"("chart_id", "subtype");

-- CreateIndex
CREATE INDEX "vipreet_raj_yogas_status_deleted_at_idx" ON "vipreet_raj_yogas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "neecha_bhanga_status_deleted_at_idx" ON "neecha_bhanga"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "neecha_bhanga_chart_id_planet_key" ON "neecha_bhanga"("chart_id", "planet");

-- CreateIndex
CREATE INDEX "doshas_chart_id_dosha_code_idx" ON "doshas"("chart_id", "dosha_code");

-- CreateIndex
CREATE INDEX "doshas_status_deleted_at_idx" ON "doshas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "manglik_doshas_chart_id_key" ON "manglik_doshas"("chart_id");

-- CreateIndex
CREATE INDEX "manglik_doshas_is_manglik_idx" ON "manglik_doshas"("is_manglik");

-- CreateIndex
CREATE INDEX "manglik_doshas_status_deleted_at_idx" ON "manglik_doshas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "kaal_sarp_doshas_chart_id_key" ON "kaal_sarp_doshas"("chart_id");

-- CreateIndex
CREATE INDEX "kaal_sarp_doshas_status_deleted_at_idx" ON "kaal_sarp_doshas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "pitru_doshas_chart_id_key" ON "pitru_doshas"("chart_id");

-- CreateIndex
CREATE INDEX "pitru_doshas_status_deleted_at_idx" ON "pitru_doshas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "nadi_attributes_chart_id_key" ON "nadi_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "nadi_attributes_status_deleted_at_idx" ON "nadi_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "bhakoot_attributes_chart_id_key" ON "bhakoot_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "bhakoot_attributes_status_deleted_at_idx" ON "bhakoot_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "yoni_attributes_chart_id_key" ON "yoni_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "yoni_attributes_status_deleted_at_idx" ON "yoni_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "varna_attributes_chart_id_key" ON "varna_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "varna_attributes_status_deleted_at_idx" ON "varna_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "vashya_attributes_chart_id_key" ON "vashya_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "vashya_attributes_status_deleted_at_idx" ON "vashya_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "tara_attributes_chart_id_key" ON "tara_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "tara_attributes_status_deleted_at_idx" ON "tara_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "gana_attributes_chart_id_key" ON "gana_attributes"("chart_id");

-- CreateIndex
CREATE INDEX "gana_attributes_status_deleted_at_idx" ON "gana_attributes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "navamsa_charts_chart_id_key" ON "navamsa_charts"("chart_id");

-- CreateIndex
CREATE INDEX "navamsa_charts_status_deleted_at_idx" ON "navamsa_charts"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "dashamsa_charts_chart_id_key" ON "dashamsa_charts"("chart_id");

-- CreateIndex
CREATE INDEX "dashamsa_charts_status_deleted_at_idx" ON "dashamsa_charts"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "moon_chart_details_chart_id_key" ON "moon_chart_details"("chart_id");

-- CreateIndex
CREATE INDEX "moon_chart_details_status_deleted_at_idx" ON "moon_chart_details"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "kp_data_chart_id_key" ON "kp_data"("chart_id");

-- CreateIndex
CREATE INDEX "kp_data_status_deleted_at_idx" ON "kp_data"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "jaimini_data_chart_id_key" ON "jaimini_data"("chart_id");

-- CreateIndex
CREATE INDEX "jaimini_data_status_deleted_at_idx" ON "jaimini_data"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "upapada_lagnas_chart_id_key" ON "upapada_lagnas"("chart_id");

-- CreateIndex
CREATE INDEX "upapada_lagnas_status_deleted_at_idx" ON "upapada_lagnas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "darakarakas_chart_id_key" ON "darakarakas"("chart_id");

-- CreateIndex
CREATE INDEX "darakarakas_status_deleted_at_idx" ON "darakarakas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "atmakarakas_chart_id_key" ON "atmakarakas"("chart_id");

-- CreateIndex
CREATE INDEX "atmakarakas_status_deleted_at_idx" ON "atmakarakas"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "karakamsas_chart_id_key" ON "karakamsas"("chart_id");

-- CreateIndex
CREATE INDEX "karakamsas_status_deleted_at_idx" ON "karakamsas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "dasha_timelines_user_id_system_idx" ON "dasha_timelines"("user_id", "system");

-- CreateIndex
CREATE INDEX "dasha_timelines_status_deleted_at_idx" ON "dasha_timelines"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "dasha_periods_timeline_id_level_start_at_idx" ON "dasha_periods"("timeline_id", "level", "start_at");

-- CreateIndex
CREATE INDEX "dasha_periods_parent_period_id_idx" ON "dasha_periods"("parent_period_id");

-- CreateIndex
CREATE INDEX "dasha_periods_lord_start_at_end_at_idx" ON "dasha_periods"("lord", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "dasha_periods_status_deleted_at_idx" ON "dasha_periods"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "current_dashas_timeline_id_key" ON "current_dashas"("timeline_id");

-- CreateIndex
CREATE INDEX "current_dashas_status_deleted_at_idx" ON "current_dashas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "future_dashas_timeline_id_start_at_idx" ON "future_dashas"("timeline_id", "start_at");

-- CreateIndex
CREATE INDEX "future_dashas_status_deleted_at_idx" ON "future_dashas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "previous_dashas_timeline_id_end_at_idx" ON "previous_dashas"("timeline_id", "end_at");

-- CreateIndex
CREATE INDEX "previous_dashas_status_deleted_at_idx" ON "previous_dashas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "dasha_windows_user_id_window_type_start_at_idx" ON "dasha_windows"("user_id", "window_type", "start_at");

-- CreateIndex
CREATE INDEX "dasha_windows_window_type_start_at_end_at_idx" ON "dasha_windows"("window_type", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "dasha_windows_status_deleted_at_idx" ON "dasha_windows"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "compatibility_reports_overall_match_score_idx" ON "compatibility_reports"("overall_match_score");

-- CreateIndex
CREATE INDEX "compatibility_reports_ai_match_score_idx" ON "compatibility_reports"("ai_match_score");

-- CreateIndex
CREATE INDEX "compatibility_reports_user_b_id_overall_match_score_idx" ON "compatibility_reports"("user_b_id", "overall_match_score");

-- CreateIndex
CREATE INDEX "compatibility_reports_status_deleted_at_idx" ON "compatibility_reports"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "compatibility_reports_user_a_id_user_b_id_key" ON "compatibility_reports"("user_a_id", "user_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "ashta_koota_scores_report_id_key" ON "ashta_koota_scores"("report_id");

-- CreateIndex
CREATE INDEX "ashta_koota_scores_total_idx" ON "ashta_koota_scores"("total");

-- CreateIndex
CREATE INDEX "ashta_koota_scores_status_deleted_at_idx" ON "ashta_koota_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "planet_matching_scores_report_id_key" ON "planet_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "planet_matching_scores_status_deleted_at_idx" ON "planet_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "navamsa_matching_scores_report_id_key" ON "navamsa_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "navamsa_matching_scores_status_deleted_at_idx" ON "navamsa_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "moon_matching_scores_report_id_key" ON "moon_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "moon_matching_scores_status_deleted_at_idx" ON "moon_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "venus_matching_scores_report_id_key" ON "venus_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "venus_matching_scores_status_deleted_at_idx" ON "venus_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "mars_matching_scores_report_id_key" ON "mars_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "mars_matching_scores_status_deleted_at_idx" ON "mars_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "seventh_house_matching_scores_report_id_key" ON "seventh_house_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "seventh_house_matching_scores_status_deleted_at_idx" ON "seventh_house_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "dasha_matching_scores_report_id_key" ON "dasha_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "dasha_matching_scores_status_deleted_at_idx" ON "dasha_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "transit_matching_scores_report_id_key" ON "transit_matching_scores"("report_id");

-- CreateIndex
CREATE INDEX "transit_matching_scores_status_deleted_at_idx" ON "transit_matching_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "emotional_compatibility_scores_report_id_key" ON "emotional_compatibility_scores"("report_id");

-- CreateIndex
CREATE INDEX "emotional_compatibility_scores_status_deleted_at_idx" ON "emotional_compatibility_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "communication_compatibility_scores_report_id_key" ON "communication_compatibility_scores"("report_id");

-- CreateIndex
CREATE INDEX "communication_compatibility_scores_status_deleted_at_idx" ON "communication_compatibility_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "finance_compatibility_scores_report_id_key" ON "finance_compatibility_scores"("report_id");

-- CreateIndex
CREATE INDEX "finance_compatibility_scores_status_deleted_at_idx" ON "finance_compatibility_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "children_compatibility_scores_report_id_key" ON "children_compatibility_scores"("report_id");

-- CreateIndex
CREATE INDEX "children_compatibility_scores_status_deleted_at_idx" ON "children_compatibility_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "career_compatibility_scores_report_id_key" ON "career_compatibility_scores"("report_id");

-- CreateIndex
CREATE INDEX "career_compatibility_scores_status_deleted_at_idx" ON "career_compatibility_scores"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "spiritual_compatibility_scores_report_id_key" ON "spiritual_compatibility_scores"("report_id");

-- CreateIndex
CREATE INDEX "spiritual_compatibility_scores_status_deleted_at_idx" ON "spiritual_compatibility_scores"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "conflict_indicators_report_id_severity_idx" ON "conflict_indicators"("report_id", "severity");

-- CreateIndex
CREATE INDEX "conflict_indicators_status_deleted_at_idx" ON "conflict_indicators"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "ai_reports_user_id_report_type_created_at_idx" ON "ai_reports"("user_id", "report_type", "created_at");

-- CreateIndex
CREATE INDEX "ai_reports_status_deleted_at_idx" ON "ai_reports"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "ai_prompt_history_user_id_created_at_idx" ON "ai_prompt_history"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_prompt_history_purpose_created_at_idx" ON "ai_prompt_history"("purpose", "created_at");

-- CreateIndex
CREATE INDEX "ai_prompt_history_status_deleted_at_idx" ON "ai_prompt_history"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "generated_ai_reports_status_deleted_at_idx" ON "generated_ai_reports"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "generated_ai_reports_ai_report_id_version_key" ON "generated_ai_reports"("ai_report_id", "version");

-- CreateIndex
CREATE INDEX "ai_recommendations_user_id_score_idx" ON "ai_recommendations"("user_id", "score");

-- CreateIndex
CREATE INDEX "ai_recommendations_recommended_user_id_idx" ON "ai_recommendations"("recommended_user_id");

-- CreateIndex
CREATE INDEX "ai_recommendations_status_deleted_at_idx" ON "ai_recommendations"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_explanation_cache_cache_key_key" ON "ai_explanation_cache"("cache_key");

-- CreateIndex
CREATE INDEX "ai_explanation_cache_expires_at_idx" ON "ai_explanation_cache"("expires_at");

-- CreateIndex
CREATE INDEX "ai_explanation_cache_status_deleted_at_idx" ON "ai_explanation_cache"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "ai_embeddings_user_id_source_idx" ON "ai_embeddings"("user_id", "source");

-- CreateIndex
CREATE INDEX "ai_embeddings_content_hash_idx" ON "ai_embeddings"("content_hash");

-- CreateIndex
CREATE INDEX "ai_embeddings_status_deleted_at_idx" ON "ai_embeddings"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_embeddings_source_source_ref_id_model_key" ON "ai_embeddings"("source", "source_ref_id", "model");

-- CreateIndex
CREATE INDEX "ai_memories_status_deleted_at_idx" ON "ai_memories"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_memories_user_id_memory_key_key" ON "ai_memories"("user_id", "memory_key");

-- CreateIndex
CREATE INDEX "ai_conversation_contexts_last_message_at_idx" ON "ai_conversation_contexts"("last_message_at");

-- CreateIndex
CREATE INDEX "ai_conversation_contexts_status_deleted_at_idx" ON "ai_conversation_contexts"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_conversation_contexts_user_id_session_key_key" ON "ai_conversation_contexts"("user_id", "session_key");

-- CreateIndex
CREATE INDEX "ai_token_usages_user_id_created_at_idx" ON "ai_token_usages"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_token_usages_provider_model_created_at_idx" ON "ai_token_usages"("provider", "model", "created_at");

-- CreateIndex
CREATE INDEX "ai_token_usages_status_deleted_at_idx" ON "ai_token_usages"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "likes_liked_id_created_at_idx" ON "likes"("liked_id", "created_at");

-- CreateIndex
CREATE INDEX "likes_status_deleted_at_idx" ON "likes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "likes_liker_id_liked_id_key" ON "likes"("liker_id", "liked_id");

-- CreateIndex
CREATE INDEX "interests_to_user_id_created_at_idx" ON "interests"("to_user_id", "created_at");

-- CreateIndex
CREATE INDEX "interests_status_deleted_at_idx" ON "interests"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "interests_from_user_id_to_user_id_key" ON "interests"("from_user_id", "to_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mutual_matches_conversation_id_key" ON "mutual_matches"("conversation_id");

-- CreateIndex
CREATE INDEX "mutual_matches_matched_at_idx" ON "mutual_matches"("matched_at");

-- CreateIndex
CREATE INDEX "mutual_matches_status_deleted_at_idx" ON "mutual_matches"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "mutual_matches_user_a_id_user_b_id_key" ON "mutual_matches"("user_a_id", "user_b_id");

-- CreateIndex
CREATE INDEX "connection_requests_to_user_id_match_status_idx" ON "connection_requests"("to_user_id", "match_status");

-- CreateIndex
CREATE INDEX "connection_requests_status_deleted_at_idx" ON "connection_requests"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "connection_requests_from_user_id_to_user_id_key" ON "connection_requests"("from_user_id", "to_user_id");

-- CreateIndex
CREATE INDEX "accepted_matches_accepted_at_idx" ON "accepted_matches"("accepted_at");

-- CreateIndex
CREATE INDEX "accepted_matches_status_deleted_at_idx" ON "accepted_matches"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "accepted_matches_user_a_id_user_b_id_key" ON "accepted_matches"("user_a_id", "user_b_id");

-- CreateIndex
CREATE INDEX "rejected_matches_rejected_id_idx" ON "rejected_matches"("rejected_id");

-- CreateIndex
CREATE INDEX "rejected_matches_status_deleted_at_idx" ON "rejected_matches"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "rejected_matches_rejector_id_rejected_id_key" ON "rejected_matches"("rejector_id", "rejected_id");

-- CreateIndex
CREATE INDEX "blocked_matches_blocked_id_idx" ON "blocked_matches"("blocked_id");

-- CreateIndex
CREATE INDEX "blocked_matches_status_deleted_at_idx" ON "blocked_matches"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_matches_blocker_id_blocked_id_key" ON "blocked_matches"("blocker_id", "blocked_id");

-- CreateIndex
CREATE INDEX "match_recommendations_user_id_score_idx" ON "match_recommendations"("user_id", "score");

-- CreateIndex
CREATE INDEX "match_recommendations_candidate_user_id_idx" ON "match_recommendations"("candidate_user_id");

-- CreateIndex
CREATE INDEX "match_recommendations_status_deleted_at_idx" ON "match_recommendations"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "match_recommendations_user_id_candidate_user_id_algorithm_v_key" ON "match_recommendations"("user_id", "candidate_user_id", "algorithm_version");

-- CreateIndex
CREATE INDEX "conversations_last_message_at_idx" ON "conversations"("last_message_at");

-- CreateIndex
CREATE INDEX "conversations_status_deleted_at_idx" ON "conversations"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_last_read_at_idx" ON "conversation_participants"("user_id", "last_read_at");

-- CreateIndex
CREATE INDEX "conversation_participants_status_deleted_at_idx" ON "conversation_participants"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_created_at_idx" ON "messages"("sender_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_message_status_idx" ON "messages"("message_status");

-- CreateIndex
CREATE INDEX "messages_status_deleted_at_idx" ON "messages"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "messages_conversation_id_client_message_id_key" ON "messages"("conversation_id", "client_message_id");

-- CreateIndex
CREATE INDEX "read_receipts_user_id_read_at_idx" ON "read_receipts"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "read_receipts_status_deleted_at_idx" ON "read_receipts"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "read_receipts_message_id_user_id_key" ON "read_receipts"("message_id", "user_id");

-- CreateIndex
CREATE INDEX "message_attachments_message_id_idx" ON "message_attachments"("message_id");

-- CreateIndex
CREATE INDEX "message_attachments_status_deleted_at_idx" ON "message_attachments"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "voice_notes_message_id_key" ON "voice_notes"("message_id");

-- CreateIndex
CREATE INDEX "voice_notes_status_deleted_at_idx" ON "voice_notes"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "video_calls_conversation_id_created_at_idx" ON "video_calls"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "video_calls_call_status_idx" ON "video_calls"("call_status");

-- CreateIndex
CREATE INDEX "video_calls_status_deleted_at_idx" ON "video_calls"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "call_history_user_id_happened_at_idx" ON "call_history"("user_id", "happened_at");

-- CreateIndex
CREATE INDEX "call_history_conversation_id_happened_at_idx" ON "call_history"("conversation_id", "happened_at");

-- CreateIndex
CREATE INDEX "call_history_status_deleted_at_idx" ON "call_history"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "deleted_messages_status_deleted_at_idx" ON "deleted_messages"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "deleted_messages_message_id_user_id_key" ON "deleted_messages"("message_id", "user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "notifications_type_channel_created_at_idx" ON "notifications"("type", "channel", "created_at");

-- CreateIndex
CREATE INDEX "notifications_status_deleted_at_idx" ON "notifications"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "notification_preferences_status_deleted_at_idx" ON "notification_preferences"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_type_channel_key" ON "notification_preferences"("user_id", "type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_code_key" ON "notification_templates"("code");

-- CreateIndex
CREATE INDEX "notification_templates_type_channel_idx" ON "notification_templates"("type", "channel");

-- CreateIndex
CREATE INDEX "notification_templates_status_deleted_at_idx" ON "notification_templates"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "notification_logs_channel_created_at_idx" ON "notification_logs"("channel", "created_at");

-- CreateIndex
CREATE INDEX "notification_logs_delivery_status_created_at_idx" ON "notification_logs"("delivery_status", "created_at");

-- CreateIndex
CREATE INDEX "notification_logs_status_deleted_at_idx" ON "notification_logs"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE INDEX "plans_status_deleted_at_idx" ON "plans"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_ends_at_idx" ON "subscriptions"("user_id", "ends_at");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_payment_status_idx" ON "subscriptions"("plan_id", "payment_status");

-- CreateIndex
CREATE INDEX "subscriptions_status_deleted_at_idx" ON "subscriptions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_user_id_issued_at_idx" ON "invoices"("user_id", "issued_at");

-- CreateIndex
CREATE INDEX "invoices_payment_status_idx" ON "invoices"("payment_status");

-- CreateIndex
CREATE INDEX "invoices_status_deleted_at_idx" ON "invoices"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "payment_transactions_user_id_created_at_idx" ON "payment_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_provider_provider_payment_id_idx" ON "payment_transactions"("provider", "provider_payment_id");

-- CreateIndex
CREATE INDEX "payment_transactions_payment_status_created_at_idx" ON "payment_transactions"("payment_status", "created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_status_deleted_at_idx" ON "payment_transactions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_ends_at_idx" ON "coupons"("ends_at");

-- CreateIndex
CREATE INDEX "coupons_status_deleted_at_idx" ON "coupons"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_coupon_id_idx" ON "promo_codes"("coupon_id");

-- CreateIndex
CREATE INDEX "promo_codes_status_deleted_at_idx" ON "promo_codes"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_status_deleted_at_idx" ON "wallets"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "wallet_ledger_wallet_id_created_at_idx" ON "wallet_ledger"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "wallet_ledger_status_deleted_at_idx" ON "wallet_ledger"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "refunds_user_id_created_at_idx" ON "refunds"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "refunds_payment_status_idx" ON "refunds"("payment_status");

-- CreateIndex
CREATE INDEX "refunds_status_deleted_at_idx" ON "refunds"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "razorpay_orders_razorpay_order_id_key" ON "razorpay_orders"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "razorpay_orders_user_id_created_at_idx" ON "razorpay_orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "razorpay_orders_payment_status_idx" ON "razorpay_orders"("payment_status");

-- CreateIndex
CREATE INDEX "razorpay_orders_status_deleted_at_idx" ON "razorpay_orders"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_stripe_payment_intent_id_key" ON "stripe_payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "stripe_payments_user_id_created_at_idx" ON "stripe_payments"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "stripe_payments_payment_status_idx" ON "stripe_payments"("payment_status");

-- CreateIndex
CREATE INDEX "stripe_payments_status_deleted_at_idx" ON "stripe_payments"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "generated_reports_user_id_report_kind_created_at_idx" ON "generated_reports"("user_id", "report_kind", "created_at");

-- CreateIndex
CREATE INDEX "generated_reports_report_status_idx" ON "generated_reports"("report_status");

-- CreateIndex
CREATE INDEX "generated_reports_status_deleted_at_idx" ON "generated_reports"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "report_downloads_report_id_downloaded_at_idx" ON "report_downloads"("report_id", "downloaded_at");

-- CreateIndex
CREATE INDEX "report_downloads_user_id_downloaded_at_idx" ON "report_downloads"("user_id", "downloaded_at");

-- CreateIndex
CREATE INDEX "report_downloads_status_deleted_at_idx" ON "report_downloads"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "astrologers_user_id_key" ON "astrologers"("user_id");

-- CreateIndex
CREATE INDEX "astrologers_is_verified_rating_avg_idx" ON "astrologers"("is_verified", "rating_avg");

-- CreateIndex
CREATE INDEX "astrologers_status_deleted_at_idx" ON "astrologers"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "astrologer_availability_status_deleted_at_idx" ON "astrologer_availability"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "astrologer_availability_astrologer_id_day_of_week_start_tim_key" ON "astrologer_availability"("astrologer_id", "day_of_week", "start_time_utc", "end_time_utc");

-- CreateIndex
CREATE INDEX "consultation_bookings_client_id_scheduled_start_idx" ON "consultation_bookings"("client_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "consultation_bookings_astrologer_id_scheduled_start_idx" ON "consultation_bookings"("astrologer_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "consultation_bookings_booking_status_idx" ON "consultation_bookings"("booking_status");

-- CreateIndex
CREATE INDEX "consultation_bookings_status_deleted_at_idx" ON "consultation_bookings"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_meetings_booking_id_key" ON "consultation_meetings"("booking_id");

-- CreateIndex
CREATE INDEX "consultation_meetings_status_deleted_at_idx" ON "consultation_meetings"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_reviews_booking_id_key" ON "consultation_reviews"("booking_id");

-- CreateIndex
CREATE INDEX "consultation_reviews_astrologer_id_rating_idx" ON "consultation_reviews"("astrologer_id", "rating");

-- CreateIndex
CREATE INDEX "consultation_reviews_status_deleted_at_idx" ON "consultation_reviews"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_payments_booking_id_key" ON "consultation_payments"("booking_id");

-- CreateIndex
CREATE INDEX "consultation_payments_payment_status_idx" ON "consultation_payments"("payment_status");

-- CreateIndex
CREATE INDEX "consultation_payments_status_deleted_at_idx" ON "consultation_payments"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_status_deleted_at_idx" ON "blog_categories"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_slug_key" ON "blog_tags"("slug");

-- CreateIndex
CREATE INDEX "blog_tags_status_deleted_at_idx" ON "blog_tags"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_content_status_published_at_idx" ON "blog_posts"("content_status", "published_at");

-- CreateIndex
CREATE INDEX "blog_posts_author_id_idx" ON "blog_posts"("author_id");

-- CreateIndex
CREATE INDEX "blog_posts_status_deleted_at_idx" ON "blog_posts"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "blog_post_categories_status_deleted_at_idx" ON "blog_post_categories"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_categories_post_id_category_id_key" ON "blog_post_categories"("post_id", "category_id");

-- CreateIndex
CREATE INDEX "blog_post_tags_status_deleted_at_idx" ON "blog_post_tags"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_tags_post_id_tag_id_key" ON "blog_post_tags"("post_id", "tag_id");

-- CreateIndex
CREATE INDEX "blog_comments_post_id_created_at_idx" ON "blog_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "blog_comments_status_deleted_at_idx" ON "blog_comments"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "faq_items_category_sort_order_idx" ON "faq_items"("category", "sort_order");

-- CreateIndex
CREATE INDEX "faq_items_status_deleted_at_idx" ON "faq_items"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "testimonials_content_status_sort_order_idx" ON "testimonials"("content_status", "sort_order");

-- CreateIndex
CREATE INDEX "testimonials_status_deleted_at_idx" ON "testimonials"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "success_stories_content_status_created_at_idx" ON "success_stories"("content_status", "created_at");

-- CreateIndex
CREATE INDEX "success_stories_status_deleted_at_idx" ON "success_stories"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_id_key" ON "admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_employee_code_key" ON "admins"("employee_code");

-- CreateIndex
CREATE INDEX "admins_status_deleted_at_idx" ON "admins"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_status_deleted_at_idx" ON "audit_logs"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_occurred_at_idx" ON "activity_logs"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "activity_logs_event_name_occurred_at_idx" ON "activity_logs"("event_name", "occurred_at");

-- CreateIndex
CREATE INDEX "activity_logs_status_deleted_at_idx" ON "activity_logs"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "permission_logs_actor_user_id_created_at_idx" ON "permission_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "permission_logs_target_user_id_created_at_idx" ON "permission_logs"("target_user_id", "created_at");

-- CreateIndex
CREATE INDEX "permission_logs_status_deleted_at_idx" ON "permission_logs"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- CreateIndex
CREATE INDEX "app_settings_status_deleted_at_idx" ON "app_settings"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags"("enabled");

-- CreateIndex
CREATE INDEX "feature_flags_status_deleted_at_idx" ON "feature_flags"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "announcements_starts_at_ends_at_idx" ON "announcements"("starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "announcements_status_deleted_at_idx" ON "announcements"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_pages_content_status_published_at_idx" ON "cms_pages"("content_status", "published_at");

-- CreateIndex
CREATE INDEX "cms_pages_status_deleted_at_idx" ON "cms_pages"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "analytics_daily_active_users_status_deleted_at_idx" ON "analytics_daily_active_users"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_daily_active_users_metric_date_key" ON "analytics_daily_active_users"("metric_date");

-- CreateIndex
CREATE INDEX "analytics_revenue_status_deleted_at_idx" ON "analytics_revenue"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_revenue_metric_date_currency_key" ON "analytics_revenue"("metric_date", "currency");

-- CreateIndex
CREATE INDEX "analytics_subscriptions_status_deleted_at_idx" ON "analytics_subscriptions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_subscriptions_metric_date_plan_code_key" ON "analytics_subscriptions"("metric_date", "plan_code");

-- CreateIndex
CREATE INDEX "analytics_retention_status_deleted_at_idx" ON "analytics_retention"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_retention_cohort_date_day_n_key" ON "analytics_retention"("cohort_date", "day_n");

-- CreateIndex
CREATE INDEX "analytics_conversions_status_deleted_at_idx" ON "analytics_conversions"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_conversions_metric_date_funnel_name_step_name_key" ON "analytics_conversions"("metric_date", "funnel_name", "step_name");

-- CreateIndex
CREATE INDEX "analytics_compatibility_success_status_deleted_at_idx" ON "analytics_compatibility_success"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_compatibility_success_metric_date_key" ON "analytics_compatibility_success"("metric_date");

-- CreateIndex
CREATE INDEX "analytics_ai_usage_status_deleted_at_idx" ON "analytics_ai_usage"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_ai_usage_metric_date_provider_model_key" ON "analytics_ai_usage"("metric_date", "provider", "model");

-- CreateIndex
CREATE INDEX "analytics_chat_usage_status_deleted_at_idx" ON "analytics_chat_usage"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_chat_usage_metric_date_key" ON "analytics_chat_usage"("metric_date");

-- CreateIndex
CREATE INDEX "analytics_payments_status_deleted_at_idx" ON "analytics_payments"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_payments_metric_date_provider_key" ON "analytics_payments"("metric_date", "provider");

-- CreateIndex
CREATE INDEX "analytics_report_usage_status_deleted_at_idx" ON "analytics_report_usage"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_report_usage_metric_date_report_kind_key" ON "analytics_report_usage"("metric_date", "report_kind");

-- CreateIndex
CREATE INDEX "mahadashas_timeline_id_start_at_idx" ON "mahadashas"("timeline_id", "start_at");

-- CreateIndex
CREATE INDEX "mahadashas_lord_idx" ON "mahadashas"("lord");

-- CreateIndex
CREATE INDEX "mahadashas_status_deleted_at_idx" ON "mahadashas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "antardashas_mahadasha_id_start_at_idx" ON "antardashas"("mahadasha_id", "start_at");

-- CreateIndex
CREATE INDEX "antardashas_status_deleted_at_idx" ON "antardashas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "pratyantar_dashas_antardasha_id_start_at_idx" ON "pratyantar_dashas"("antardasha_id", "start_at");

-- CreateIndex
CREATE INDEX "pratyantar_dashas_status_deleted_at_idx" ON "pratyantar_dashas"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "marriage_timing_windows_user_id_start_at_idx" ON "marriage_timing_windows"("user_id", "start_at");

-- CreateIndex
CREATE INDEX "marriage_timing_windows_status_deleted_at_idx" ON "marriage_timing_windows"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "career_timing_windows_user_id_start_at_idx" ON "career_timing_windows"("user_id", "start_at");

-- CreateIndex
CREATE INDEX "career_timing_windows_status_deleted_at_idx" ON "career_timing_windows"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "education_timing_windows_user_id_start_at_idx" ON "education_timing_windows"("user_id", "start_at");

-- CreateIndex
CREATE INDEX "education_timing_windows_status_deleted_at_idx" ON "education_timing_windows"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "foreign_settlement_windows_user_id_start_at_idx" ON "foreign_settlement_windows"("user_id", "start_at");

-- CreateIndex
CREATE INDEX "foreign_settlement_windows_status_deleted_at_idx" ON "foreign_settlement_windows"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "horoscope_pdf_reports_user_id_created_at_idx" ON "horoscope_pdf_reports"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "horoscope_pdf_reports_status_deleted_at_idx" ON "horoscope_pdf_reports"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "compatibility_pdf_reports_user_id_created_at_idx" ON "compatibility_pdf_reports"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "compatibility_pdf_reports_status_deleted_at_idx" ON "compatibility_pdf_reports"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "marriage_timing_pdf_reports_user_id_created_at_idx" ON "marriage_timing_pdf_reports"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "marriage_timing_pdf_reports_status_deleted_at_idx" ON "marriage_timing_pdf_reports"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "ai_summary_pdf_reports_user_id_created_at_idx" ON "ai_summary_pdf_reports"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_summary_pdf_reports_status_deleted_at_idx" ON "ai_summary_pdf_reports"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "push_notifications_user_id_created_at_idx" ON "push_notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "push_notifications_status_deleted_at_idx" ON "push_notifications"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "email_notifications_to_email_created_at_idx" ON "email_notifications"("to_email", "created_at");

-- CreateIndex
CREATE INDEX "email_notifications_status_deleted_at_idx" ON "email_notifications"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "sms_notifications_to_phone_created_at_idx" ON "sms_notifications"("to_phone", "created_at");

-- CreateIndex
CREATE INDEX "sms_notifications_status_deleted_at_idx" ON "sms_notifications"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "in_app_notifications_user_id_read_at_created_at_idx" ON "in_app_notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "in_app_notifications_status_deleted_at_idx" ON "in_app_notifications"("status", "deleted_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_logins" ADD CONSTRAINT "social_logins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "app_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_states" ADD CONSTRAINT "geo_states_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "geo_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_cities" ADD CONSTRAINT "geo_cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "geo_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_cities" ADD CONSTRAINT "geo_cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "geo_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_bios" ADD CONSTRAINT "profile_bios_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_preferences" ADD CONSTRAINT "partner_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careers" ADD CONSTRAINT "careers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifestyles" ADD CONSTRAINT "lifestyles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "religion_profiles" ADD CONSTRAINT "religion_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_profiles" ADD CONSTRAINT "community_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_hobbies" ADD CONSTRAINT "user_hobbies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "geo_countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "geo_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "geo_cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reported_users" ADD CONSTRAINT "reported_users_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reported_users" ADD CONSTRAINT "reported_users_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_profiles" ADD CONSTRAINT "saved_profiles_saver_id_fkey" FOREIGN KEY ("saver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_profiles" ADD CONSTRAINT "saved_profiles_saved_id_fkey" FOREIGN KEY ("saved_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_profiles" ADD CONSTRAINT "recently_viewed_profiles_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_profiles" ADD CONSTRAINT "recently_viewed_profiles_viewed_id_fkey" FOREIGN KEY ("viewed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlisted_profiles" ADD CONSTRAINT "shortlisted_profiles_shortlister_id_fkey" FOREIGN KEY ("shortlister_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlisted_profiles" ADD CONSTRAINT "shortlisted_profiles_shortlisted_id_fkey" FOREIGN KEY ("shortlisted_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birth_details" ADD CONSTRAINT "birth_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birth_details" ADD CONSTRAINT "birth_details_geo_city_id_fkey" FOREIGN KEY ("geo_city_id") REFERENCES "geo_cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horoscope_charts" ADD CONSTRAINT "horoscope_charts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planet_positions" ADD CONSTRAINT "planet_positions_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planet_degrees" ADD CONSTRAINT "planet_degrees_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_cusps" ADD CONSTRAINT "house_cusps_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house_lords" ADD CONSTRAINT "house_lords_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nakshatra_placements" ADD CONSTRAINT "nakshatra_placements_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pada_placements" ADD CONSTRAINT "pada_placements_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sign_placements" ADD CONSTRAINT "sign_placements_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planet_strengths" ADD CONSTRAINT "planet_strengths_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadbala" ADD CONSTRAINT "shadbala_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exaltations" ADD CONSTRAINT "exaltations_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debilitations" ADD CONSTRAINT "debilitations_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combustions" ADD CONSTRAINT "combustions_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrogrades" ADD CONSTRAINT "retrogrades_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjunctions" ADD CONSTRAINT "conjunctions_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspects" ADD CONSTRAINT "aspects_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planetary_yogas" ADD CONSTRAINT "planetary_yogas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raj_yogas" ADD CONSTRAINT "raj_yogas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dhana_yogas" ADD CONSTRAINT "dhana_yogas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vipreet_raj_yogas" ADD CONSTRAINT "vipreet_raj_yogas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neecha_bhanga" ADD CONSTRAINT "neecha_bhanga_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doshas" ADD CONSTRAINT "doshas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manglik_doshas" ADD CONSTRAINT "manglik_doshas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaal_sarp_doshas" ADD CONSTRAINT "kaal_sarp_doshas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pitru_doshas" ADD CONSTRAINT "pitru_doshas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nadi_attributes" ADD CONSTRAINT "nadi_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bhakoot_attributes" ADD CONSTRAINT "bhakoot_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yoni_attributes" ADD CONSTRAINT "yoni_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "varna_attributes" ADD CONSTRAINT "varna_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vashya_attributes" ADD CONSTRAINT "vashya_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tara_attributes" ADD CONSTRAINT "tara_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gana_attributes" ADD CONSTRAINT "gana_attributes_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navamsa_charts" ADD CONSTRAINT "navamsa_charts_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashamsa_charts" ADD CONSTRAINT "dashamsa_charts_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moon_chart_details" ADD CONSTRAINT "moon_chart_details_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kp_data" ADD CONSTRAINT "kp_data_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jaimini_data" ADD CONSTRAINT "jaimini_data_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upapada_lagnas" ADD CONSTRAINT "upapada_lagnas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "darakarakas" ADD CONSTRAINT "darakarakas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atmakarakas" ADD CONSTRAINT "atmakarakas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karakamsas" ADD CONSTRAINT "karakamsas_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "horoscope_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dasha_timelines" ADD CONSTRAINT "dasha_timelines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dasha_periods" ADD CONSTRAINT "dasha_periods_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "dasha_timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dasha_periods" ADD CONSTRAINT "dasha_periods_parent_period_id_fkey" FOREIGN KEY ("parent_period_id") REFERENCES "dasha_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_dashas" ADD CONSTRAINT "current_dashas_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "dasha_timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "future_dashas" ADD CONSTRAINT "future_dashas_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "dasha_timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "previous_dashas" ADD CONSTRAINT "previous_dashas_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "dasha_timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dasha_windows" ADD CONSTRAINT "dasha_windows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility_reports" ADD CONSTRAINT "compatibility_reports_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility_reports" ADD CONSTRAINT "compatibility_reports_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ashta_koota_scores" ADD CONSTRAINT "ashta_koota_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planet_matching_scores" ADD CONSTRAINT "planet_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navamsa_matching_scores" ADD CONSTRAINT "navamsa_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moon_matching_scores" ADD CONSTRAINT "moon_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venus_matching_scores" ADD CONSTRAINT "venus_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mars_matching_scores" ADD CONSTRAINT "mars_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seventh_house_matching_scores" ADD CONSTRAINT "seventh_house_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dasha_matching_scores" ADD CONSTRAINT "dasha_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transit_matching_scores" ADD CONSTRAINT "transit_matching_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotional_compatibility_scores" ADD CONSTRAINT "emotional_compatibility_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_compatibility_scores" ADD CONSTRAINT "communication_compatibility_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_compatibility_scores" ADD CONSTRAINT "finance_compatibility_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_compatibility_scores" ADD CONSTRAINT "children_compatibility_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_compatibility_scores" ADD CONSTRAINT "career_compatibility_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spiritual_compatibility_scores" ADD CONSTRAINT "spiritual_compatibility_scores_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflict_indicators" ADD CONSTRAINT "conflict_indicators_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "compatibility_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_prompt_history" ADD CONSTRAINT "ai_prompt_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_ai_reports" ADD CONSTRAINT "generated_ai_reports_ai_report_id_fkey" FOREIGN KEY ("ai_report_id") REFERENCES "ai_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_explanation_cache" ADD CONSTRAINT "ai_explanation_cache_ai_report_id_fkey" FOREIGN KEY ("ai_report_id") REFERENCES "ai_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_embeddings" ADD CONSTRAINT "ai_embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_memories" ADD CONSTRAINT "ai_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_contexts" ADD CONSTRAINT "ai_conversation_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usages" ADD CONSTRAINT "ai_token_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_liker_id_fkey" FOREIGN KEY ("liker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_liked_id_fkey" FOREIGN KEY ("liked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutual_matches" ADD CONSTRAINT "mutual_matches_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutual_matches" ADD CONSTRAINT "mutual_matches_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutual_matches" ADD CONSTRAINT "mutual_matches_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_requests" ADD CONSTRAINT "connection_requests_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_requests" ADD CONSTRAINT "connection_requests_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accepted_matches" ADD CONSTRAINT "accepted_matches_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accepted_matches" ADD CONSTRAINT "accepted_matches_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rejected_matches" ADD CONSTRAINT "rejected_matches_rejector_id_fkey" FOREIGN KEY ("rejector_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rejected_matches" ADD CONSTRAINT "rejected_matches_rejected_id_fkey" FOREIGN KEY ("rejected_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_matches" ADD CONSTRAINT "blocked_matches_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_matches" ADD CONSTRAINT "blocked_matches_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_recommendations" ADD CONSTRAINT "match_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_notes" ADD CONSTRAINT "voice_notes_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_calls" ADD CONSTRAINT "video_calls_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_calls" ADD CONSTRAINT "video_calls_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_video_call_id_fkey" FOREIGN KEY ("video_call_id") REFERENCES "video_calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_history" ADD CONSTRAINT "call_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_messages" ADD CONSTRAINT "deleted_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_messages" ADD CONSTRAINT "deleted_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "razorpay_orders" ADD CONSTRAINT "razorpay_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_downloads" ADD CONSTRAINT "report_downloads_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "generated_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_downloads" ADD CONSTRAINT "report_downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astrologers" ADD CONSTRAINT "astrologers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astrologer_availability" ADD CONSTRAINT "astrologer_availability_astrologer_id_fkey" FOREIGN KEY ("astrologer_id") REFERENCES "astrologers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_bookings" ADD CONSTRAINT "consultation_bookings_astrologer_id_fkey" FOREIGN KEY ("astrologer_id") REFERENCES "astrologers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_meetings" ADD CONSTRAINT "consultation_meetings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "consultation_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_reviews" ADD CONSTRAINT "consultation_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "consultation_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_reviews" ADD CONSTRAINT "consultation_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_reviews" ADD CONSTRAINT "consultation_reviews_astrologer_id_fkey" FOREIGN KEY ("astrologer_id") REFERENCES "astrologers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_payments" ADD CONSTRAINT "consultation_payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "consultation_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "blog_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "success_stories" ADD CONSTRAINT "success_stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_logs" ADD CONSTRAINT "permission_logs_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahadashas" ADD CONSTRAINT "mahadashas_timeline_id_fkey" FOREIGN KEY ("timeline_id") REFERENCES "dasha_timelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antardashas" ADD CONSTRAINT "antardashas_mahadasha_id_fkey" FOREIGN KEY ("mahadasha_id") REFERENCES "mahadashas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pratyantar_dashas" ADD CONSTRAINT "pratyantar_dashas_antardasha_id_fkey" FOREIGN KEY ("antardasha_id") REFERENCES "antardashas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
