import { Text as NativeText, type TextProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import type { TypographyVariant } from "../../lib/theme/tokens";
import { cx } from "../../lib/utils/cx";

const toneClass = {
  default: "text-foreground",
  muted: "text-muted",
  primary: "text-primary",
  destructive: "text-destructive",
} as const;

export type TextTone = keyof typeof toneClass;

export function Text({ variant = "body", tone = "default", className, style, ...props }: TextProps & { variant?: TypographyVariant; tone?: TextTone }) {
  const { tokens } = useTheme();
  return <NativeText className={cx(toneClass[tone], className)} style={[tokens.typography[variant], style]} {...props} />;
}
