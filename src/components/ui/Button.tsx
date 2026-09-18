import { Pressable, Text as NativeText, type PressableProps } from "react-native";
import { cx } from "@/lib/utils/cx";

const baseClass = "min-h-12 items-center justify-center rounded-xl bg-primary px-5 active:opacity-75 disabled:opacity-50";

export function Button({ title, className, disabled, ...props }: PressableProps & { title: string; className?: string }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} className={cx(baseClass, className)} {...props}>
      <NativeText className="font-bold text-white">{title}</NativeText>
    </Pressable>
  );
}
