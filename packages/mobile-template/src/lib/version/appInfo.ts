import Constants from "expo-constants";
import { toAppVersion } from "./appVersionCore";

export const appVersion = toAppVersion(Constants.expoConfig);
