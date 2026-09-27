export type PlatformSigningConfig = {
  platform: "ios" | "android";
  profile: string;
  credentialsSource: "remote" | "local";
};

export const DEFAULT_SIGNING_CONFIG: Record<"ios" | "android", PlatformSigningConfig> = {
  ios: { platform: "ios", profile: "production", credentialsSource: "remote" },
  android: { platform: "android", profile: "production", credentialsSource: "remote" },
};

// EAS keeps signing credentials remotely by default; a profile can opt into local credentials.
export function signingConfig(platform: "ios" | "android", credentialsSource: PlatformSigningConfig["credentialsSource"] = "remote"): PlatformSigningConfig {
  return { ...DEFAULT_SIGNING_CONFIG[platform], credentialsSource };
}
