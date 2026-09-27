import Constants from "expo-constants";
import { Dimensions } from "react-native";
import { appConfig } from "../config/appConfig";
import { appVersion } from "../version/appInfo";
import { readDeviceInfo } from "./deviceInfo";
import { platform } from "./platform";

const window = Dimensions.get("window");

export const device = readDeviceInfo({
  platform,
  app: appConfig,
  version: appVersion,
  locale: Constants.locale,
  screen: { width: window.width, height: window.height, scale: window.scale },
});
