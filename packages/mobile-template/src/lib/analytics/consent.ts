import { hasConsent, type ConsentKey, type PrivacyPreferences } from "../preferences/privacy";
import type { Analytics } from "./types";

// Gates every analytics call behind the current consent so tracking stops immediately on opt-out.
export function createConsentedAnalytics(analytics: Analytics, consent: () => PrivacyPreferences, required: ConsentKey = "analytics"): Analytics {
  function allowed(): boolean {
    return hasConsent(consent(), required);
  }

  return {
    track: (name, properties) => {
      if (allowed()) analytics.track(name, properties);
    },
    identify: (userId, properties) => {
      if (allowed()) analytics.identify(userId, properties);
    },
    screen: (name) => {
      if (allowed()) analytics.screen(name);
    },
  };
}
