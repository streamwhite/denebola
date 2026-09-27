import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

const DEFAULT_LINES = 4;

export function Textarea({ label, error, helper, className, minLines = DEFAULT_LINES, ...props }: TextInputProps & { label?: string; error?: string; helper?: string; minLines?: number; className?: string }) {
  const { tokens } = useTheme();
  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        multiline
        textAlignVertical="top"
        accessibilityLabel={label}
        placeholderTextColor={tokens.colors.muted}
        className={cx("rounded-lg border bg-card px-3.5 py-3 text-foreground", error ? "border-destructive" : "border-border", className)}
        style={[{ minHeight: tokens.fontSize.base * (minLines + 1) }, tokens.typography.body]}
        {...props}
      />
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
