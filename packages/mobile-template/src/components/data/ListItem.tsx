import { Pressable, View, type ViewProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  disabled,
  className,
  ...props
}: ViewProps & { title: string; subtitle?: string; leading?: React.ReactNode; trailing?: React.ReactNode; onPress?: () => void; disabled?: boolean; className?: string }) {
  const { tokens } = useTheme();
  const content = (
    <View className={cx("flex-row items-center gap-4 py-3.5", className)} {...props}>
      {leading}
      <View className="flex-1 gap-0.5">
        <Text>{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} className={cx(disabled && "opacity-50")} android_ripple={{ color: tokens.colors.border }}>
      {content}
    </Pressable>
  );
}
