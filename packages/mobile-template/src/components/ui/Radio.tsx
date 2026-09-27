import { Pressable, View, type ViewProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

export function Radio({
  selected,
  onSelect,
  label,
  description,
  disabled,
  className,
  ...props
}: ViewProps & { selected: boolean; onSelect: () => void; label?: string; description?: string; disabled?: boolean; className?: string }) {
  const { tokens } = useTheme();
  return (
    <View className={cx("flex-row items-start gap-3", className)} {...props}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onSelect}
        className={cx("mt-0.5 h-6 w-6 items-center justify-center rounded-full border", selected ? "border-primary" : "border-border", disabled && "opacity-50")}
      >
        {selected ? <View className="h-3 w-3 rounded-full" style={{ backgroundColor: tokens.colors.primary }} /> : null}
      </Pressable>
      {label || description ? (
        <Pressable accessibilityRole="button" disabled={disabled} onPress={onSelect} className="flex-1 gap-0.5">
          {label ? <Text>{label}</Text> : null}
          {description ? (
            <Text variant="caption" tone="muted">
              {description}
            </Text>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}
