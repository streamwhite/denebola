import { Link } from "expo-router";
import { View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useText } from "@/lib/i18n/locale";

export default function HomeScreen() {
  const text = useText();
  return (
    <Screen>
      <View className="gap-2">
        <Text className="text-xs font-extrabold tracking-[2px] text-primary">{text({ id: "home.eyebrow" })}</Text>
        <Text className="text-4xl font-extrabold tracking-tight">{text({ id: "home.title" })}</Text>
        <Text className="text-lg leading-6 text-muted">{text({ id: "home.subtitle" })}</Text>
      </View>
      <Card>
        <Text className="mb-2 text-xl font-bold">{text({ id: "home.start" })}</Text>
        <Text>{text({ id: "home.foundation" })}</Text>
      </Card>
      <Link href="/profile">
        <Text className="py-2 text-[17px] font-bold text-primary">{text({ id: "home.profile" })}</Text>
      </Link>
      <Link href="/settings">
        <Text className="py-2 text-[17px] font-bold text-primary">{text({ id: "home.settings" })}</Text>
      </Link>
    </Screen>
  );
}
