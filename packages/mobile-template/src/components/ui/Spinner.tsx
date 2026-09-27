import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";

export function Spinner({ size = "small", color, className }: { size?: "small" | "large"; color?: string; className?: string }) {
  const { tokens } = useTheme();
  return (
    <View className={cx("items-center justify-center", className)}>
      <ActivityIndicator size={size} color={color ?? tokens.colors.primary} />
    </View>
  );
}
