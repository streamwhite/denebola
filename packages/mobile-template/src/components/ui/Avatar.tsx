import { Image, View, type ViewProps } from "react-native";
import type { TypographyVariant } from "../../lib/theme/tokens";
import { cx } from "../../lib/utils/cx";
import { Text } from "./Text";

export type AvatarSize = "sm" | "md" | "lg";

const sizePx: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 64 };
const sizeText: Record<AvatarSize, TypographyVariant> = { sm: "caption", md: "label", lg: "h4" };

export function Avatar({ source, name, size = "md", className, ...props }: ViewProps & { source?: string; name?: string; size?: AvatarSize; className?: string }) {
  const dimension = sizePx[size];
  const initials = name ? name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") : "";
  return (
    <View
      accessibilityLabel={name}
      className={cx("items-center justify-center overflow-hidden rounded-full bg-muted/20", className)}
      style={{ width: dimension, height: dimension }}
      {...props}
    >
      {source ? (
        <Image source={{ uri: source }} style={{ width: dimension, height: dimension }} accessibilityIgnoresInvertColors />
      ) : (
        <Text variant={sizeText[size]} className="font-semibold">
          {initials}
        </Text>
      )}
    </View>
  );
}
