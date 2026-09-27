import { RefreshControl, ScrollView, type ScrollViewProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";

export function PullToRefresh({
  refreshing,
  onRefresh,
  children,
  className,
  contentContainerClassName,
  ...props
}: ScrollViewProps & { refreshing: boolean; onRefresh: () => void; className?: string; contentContainerClassName?: string }) {
  const { tokens } = useTheme();
  return (
    <ScrollView
      className={cx("flex-1", className)}
      contentContainerClassName={cx("grow gap-5 p-6", contentContainerClassName)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.colors.primary} colors={[tokens.colors.primary]} />}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
