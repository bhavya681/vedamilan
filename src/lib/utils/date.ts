import { differenceInYears, format, formatDistanceToNow, isValid, parse, parseISO } from "date-fns";

export function formatDate(value: Date | string, pattern = "dd MMM yyyy"): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    throw new Error("Invalid date provided to formatDate");
  }
  return format(date, pattern);
}

export function formatDateTime(value: Date | string, pattern = "dd MMM yyyy, HH:mm"): string {
  return formatDate(value, pattern);
}

export function formatRelative(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    throw new Error("Invalid date provided to formatRelative");
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function parseBirthDate(value: string, pattern = "yyyy-MM-dd"): Date {
  const parsed = parse(value, pattern, new Date());
  if (!isValid(parsed)) {
    throw new Error(`Unable to parse birth date: ${value}`);
  }
  return parsed;
}

export function toISODate(value: Date): string {
  if (!isValid(value)) {
    throw new Error("Invalid date provided to toISODate");
  }
  return format(value, "yyyy-MM-dd");
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && isValid(value);
}

export function getAgeFromDob(dob: Date | string, referenceDate: Date = new Date()): number {
  const date = typeof dob === "string" ? parseISO(dob) : dob;
  if (!isValid(date)) {
    throw new Error("Invalid date of birth");
  }
  return differenceInYears(referenceDate, date);
}
