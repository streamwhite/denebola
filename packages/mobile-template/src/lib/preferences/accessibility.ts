import { createPreferences, type PreferenceValues, type Preferences } from "../storage/preferences";
import type { Storage } from "../storage/types";

export const ACCESSIBILITY_PREFERENCES_KEY = "app.accessibilityPreferences";

export type AccessibilityPreferences = PreferenceValues & {
  reduceMotion: boolean;
  highContrast: boolean;
  boldText: boolean;
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = { reduceMotion: false, highContrast: false, boldText: false };

export function createAccessibilityPreferences(storage?: Storage): Preferences<AccessibilityPreferences> {
  return createPreferences<AccessibilityPreferences>({ storage, key: ACCESSIBILITY_PREFERENCES_KEY, defaults: DEFAULT_ACCESSIBILITY_PREFERENCES });
}

export type AccessibilitySettings = { reduceMotion: boolean; screenReaderEnabled: boolean; fontScale: number };

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = { reduceMotion: false, screenReaderEnabled: false, fontScale: 1 };

// Contract over the OS accessibility signals (RN AccessibilityInfo / expo).
export interface AccessibilityAdapter {
  get(): Promise<AccessibilitySettings>;
  subscribe(listener: (settings: AccessibilitySettings) => void): () => void;
}

export function createMemoryAccessibilityAdapter(
  initial: AccessibilitySettings = DEFAULT_ACCESSIBILITY_SETTINGS,
): AccessibilityAdapter & { emit: (settings: AccessibilitySettings) => void } {
  const state: { settings: AccessibilitySettings; listener?: (settings: AccessibilitySettings) => void } = { settings: initial };
  return {
    async get() {
      return state.settings;
    },
    subscribe(listener) {
      state.listener = listener;
      return () => {
        state.listener = undefined;
      };
    },
    emit(settings) {
      state.settings = settings;
      state.listener?.(settings);
    },
  };
}

// A user preference or the OS setting can both request reduced motion.
export function prefersReducedMotion(preferences: AccessibilityPreferences, settings: AccessibilitySettings): boolean {
  return preferences.reduceMotion || settings.reduceMotion;
}
