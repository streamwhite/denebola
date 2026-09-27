import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: "{{name}}",
  slug: "{{name}}",
  scheme: "myapp",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: { ...config.ios, bundleIdentifier: "com.example.{{name}}", supportsTablet: true },
  android: { ...config.android, package: "com.example.{{name}}" },
  web: { ...config.web, bundler: "metro" },
  plugins: ["expo-router", "expo-secure-store", "expo-splash-screen", "{{packageName}}"],
});
