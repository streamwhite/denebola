import { createPreferences, type PreferenceValues, type Preferences } from "../storage/preferences";
import type { Storage } from "../storage/types";
import { isThemePreference, type ThemePreference } from "../theme/colorScheme";

export const THEME_PREFERENCE_KEY = "app.themePreference";

export type ThemePreferenceState = PreferenceValues & { theme: ThemePreference };

export const DEFAULT_THEME_PREFERENCE: ThemePreferenceState = { theme: "system" };

export function createThemePreferenceStore(storage?: Storage): Preferences<ThemePreferenceState> {
  return createPreferences<ThemePreferenceState>({ storage, key: THEME_PREFERENCE_KEY, defaults: DEFAULT_THEME_PREFERENCE });
}

export function toThemePreference(value: unknown): ThemePreference {
  return typeof value === "string" && isThemePreference(value) ? value : DEFAULT_THEME_PREFERENCE.theme;
}
