import type { AppEnvironment } from "../config/environment";

export type ReleaseProfile = "development" | "preview" | "production";

export const RELEASE_PROFILES: readonly ReleaseProfile[] = ["development", "preview", "production"];

export type ReleaseProfileConfig = {
  profile: ReleaseProfile;
  channel: string;
  environment: AppEnvironment;
  distribution: "internal" | "store";
  developmentClient: boolean;
};

export const RELEASE_PROFILE_CONFIG: Record<ReleaseProfile, ReleaseProfileConfig> = {
  development: { profile: "development", channel: "development", environment: "development", distribution: "internal", developmentClient: true },
  preview: { profile: "preview", channel: "staging", environment: "preview", distribution: "internal", developmentClient: false },
  production: { profile: "production", channel: "production", environment: "production", distribution: "store", developmentClient: false },
};

export function isReleaseProfile(value: string): value is ReleaseProfile {
  return (RELEASE_PROFILES as readonly string[]).includes(value);
}

export function resolveReleaseProfile(value: string | undefined): ReleaseProfileConfig | null {
  return value && isReleaseProfile(value) ? RELEASE_PROFILE_CONFIG[value] : null;
}
