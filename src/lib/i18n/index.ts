export * from "@/lib/i18n/locales";
export * from "@/lib/i18n/path";
export * from "@/lib/i18n/format";
export * from "@/lib/i18n/glossary";
export type { MessageTree } from "@/lib/i18n/translate";
export { translateKey } from "@/lib/i18n/translate";
/** Prefer importing getMessages from `@/lib/i18n/get-messages` in Server Components only. */
