import { useEffect, useRef } from "react";
import { Animated, type DimensionValue, type ViewStyle } from "react-native";
import { cx } from "../../lib/utils/cx";

const PULSE_MIN = 0.4;
const PULSE_MAX = 1;
const PULSE_DURATION_MS = 700;

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  className,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  className?: string;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(PULSE_MIN)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: PULSE_MAX, duration: PULSE_DURATION_MS, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: PULSE_MIN, duration: PULSE_DURATION_MS, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View accessibilityRole="progressbar" className={cx("bg-muted/20", className)} style={[{ width, height, borderRadius: radius, opacity }, style]} />;
}
