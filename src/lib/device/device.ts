import Constants from "expo-constants";
import { Platform } from "react-native";

export const device = { platform: Platform.OS, appVersion: Constants.expoConfig?.version ?? "0.0.0", locale: Constants.locale ?? "en" } as const;
