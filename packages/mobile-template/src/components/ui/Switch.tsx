import { Switch as NativeSwitch, View, type SwitchProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

export function Switch({ label, description, ...props }: SwitchProps & { label?: string; description?: string }) {
  const { tokens } = useTheme();
  const control = (
    <NativeSwitch
      trackColor={{ false: tokens.colors.border, true: tokens.colors.primary }}
      thumbColor={tokens.colors.card}
      ios_backgroundColor={tokens.colors.border}
      {...props}
    />
  );
  if (!label && !description) return control;
  return (
    <View className={cx("flex-row items-center justify-between gap-4")}>
      <View className="flex-1 gap-0.5">
        {label ? <Text>{label}</Text> : null}
        {description ? (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      {control}
    </View>
  );
}
