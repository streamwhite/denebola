import { useRouter } from "expo-router";
import { Button, Card, Screen, Text, useNetwork, useText } from "{{packageName}}";

export function HomeScreen() {
  const text = useText();
  const router = useRouter();
  const { isOnline } = useNetwork();
  return (
    <Screen>
      <Text variant="h1" className="font-extrabold">
        {text({ id: "home.title" })}
      </Text>
      <Card>
        <Text>{text({ id: "home.subtitle" })}</Text>
        <Text tone={isOnline ? "muted" : "destructive"}>{text({ id: isOnline ? "home.online" : "home.offline" })}</Text>
      </Card>
      <Button title={text({ id: "home.settings" })} onPress={() => router.push("/settings")} />
    </Screen>
  );
}
