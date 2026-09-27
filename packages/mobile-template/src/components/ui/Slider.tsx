import SliderBase, { type SliderProps } from "@react-native-community/slider";
import { View } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { Text } from "./Text";

export function Slider({ label, formatValue, ...props }: SliderProps & { label?: string; formatValue?: (value: number) => string }) {
  const { tokens } = useTheme();
  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      <SliderBase
        minimumTrackTintColor={tokens.colors.primary}
        maximumTrackTintColor={tokens.colors.border}
        thumbTintColor={tokens.colors.primary}
        {...props}
      />
      {formatValue && props.value != null ? (
        <Text variant="caption" tone="muted">
          {formatValue(props.value)}
        </Text>
      ) : null}
    </View>
  );
}
