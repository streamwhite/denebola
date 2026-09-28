import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: "{{name}}",
  slug: "{{name}}",
  scheme: "{{scheme}}",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: { ...config.ios, bundleIdentifier: "{{appId}}", supportsTablet: true },
  android: { ...config.android, package: "{{appId}}" },
  web: { ...config.web, bundler: "metro" },
  plugins: ["expo-router", "expo-secure-store", "expo-splash-screen", "{{packageName}}"],
});
