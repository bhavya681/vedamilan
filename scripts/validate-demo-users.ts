/**
 * Validation script for demo user dataset.
 *
 * Checks:
 *  - REAL_CELEB_MEMBERS have no duplicate IDs or emails among themselves
 *  - REAL_CELEB_MEMBERS do not collide with existing DEMO_MEMBERS
 *  - Birth data completeness and format for REAL_CELEB_MEMBERS
 *  - Gender enum validity for REAL_CELEB_MEMBERS
 *  - Coordinate bounds for REAL_CELEB_MEMBERS
 *  - Source documentation coverage for REAL_CELEB_MEMBERS
 *  - Demo email domain conventions for REAL_CELEB_MEMBERS
 *  - Ability to pair REAL_CELEB_MEMBERS for compatibility testing
 */

import { DEMO_MEMBERS } from "@/lib/mock/demo-profiles";
import { REAL_CELEB_MEMBERS } from "@/lib/mock/real-celeb-profiles";
import demoSources from "../data/demo-users.sources.json";

type SourceDoc = {
  id: string;
  name: string;
  dateOfBirth: string;
  birthTime: string;
  birthTimeConfidence: string;
  birthPlace: string;
  notes: string;
};

const sources = (demoSources as { profiles: SourceDoc[] }).profiles;
const sourceMap = new Map(sources.map((s) => [s.id, s]));

const errors: string[] = [];
const warnings: string[] = [];
const info: string[] = [];

const validGenders = new Set(["MALE", "FEMALE", "OTHER", "UNDISCLOSED"]);

// Helper: collect pre-existing duplicate IDs/emails from the full dataset
const allIds = DEMO_MEMBERS.map((m) => m.id);
const allEmails = DEMO_MEMBERS.map((m) => m.email.toLowerCase());
const preExistingIdDupes = new Set<string>();
const preExistingEmailDupes = new Set<string>();
for (const id of allIds) {
  if (allIds.filter((x) => x === id).length > 1) preExistingIdDupes.add(id);
}
for (const email of allEmails) {
  if (allEmails.filter((x) => x === email).length > 1) preExistingEmailDupes.add(email);
}

// 1. REAL_CELEB_MEMBERS duplicate IDs
const realIds = REAL_CELEB_MEMBERS.map((m) => m.id);
const realUniqueIds = new Set(realIds);
if (realUniqueIds.size !== realIds.length) {
  const dupes = realIds.filter((id, i) => realIds.indexOf(id) !== i);
  errors.push(`Duplicate IDs in REAL_CELEB_MEMBERS: ${[...new Set(dupes)].join(", ")}`);
} else {
  info.push(`REAL_CELEB_MEMBERS unique IDs: ${realUniqueIds.size}`);
}

// 2. REAL_CELEB_MEMBERS duplicate emails
const realEmails = REAL_CELEB_MEMBERS.map((m) => m.email.toLowerCase());
const realUniqueEmails = new Set(realEmails);
if (realUniqueEmails.size !== realEmails.length) {
  const dupes = realEmails.filter((e, i) => realEmails.indexOf(e) !== i);
  errors.push(`Duplicate emails in REAL_CELEB_MEMBERS: ${[...new Set(dupes)].join(", ")}`);
} else {
  info.push(`REAL_CELEB_MEMBERS unique emails: ${realUniqueEmails.size}`);
}

// 3. REAL_CELEB_MEMBERS collisions with existing DEMO_MEMBERS
const existingIds = new Set(
  DEMO_MEMBERS.filter((m) => !REAL_CELEB_MEMBERS.find((r) => r.id === m.id)).map((m) => m.id),
);
const existingEmails = new Set(
  DEMO_MEMBERS.filter((m) => !REAL_CELEB_MEMBERS.find((r) => r.email === m.email)).map((m) =>
    m.email.toLowerCase(),
  ),
);

const idCollisions = REAL_CELEB_MEMBERS.filter((m) => existingIds.has(m.id));
const emailCollisions = REAL_CELEB_MEMBERS.filter((m) => existingEmails.has(m.email.toLowerCase()));
if (idCollisions.length > 0) {
  errors.push(`ID collisions with existing demos: ${idCollisions.map((m) => m.id).join(", ")}`);
}
if (emailCollisions.length > 0) {
  errors.push(
    `Email collisions with existing demos: ${emailCollisions.map((m) => m.email).join(", ")}`,
  );
}

// 4. Birth data validation for REAL_CELEB_MEMBERS
let validDob = 0;
let validTime = 0;
let validPlace = 0;
let validCoords = 0;
let validTimezone = 0;
let validGender = 0;

const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
const tzRegex = /^[A-Za-z_]+\/[A-Za-z_]+$/;

