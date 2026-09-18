import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, type ScrollViewProps } from "react-native";
import { cx } from "@/lib/utils/cx";

export function Screen({ children, className, contentContainerClassName, ...props }: ScrollViewProps & { className?: string; contentContainerClassName?: string }) {
  return (
    <SafeAreaView className={cx("flex-1 bg-background", className)}>
      <ScrollView contentContainerClassName={cx("grow gap-5 p-6", contentContainerClassName)} {...props}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
