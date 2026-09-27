export type NativePermissionName = "camera" | "photos" | "microphone" | "location" | "contacts" | "bluetooth" | "notifications";

// Maps each permission to its platform usage-description text.
export type NativePermissionConfig = Partial<Record<NativePermissionName, string>>;

export type NativeBuildConfig = {
  bundleIdentifier?: string;
  packageName?: string;
  buildNumber?: string;
  versionCode?: number;
};

export type NativeModuleConfig = { name: string; options?: Record<string, unknown> };

export type NativeConfig = {
  permissions: NativePermissionConfig;
  build: NativeBuildConfig;
  modules: NativeModuleConfig[];
};

export const DEFAULT_NATIVE_CONFIG: NativeConfig = { permissions: {}, build: {}, modules: [] };

export function normalizeNativeConfig(partial: Partial<NativeConfig> = {}): NativeConfig {
  return { permissions: partial.permissions ?? {}, build: partial.build ?? {}, modules: partial.modules ?? [] };
}

export function requestedNativePermissions(config: NativeConfig): NativePermissionName[] {
  return Object.keys(config.permissions) as NativePermissionName[];
}
