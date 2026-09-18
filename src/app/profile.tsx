import { Screen } from "@/components/layout/Screen";
import { Text } from "@/components/ui/Text";
import { useText } from "@/lib/i18n/locale";

export default function ProfileScreen() {
  const text = useText();
  return (
    <Screen>
      <Text className="text-4xl font-extrabold">{text({ id: "profile.title" })}</Text>
      <Text>{text({ id: "profile.replace" })}</Text>
    </Screen>
  );
}
