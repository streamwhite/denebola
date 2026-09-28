import { useEffect, useRef, useState } from "react";
import type { Storage } from "../storage/types";
import { detectLocale, supportedLocales, type LocaleSource } from "./localeCore";
import { createLocaleLoader, createLocaleStore, deviceLocales } from "./localeStore";
import { mergeMessages, type AppMessages } from "./messages";

export type LocaleController = { locale: string; setLocale: (locale: string) => void; messages: Record<string, string>; ready: boolean };
export type LocaleLoader = (locale: string) => Promise<Record<string, string>>;
export type LocaleControllerOptions = { source: LocaleSource; fallback?: string; storage?: Storage; load?: LocaleLoader };

export function useLocaleController(options: LocaleControllerOptions): LocaleController {
  const supported = supportedLocales(options.source);
  const fallback = options.fallback ?? supported[0] ?? "en";
  const [locale, setLocaleState] = useState(fallback);
  const [messages, setMessages] = useState<Record<string, string>>(() => mergeCatalog(fallback, options.source));
  const [ready, setReady] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let active = true;
    (async () => {
      const current = optionsRef.current;
      const store = createLocaleStore({ source: current.source, storage: current.storage, fallback });
      const detected = await store.resolve();
      if (!active) return;
      const loaded = await loadMessages(detected, current, fallback).catch(() => mergeCatalog(detected, current.source));
      if (!active) return;
      setLocaleState(detected);
      setMessages(loaded);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [fallback]);

  async function setLocale(next: string) {
    const current = optionsRef.current;
    const target = detectLocale([next], supported, fallback);
    const loaded = await loadMessages(target, current, fallback).catch(() => mergeCatalog(target, current.source));
    setLocaleState(target);
    setMessages(loaded);
    await createLocaleStore({ source: current.source, storage: current.storage, fallback }).persist(target);
  }

  return { locale, setLocale, messages, ready };
}

function loadMessages(locale: string, options: LocaleControllerOptions, fallback: string): Promise<Record<string, string>> {
  if (options.load) return createLocaleLoader({ [locale]: () => options.load!(locale) })(locale);
  const bundled = options.source;
  if (Array.isArray(bundled)) return Promise.resolve(mergeMessages(locale));
  const catalogs = bundled as AppMessages;
  if (catalogs[locale]) return Promise.resolve(mergeMessages(locale, catalogs));
  const device = deviceLocales()[0];
  const detected = detectLocale([device], supportedLocales(bundled), fallback);
  return Promise.resolve(mergeMessages(detected, catalogs));
}

// Framework defaults (common.*, theme.*) stay underneath the app's catalog for the locale.
function mergeCatalog(locale: string, source: LocaleSource): Record<string, string> {
  if (Array.isArray(source)) return mergeMessages(locale);
  return mergeMessages(locale, source as AppMessages);
}
