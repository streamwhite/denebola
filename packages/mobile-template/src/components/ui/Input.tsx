import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

const baseClass = "min-h-12 rounded-lg border bg-card px-3.5";

export function Input({
  label,
  error,
  helper,
  prefix,
  suffix,
  className,
  ...props
}: TextInputProps & { label?: string; error?: string; helper?: string; prefix?: React.ReactNode; suffix?: React.ReactNode; className?: string }) {
  const { tokens } = useTheme();
  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      <View className={cx("flex-row items-center", baseClass, error ? "border-destructive" : "border-border", className)}>
        {prefix}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={tokens.colors.muted}
          className="flex-1 text-base text-foreground"
          style={tokens.typography.body}
          {...props}
        />
        {suffix}
      </View>
      {error ? (
        <Text accessibilityRole="alert" variant="caption" tone="destructive">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
