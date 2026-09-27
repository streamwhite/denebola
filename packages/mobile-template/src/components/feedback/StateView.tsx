import { View } from "react-native";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import { cx } from "../../lib/utils/cx";

export function StateView({ title, action, className }: { title: string; action?: { label: string; onPress: () => void }; className?: string }) {
  return (
    <View className={cx("items-center gap-4 p-6", className)}>
      <Text className="text-center text-lg font-semibold">{title}</Text>
      {action ? <Button title={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}
