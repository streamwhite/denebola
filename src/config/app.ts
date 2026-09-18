export const APP_CONFIG = {
  name: "Expo Mobile Template",
  scheme: "myapp",
  defaultLocale: "en",
  supportedLocales: ["en", "zh-CN"],
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://example.invalid/api",
} as const;
