import { Card, Screen, Text } from "denebola";

export default function HomeScreen() {
  return (
    <Screen>
      <Text className="text-4xl font-extrabold">Consumer App</Text>
      <Card>
        <Text>Built on denebola. Add your business screens under src/app.</Text>
      </Card>
    </Screen>
  );
}
