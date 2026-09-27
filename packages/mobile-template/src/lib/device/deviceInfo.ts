import type { AppConfig } from "../config/appConfigCore";
import type { AppVersion } from "../version/appVersionCore";
import type { PlatformInfo } from "./platformInfo";

export type DeviceScreen = { width: number; height: number; scale: number };

export type DeviceInfo = {
  platform: PlatformInfo;
  app: AppConfig;
  version: AppVersion;
  locale: string;
  screen: DeviceScreen;
};

type DeviceInput = {
  platform: PlatformInfo;
  app: AppConfig;
  version: AppVersion;
  locale: string | null;
  screen: DeviceScreen;
};

export function readDeviceInfo(input: DeviceInput): DeviceInfo {
  return { ...input, locale: input.locale ?? "en" };
}
