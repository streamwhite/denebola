export type LocaleSource = Record<string, Record<string, string> | undefined> | readonly string[];

const LOCALE_TAG = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/i;
const MAX_LOCALE_TAG_LENGTH = 35;

export function localeTag(value: string | undefined): string {
  if (!value) return "";
  const tag = value.trim().replace(/_/g, "-");
  return LOCALE_TAG.test(tag) ? tag : "";
}

export function supportedLocales(source: LocaleSource): string[] {
  return Array.isArray(source) ? [...source] : Object.keys(source);
}

export function canonicalLocale(value: string | undefined, supported: readonly string[]): string | null {
  const tag = localeTag(value);
  if (!tag) return null;
  const exact = supported.find((locale) => locale.toLowerCase() === tag.toLowerCase());
  if (exact) return exact;
  const [language] = tag.split("-");
  return supported.find((locale) => locale.split("-")[0].toLowerCase() === language.toLowerCase()) ?? null;
}

export function detectLocale(candidates: readonly (string | null | undefined)[], supported: readonly string[], fallback: string): string {
  for (const candidate of candidates) {
    const match = canonicalLocale(candidate ?? undefined, supported);
    if (match) return match;
  }
  return canonicalLocale(fallback, supported) ?? supported[0] ?? fallback;
}

export function fallbackMessages(locale: string, source: LocaleSource, fallback: string): Record<string, string> {
  if (Array.isArray(source)) return {};
  const catalogs = source as Record<string, Record<string, string> | undefined>;
  return catalogs[locale] ?? catalogs[fallback] ?? {};
}

export const LOCALE_STORAGE_KEY = "app.locale";
