import manifest from "../../../package.json";

// Capability modules the runtime package ships, each with its own schema version.
// A module's version is bumped when its public contract changes independently of the package.
export type FrameworkModule = { id: string; version: string };

export const MODULE_VERSIONS: readonly FrameworkModule[] = [
  { id: "core", version: "1" },
  { id: "api", version: "1" },
  { id: "auth", version: "1" },
  { id: "storage", version: "1" },
  { id: "i18n", version: "1" },
  { id: "navigation", version: "1" },
  { id: "native", version: "1" },
  { id: "release", version: "1" },
  { id: "testing", version: "1" },
];

export function moduleVersion(id: string): string | null {
  return MODULE_VERSIONS.find((module) => module.id === id)?.version ?? null;
}

export function listModuleVersions(): FrameworkModule[] {
  return MODULE_VERSIONS.map((module) => ({ ...module }));
}

export const frameworkVersion: string = manifest.version;
