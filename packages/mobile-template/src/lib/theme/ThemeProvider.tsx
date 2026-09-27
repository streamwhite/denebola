import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { isThemePreference, resolveColorScheme, type ThemePreference } from "./colorScheme";
import { createTokens, type DesignTokens } from "./tokens";

export type ThemeContextValue = {
  preference: ThemePreference;
  scheme: "light" | "dark";
  tokens: DesignTokens;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

export function ThemeProvider({ preference: initial, children }: { preference?: ThemePreference; children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(initial ?? "system");
  const scheme = resolveColorScheme(preference, system);
  const value = useMemo<ThemeContextValue>(() => ({ preference, scheme, tokens: createTokens(scheme), setPreference }), [preference, scheme]);

  useEffect(() => {
    if (initial && isThemePreference(initial) && initial !== preference) setPreference(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