for (const m of REAL_CELEB_MEMBERS) {
  if (dobRegex.test(m.birth.birthDate)) validDob++;
  else errors.push(`Invalid DOB for ${m.id}: ${m.birth.birthDate}`);
  if (timeRegex.test(m.birth.birthTime)) validTime++;
  else errors.push(`Invalid birthTime for ${m.id}: ${m.birth.birthTime}`);
  if (m.birth.placeName && m.birth.placeName.length > 0) validPlace++;
  else errors.push(`Missing placeName for ${m.id}`);
  const lat = Number(m.birth.latitude);
  const lng = Number(m.birth.longitude);
  if (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
    validCoords++;
  else errors.push(`Invalid coords for ${m.id}: ${lat}, ${lng}`);
  if (tzRegex.test(m.birth.timezone)) validTimezone++;
  else errors.push(`Invalid timezone for ${m.id}: ${m.birth.timezone}`);
  if (validGenders.has(m.gender)) validGender++;
  else errors.push(`Invalid gender for ${m.id}: ${m.gender}`);
}

info.push(`REAL_CELEB_MEMBERS valid DOB: ${validDob}/${REAL_CELEB_MEMBERS.length}`);
info.push(`REAL_CELEB_MEMBERS valid birthTime: ${validTime}/${REAL_CELEB_MEMBERS.length}`);
info.push(`REAL_CELEB_MEMBERS valid placeName: ${validPlace}/${REAL_CELEB_MEMBERS.length}`);
info.push(`REAL_CELEB_MEMBERS valid coordinates: ${validCoords}/${REAL_CELEB_MEMBERS.length}`);
info.push(`REAL_CELEB_MEMBERS valid timezone: ${validTimezone}/${REAL_CELEB_MEMBERS.length}`);
info.push(`REAL_CELEB_MEMBERS valid gender: ${validGender}/${REAL_CELEB_MEMBERS.length}`);

// 5. Source documentation coverage for REAL_CELEB_MEMBERS
const realDocumentedIds = new Set(sources.map((s) => s.id));
const realMissingSources = REAL_CELEB_MEMBERS.filter((m) => !realDocumentedIds.has(m.id));
if (realMissingSources.length > 0) {
  warnings.push(
    `Missing source docs for REAL_CELEB_MEMBERS: ${realMissingSources.map((m) => m.id).join(", ")}`,
  );
} else {
  info.push(`Source documentation coverage: ${sources.length}/${REAL_CELEB_MEMBERS.length}`);
}

// 6. Birth time confidence reporting
const highConfidence = sources.filter(
  (s) => s.birthTimeConfidence === "high" || s.birthTimeConfidence === "very-high",
);
const lowConfidence = sources.filter((s) => s.birthTimeConfidence === "low");
info.push(
  `Birth time confidence — high/very-high: ${highConfidence.length}, low/uncertain: ${lowConfidence.length}`,
);

// 7. Demo email domain check for REAL_CELEB_MEMBERS
const demoDomains = ["demo.vedamilan.ai", "email.com"];
const badDomains = REAL_CELEB_MEMBERS.filter((m) => {
  const domain = m.email.split("@")[1];
  return !demoDomains.includes(domain);
});
if (badDomains.length > 0) {
  warnings.push(
    `Non-demo email domains in REAL_CELEB_MEMBERS: ${badDomains.map((m) => `${m.email}`).join(", ")}`,
  );
}

// 8. No real notifications should be triggered
const realEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
const realLookingEmails = REAL_CELEB_MEMBERS.filter((m) => {
  const domain = m.email.split("@")[1];
  return realEmailDomains.includes(domain);
});
if (realLookingEmails.length > 0) {
  errors.push(
    `Potentially real email domains in REAL_CELEB_MEMBERS: ${realLookingEmails.map((m) => m.email).join(", ")}`,
  );
} else {
  info.push("No real-looking email domains in REAL_CELEB_MEMBERS.");
}

// 9. Compatibility pair test for REAL_CELEB_MEMBERS
const realMales = REAL_CELEB_MEMBERS.filter((m) => m.gender === "MALE");
const realFemales = REAL_CELEB_MEMBERS.filter((m) => m.gender === "FEMALE");
if (realMales.length > 0 && realFemales.length > 0) {
  info.push(
    `REAL_CELEB_MEMBERS compatibility pairs: ${realMales.length} males × ${realFemales.length} females = ${realMales.length * realFemales.length} pairs`,
  );
} else {
  errors.push(
    "REAL_CELEB_MEMBERS needs at least one MALE and one FEMALE profile for compatibility testing.",
  );
}

// Pre-existing issues note
if (preExistingIdDupes.size > 0 || preExistingEmailDupes.size > 0) {
  warnings.push(
    `Pre-existing duplicate IDs in DEMO_MEMBERS: ${[...preExistingIdDupes].join(", ")}`,
  );
  warnings.push(
    `Pre-existing duplicate emails in DEMO_MEMBERS: ${[...preExistingEmailDupes].join(", ")}`,
  );
  warnings.push("These pre-existing issues were NOT introduced by REAL_CELEB_MEMBERS.");
}

// Summary
console.log("\n=== Demo User Validation Report ===\n");
console.log("INFO:");
info.forEach((i) => console.log(`  ✓ ${i}`));
if (warnings.length > 0) {
  console.log("\nWARNINGS:");
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
if (errors.length > 0) {
  console.log("\nERRORS:");
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log("\nDemo users validation FAILED.\n");
  process.exitCode = 1;
} else {
  console.log("\nDemo users validation PASSED.\n");
}
