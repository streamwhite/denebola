import { ActivityIndicator, Pressable, Text as NativeText, type PressableProps, ViewStyle } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-muted/20",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-destructive",
};

const sizeClass: Record<ButtonSize, string> = { sm: "min-h-9 px-3", md: "min-h-12 px-5", lg: "min-h-14 px-6" };
const sizeGapClass: Record<ButtonSize, string> = { sm: "gap-1.5", md: "gap-2", lg: "gap-2.5" };
const labelVariant: Record<ButtonSize, "label" | "body"> = { sm: "label", md: "label", lg: "body" };

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  className,
  style,
  ...props
}: PressableProps & { title: string; variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; icon?: React.ReactNode; className?: string; style?: ViewStyle }) {
  const { tokens } = useTheme();
  const isDisabled = disabled || loading;
  const labelTone = variant === "outline" || variant === "ghost" || variant === "secondary" ? "default" : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      disabled={isDisabled}
      className={cx("flex-row items-center justify-center rounded-xl active:opacity-75", variantClass[variant], sizeClass[size], sizeGapClass[size], isDisabled && "opacity-50", className)}
      style={style}
      {...props}
    >
      {loading ? <ActivityIndicator color={tokens.colors.foreground} size="small" /> : icon}
      {variant === "primary" || variant === "destructive" ? (
        <NativeText className="font-bold" style={{ color: tokens.colors.primaryForeground }}>
          {title}
        </NativeText>
      ) : (
        <Text variant={labelVariant[size]} tone={labelTone}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
