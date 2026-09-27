import { useState } from "react";
import { View, type ViewProps } from "react-native";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";

export function Tooltip({ label, children, placement = "top", className, ...props }: ViewProps & { label: string; children: React.ReactNode; placement?: "top" | "bottom"; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View className={cx("relative", className)} {...props}>
      <View
        accessibilityLabel={label}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => setOpen((value) => !value)}
      >
        {children}
      </View>
      {open ? (
        <View
          className={cx(
            "absolute z-10 min-w-[120px] max-w-[240px] self-center rounded-lg bg-foreground px-3 py-2",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
          pointerEvents="none"
        >
          <Text variant="caption" className="text-background">
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
