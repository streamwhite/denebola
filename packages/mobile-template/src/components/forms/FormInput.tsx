import { TextInput, type TextInputProps, View } from "react-native";
import { Text } from "../ui/Text";
import { cx } from "../../lib/utils/cx";

const baseClass = "min-h-12 rounded-lg border bg-card px-3.5 text-base text-foreground";

export function FormInput({ label, error, className, ...props }: TextInputProps & { label: string; error?: string; className?: string }) {
  return (
    <View className="gap-2">
      <Text className="font-semibold">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#68736c"
        className={cx(baseClass, error ? "border-destructive" : "border-border", className)}
        {...props}
      />
      {error ? <Text accessibilityRole="alert" className="text-[13px] text-destructive">{error}</Text> : null}
    </View>
  );
}
