import { Platform } from "react-native";
import { describePlatform } from "./platformInfo";

export const platform = describePlatform(Platform.OS, Platform.Version);
