import { Pressable } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { Text } from "@/components/ui/Text";
import { useLocale, useText } from "@/lib/i18n/locale";

export default function SettingsScreen() {
  const text = useText();
  const { locale, setLocale } = useLocale();
  return (
    <Screen>
      <Text className="text-4xl font-extrabold">{text({ id: "settings.title" })}</Text>
      <Text>{text({ id: "settings.language" })}</Text>
      <Pressable accessibilityRole="button" onPress={() => setLocale(locale === "en" ? "zh-CN" : "en")}>
        <Text className="py-3 text-lg font-bold text-primary">{locale === "en" ? "English" : "中文"}</Text>
      </Pressable>
      <Text>{text({ id: "settings.theme" })}</Text>
      <Text className="py-3 text-lg font-bold text-primary">{text({ id: "settings.system" })}</Text>
    </Screen>
  );
}
