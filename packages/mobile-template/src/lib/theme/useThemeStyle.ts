import { useMemo } from "react";
import type { TextStyle, ViewStyle } from "react-native";
import { useTheme } from "./ThemeProvider";
import type { DesignTokens, TypographyVariant } from "./tokens";

export function useTypography(variant: TypographyVariant = "body"): TextStyle {
  const { tokens } = useTheme();
  return tokens.typography[variant];
}

export function useSpacing(key: keyof DesignTokens["spacing"]): number {
  return useTheme().tokens.spacing[key];
}

export function useRadius(key: keyof DesignTokens["radius"]): number {
  return useTheme().tokens.radius[key];
}

export function useShadow(key: keyof DesignTokens["shadow"]): ViewStyle {
  return useTheme().tokens.shadow[key] as ViewStyle;
}

export function useColors(): DesignTokens["colors"] {
  return useTheme().tokens.colors;
}

export function useThemedStyle<T extends ViewStyle | TextStyle>(factory: (tokens: DesignTokens) => T): T {
  const { tokens } = useTheme();
  return useMemo(() => factory(tokens), [tokens, factory]);
}
