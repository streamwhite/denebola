import Constants from "expo-constants";
import { normalizeAppConfig } from "./appConfigCore";

export const appConfig = normalizeAppConfig(Constants.expoConfig);
