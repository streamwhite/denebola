import { View, type ViewProps } from "react-native";
import { cx } from "@/lib/utils/cx";

const baseClass = "rounded-2xl border border-border bg-card p-5";

export function Card({ className, ...props }: ViewProps) {
  return <View className={cx(baseClass, className)} {...props} />;
}
