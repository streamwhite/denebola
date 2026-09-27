import "../../global.css";
import { Stack } from "expo-router";
import { MobileTemplateProvider } from "@your-scope/mobile-template";

export default function RootLayout() {
  return (
    <MobileTemplateProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MobileTemplateProvider>
  );
}
