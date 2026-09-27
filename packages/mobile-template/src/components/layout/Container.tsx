import { View, type ViewProps } from "react-native";
import { cx } from "../../lib/utils/cx";

export function Container({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cx("w-full self-center px-6", className)} style={{ maxWidth: 640 }} {...props} />;
}
