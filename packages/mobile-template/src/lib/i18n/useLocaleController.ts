import { useEffect, useRef, useState } from "react";
import type { Storage } from "../storage/types";
import { detectLocale, fallbackMessages, supportedLocales, type LocaleSource } from "./localeCore";
import { createLocaleLoader, createLocaleStore, deviceLocales } from "./localeStore";

export type LocaleController = { locale: string; setLocale: (locale: string) => void; messages: Record<string, string>; ready: boolean };
export type LocaleLoader = (locale: string) => Promise<Record<string, string>>;
export type LocaleControllerOptions = { source: LocaleSource; fallback?: string; storage?: Storage; load?: LocaleLoader };

export function useLocaleController(options: LocaleControllerOptions): LocaleController {
  const supported = supportedLocales(options.source);
  const fallback = options.fallback ?? supported[0] ?? "en";
  const [locale, setLocaleState] = useState(fallback);
  const [messages, setMessages] = useState<Record<string, string>>(() => fallbackMessages(fallback, options.source, fallback));
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
      const loaded = await loadMessages(detected, current, fallback).catch(() => fallbackMessages(detected, current.source, fallback));
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
    const loaded = await loadMessages(target, current, fallback).catch(() => fallbackMessages(target, current.source, fallback));
    setLocaleState(target);
    setMessages(loaded);
    await createLocaleStore({ source: current.source, storage: current.storage, fallback }).persist(target);
  }

  return { locale, setLocale, messages, ready };
}

function loadMessages(locale: string, options: LocaleControllerOptions, fallback: string): Promise<Record<string, string>> {
  if (options.load) return createLocaleLoader({ [locale]: () => options.load!(locale) })(locale);
  const bundled = options.source;
  if (Array.isArray(bundled)) return Promise.resolve({});
  const catalogs = bundled as Record<string, Record<string, string> | undefined>;
  const direct = catalogs[locale];
  if (direct) return Promise.resolve(direct);
  const device = deviceLocales()[0];
  const detected = detectLocale([device], supportedLocales(bundled), fallback);
  return Promise.resolve(fallbackMessages(detected, bundled, fallback));
}
