import { ActivityIndicator, View } from "react-native";
import { useText } from "@/lib/i18n/locale";
import { cx } from "@/lib/utils/cx";

export function LoadingState({ className }: { className?: string }) {
  const text = useText();
  return (
    <View className={cx("items-center justify-center p-6", className)}>
      <ActivityIndicator className="text-primary" accessibilityLabel={text({ id: "common.loading" })} />
    </View>
  );
}
