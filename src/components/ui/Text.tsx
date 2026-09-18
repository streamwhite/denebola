import { Text as NativeText, type TextProps } from "react-native";
import { cx } from "@/lib/utils/cx";

const baseClass = "text-base text-foreground";

export function Text({ className, ...props }: TextProps) {
  return <NativeText className={cx(baseClass, className)} {...props} />;
}
