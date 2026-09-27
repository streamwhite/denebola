export type FeatureFlags = Record<string, boolean>;

export const defaultFeatureFlags: FeatureFlags = {
  newHome: true,
  notifications: false,
  offlineMode: false,
};

export function createFeatureFlags(overrides: FeatureFlags = {}): FeatureFlags {
  return { ...defaultFeatureFlags, ...overrides };
}
