import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { Bootstrap } from "@/providers/Bootstrap";
import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <AppErrorBoundary>
        <Bootstrap>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </Bootstrap>
      </AppErrorBoundary>
    </AppProviders>
  );
}
