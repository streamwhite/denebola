import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cx } from "../../lib/utils/cx";

const behavior = Platform.OS === "ios" ? "padding" : undefined;

export function KeyboardAvoidingScreen({ children, className, contentContainerClassName, ...props }: ScrollViewProps & { className?: string; contentContainerClassName?: string }) {
  return (
    <SafeAreaView className={cx("flex-1 bg-background", className)}>
      <KeyboardAvoidingView behavior={behavior} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName={cx("grow gap-5 p-6", contentContainerClassName)} {...props}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
