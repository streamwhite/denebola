import type { ColorScheme } from "./tokens";

export type ThemePreference = ColorScheme | "system";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: string | undefined): value is ThemePreference {
  return value != null && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function resolveColorScheme(preference: ThemePreference, system: string | null | undefined): ColorScheme {
  if (preference === "system") return system === "dark" ? "dark" : "light";
  return preference;
}
