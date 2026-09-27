import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";

export function Card({ className, style, shadow = "sm", ...props }: ViewProps & { className?: string; shadow?: keyof ReturnType<typeof useTheme>["tokens"]["shadow"] }) {
  const { tokens } = useTheme();
  return <View className={cx("rounded-2xl border border-border bg-card p-5", className)} style={[tokens.shadow[shadow] as ViewStyle, style]} {...props} />;
}
