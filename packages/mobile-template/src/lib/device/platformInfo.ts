export type PlatformInfo = {
  os: string;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isNative: boolean;
  version: string;
};

export function describePlatform(os: string, version: string | number): PlatformInfo {
  const normalized = os.toLowerCase();
  return {
    os: normalized,
    isIOS: normalized === "ios",
    isAndroid: normalized === "android",
    isWeb: normalized === "web",
    isNative: normalized !== "web",
    version: String(version),
  };
}
