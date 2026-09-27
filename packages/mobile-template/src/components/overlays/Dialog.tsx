import { Modal, View, type ModalProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";

export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  dismissable = true,
  className,
  ...props
}: Omit<ModalProps, "children"> & {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissable?: boolean;
  className?: string;
}) {
  const { tokens } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent {...props}>
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View accessibilityViewIsModal className={cx("w-full max-w-md gap-4 rounded-2xl bg-card p-6", className)} style={tokens.shadow.lg}>
          {title ? <Text variant="h4">{title}</Text> : null}
          {description ? (
            <Text tone="muted" variant="body">
              {description}
            </Text>
          ) : null}
          {children}
          {footer ? <View className="flex-row justify-end gap-3">{footer}</View> : null}
          <View
            accessibilityRole="button"
            accessibilityLabel="Close"
            onStartShouldSetResponder={() => dismissable}
            onResponderRelease={onClose}
            className="absolute right-3 top-3 h-8 w-8 items-center justify-center"
          >
            <Text tone="muted">✕</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
