import { createPreferences, type PreferenceValues, type Preferences } from "../storage/preferences";
import type { Storage } from "../storage/types";

export const PRIVACY_PREFERENCES_KEY = "app.privacyPreferences";

export type ConsentKey = "analytics" | "crashReporting" | "personalizedAds";

export const CONSENT_KEYS: readonly ConsentKey[] = ["analytics", "crashReporting", "personalizedAds"];

export type ConsentMap = Record<ConsentKey, boolean>;

export type PrivacyPreferences = PreferenceValues & {
  consent: ConsentMap;
  updatedAt: number | null;
};

export const DEFAULT_CONSENT: ConsentMap = { analytics: false, crashReporting: false, personalizedAds: false };

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = { consent: DEFAULT_CONSENT, updatedAt: null };

export function createPrivacyPreferences(storage?: Storage): Preferences<PrivacyPreferences> {
  return createPreferences<PrivacyPreferences>({ storage, key: PRIVACY_PREFERENCES_KEY, defaults: DEFAULT_PRIVACY_PREFERENCES });
}

export function hasConsent(preferences: PrivacyPreferences, key: ConsentKey): boolean {
  return preferences.consent?.[key] === true;
}

export async function updateConsent(store: Preferences<PrivacyPreferences>, updates: Partial<ConsentMap>, now = Date.now()): Promise<PrivacyPreferences> {
  const current = await store.read();
  const consent: ConsentMap = { ...DEFAULT_CONSENT, ...current.consent, ...updates };
  return store.patch({ consent, updatedAt: now });
}
