import { ScrollView, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cx } from "../../lib/utils/cx";

export function Screen({ children, className, contentContainerClassName, scrollable = true, ...props }: ScrollViewProps & { className?: string; contentContainerClassName?: string; scrollable?: boolean }) {
  const content = scrollable ? (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName={cx("grow gap-5 p-6", contentContainerClassName)} {...props}>
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );
  return <SafeAreaView className={cx("flex-1 bg-background", className)}>{content}</SafeAreaView>;
}
