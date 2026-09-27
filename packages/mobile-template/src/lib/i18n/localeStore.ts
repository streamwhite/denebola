import { getLocales } from "expo-localization";
import type { Storage } from "../storage/types";
import { detectLocale, LOCALE_STORAGE_KEY, supportedLocales, type LocaleSource } from "./localeCore";

export function deviceLocales(): string[] {
  return getLocales().map((locale) => locale.languageTag || locale.languageCode).filter((tag): tag is string => Boolean(tag));
}

export function createLocaleStore(options: { source: LocaleSource; storage?: Storage; fallback?: string }): { resolve: () => Promise<string>; persist: (locale: string) => Promise<void> } {
  const supported = supportedLocales(options.source);
  const fallback = options.fallback ?? supported[0] ?? "en";
  return {
    async resolve() {
      const saved = await options.storage?.get<string>(LOCALE_STORAGE_KEY);
      return detectLocale([typeof saved === "string" ? saved : null, ...deviceLocales()], supported, fallback);
    },
    async persist(locale) {
      await options.storage?.set(LOCALE_STORAGE_KEY, locale);
    },
  };
}

export function createLocaleLoader(loaders: Record<string, () => Promise<Record<string, string>>>) {
  return async (locale: string): Promise<Record<string, string>> => {
    const loader = loaders[locale];
    if (!loader) throw new Error(`No translation loader for locale: ${locale}`);
    return loader();
  };
}
