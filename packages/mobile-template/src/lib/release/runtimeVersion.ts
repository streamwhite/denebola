// Runtime versioning: an OTA update is only safe when the update's runtime version
// matches the installed binary's runtime version ("runtimeVersion" in app config).
export type RuntimeVersionPolicy = "nativeVersion" | "sdkVersion" | "appVersion" | string;

export const DEFAULT_RUNTIME_VERSION_POLICY: RuntimeVersionPolicy = "nativeVersion";

export function resolveRuntimeVersion(policy: RuntimeVersionPolicy, appVersion: string): string {
  return policy === "nativeVersion" ? "1" : appVersion;
}

export function isRuntimeCompatible(binaryRuntime: string, updateRuntime: string): boolean {
  return binaryRuntime === updateRuntime;
}
