import { View, type ViewProps } from "react-native";
import { cx } from "../../lib/utils/cx";
import { Text, type TextTone } from "./Text";

export type BadgeTone = "default" | "primary" | "success" | "warning" | "destructive" | "info";

const toneClass: Record<BadgeTone, string> = {
  default: "bg-muted/20",
  primary: "bg-primary/15",
  success: "bg-success/15",
  warning: "bg-warning/20",
  destructive: "bg-destructive/15",
  info: "bg-info/15",
};

const textTone: Record<BadgeTone, TextTone> = {
  default: "muted",
  primary: "primary",
  success: "default",
  warning: "default",
  destructive: "destructive",
  info: "default",
};

export function Badge({ label, tone = "default", className, ...props }: ViewProps & { label: string; tone?: BadgeTone; className?: string }) {
  return (
    <View className={cx("self-start rounded-full px-2.5 py-1", toneClass[tone], className)} {...props}>
      <Text variant="caption" tone={textTone[tone]} className="font-semibold">
        {label}
      </Text>
    </View>
  );
}
