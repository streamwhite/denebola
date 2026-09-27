import "../../global.css";
import { Stack } from "expo-router";
import { MobileTemplateProvider } from "{{packageName}}";
import { api } from "../lib/api";
import { appMessages } from "../messages";

export default function RootLayout() {
  return (
    <MobileTemplateProvider locale={{ source: appMessages }} apiClient={api}>
      <Stack screenOptions={{ headerShown: false }} />
    </MobileTemplateProvider>
  );
}
