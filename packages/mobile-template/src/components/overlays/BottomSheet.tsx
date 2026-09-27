import { Modal, Pressable, ScrollView, View, type ModalProps } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  dismissable = true,
  scrollable = false,
  className,
  ...props
}: Omit<ModalProps, "children"> & {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dismissable?: boolean;
  scrollable?: boolean;
  className?: string;
}) {
  const { tokens } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent {...props}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={dismissable ? onClose : undefined} className="flex-1 justify-end bg-black/50">
        <Pressable onPress={(event) => event.stopPropagation()} className={cx("max-h-[85%] gap-4 rounded-t-3xl bg-card p-6", className)} style={tokens.shadow.lg}>
          <View className="h-1 w-10 self-center rounded-full bg-border" />
          {title ? <Text variant="h4">{title}</Text> : null}
          {scrollable ? <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView> : children}
          {footer ? <View className="flex-row justify-end gap-3">{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
