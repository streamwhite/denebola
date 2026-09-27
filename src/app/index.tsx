import { Card, Screen, Text } from "@your-scope/mobile-template";

export default function HomeScreen() {
  return (
    <Screen>
      <Text className="text-4xl font-extrabold">Consumer App</Text>
      <Card>
        <Text>Built on @your-scope/mobile-template. Add your business screens under src/app.</Text>
      </Card>
    </Screen>
  );
}
