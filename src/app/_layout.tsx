import "../../global.css";
import { Stack } from "expo-router";
import { MobileTemplateProvider } from "denebola";

export default function RootLayout() {
  return (
    <MobileTemplateProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MobileTemplateProvider>
  );
}
