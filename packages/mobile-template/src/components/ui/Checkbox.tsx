import { Pressable, View, type ViewProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
  ...props
}: ViewProps & { checked: boolean; onCheckedChange: (checked: boolean) => void; label?: string; description?: string; disabled?: boolean; className?: string }) {
  const { tokens } = useTheme();
  const content = (
    <View className={cx("flex-row items-start gap-3", className)} {...props}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={() => onCheckedChange(!checked)}
        className={cx("mt-0.5 h-6 w-6 items-center justify-center rounded-md border", checked ? "border-primary bg-primary" : "border-border bg-card", disabled && "opacity-50")}
      >
        {checked ? <Text style={{ color: tokens.colors.primaryForeground }}>✓</Text> : null}
      </Pressable>
      {label || description ? (
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => onCheckedChange(!checked)} className="flex-1 gap-0.5">
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
  return content;
}
