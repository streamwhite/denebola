export type ColorScheme = "light" | "dark";

export const spacing = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 } as const;
export const radius = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, "2xl": 24, full: 9999 } as const;
export const fontSize = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 30, "4xl": 36 } as const;
export const fontWeight = { normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800" } as const;
export const lineHeight = { xs: 16, sm: 20, base: 24, lg: 28, xl: 28, "2xl": 32, "3xl": 36, "4xl": 40 } as const;
export const shadow = {
  none: {},
  sm: { shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  md: { shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  lg: { shadowOpacity: 0.16, shadowRadius: 16, elevation: 8 },
} as const;

export const palette = {
  light: {
    background: "#f7f7f2",
    foreground: "#172018",
    card: "#ffffff",
    primary: "#176b52",
    primaryForeground: "#ffffff",
    muted: "#68736c",
    border: "#d9dfd8",
    destructive: "#b42318",
    success: "#17845f",
    warning: "#b7791f",
    info: "#2563eb",
  },
  dark: {
    background: "#101512",
    foreground: "#eff7ef",
    card: "#1a241d",
    primary: "#80d8ae",
    primaryForeground: "#101512",
    muted: "#a6b4aa",
    border: "#354239",
    destructive: "#ff897d",
    success: "#4ade80",
    warning: "#fbbf24",
    info: "#60a5fa",
  },
} as const;

export type ThemeColors = { [K in keyof typeof palette.light]: string };

export type ThemeTypographyToken = { fontSize: number; lineHeight: number; fontWeight: string };

export const typography = {
  body: { fontSize: fontSize.base, lineHeight: lineHeight.base, fontWeight: fontWeight.normal },
  label: { fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontWeight: fontWeight.semibold },
  caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontWeight: fontWeight.normal },
  h1: { fontSize: fontSize["4xl"], lineHeight: lineHeight["4xl"], fontWeight: fontWeight.extrabold },
  h2: { fontSize: fontSize["3xl"], lineHeight: lineHeight["3xl"], fontWeight: fontWeight.bold },
  h3: { fontSize: fontSize["2xl"], lineHeight: lineHeight["2xl"], fontWeight: fontWeight.bold },
  h4: { fontSize: fontSize.xl, lineHeight: lineHeight.xl, fontWeight: fontWeight.semibold },
} as const satisfies Record<string, ThemeTypographyToken>;

export type TypographyVariant = keyof typeof typography;

export type DesignTokens = {
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  shadow: typeof shadow;
  colors: ThemeColors;
  typography: typeof typography;
};

export function createTokens(scheme: ColorScheme): DesignTokens {
  return { spacing, radius, fontSize, fontWeight, lineHeight, shadow, typography, colors: palette[scheme] };
}

export const lightTokens = createTokens("light");
export const darkTokens = createTokens("dark");
