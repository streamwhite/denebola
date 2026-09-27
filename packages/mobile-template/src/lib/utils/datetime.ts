export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function toIsoDate(value: Date | number | string): string | null {
  const date = value instanceof Date ? value : new Date(value);
  return isValidDate(date) ? date.toISOString() : null;
}

export function addMs(value: Date | number, ms: number): Date {
  return new Date((value instanceof Date ? value.getTime() : value) + ms);
}

export function diffMs(from: Date | number, to: Date | number): number {
  return (to instanceof Date ? to.getTime() : to) - (from instanceof Date ? from.getTime() : from);
}

export function startOfDay(value: Date | number): Date {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function formatDate(value: Date | number, locale: string, options?: Intl.DateTimeFormatOptions, timeZone?: string): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, { ...options, ...(timeZone ? { timeZone } : {}) }).format(date);
}

export function formatInTimeZone(value: Date | number, timeZone: string, locale: string): string {
  return formatDate(value, locale, { dateStyle: "medium", timeStyle: "short" }, timeZone);
}
