export type AppConfig = {
  name: string;
  slug: string;
  scheme: string;
  version: string;
  sdkVersion: string;
  bundleId: string;
  packageName: string;
};

type RawAppConfig = {
  name?: string;
  slug?: string;
  scheme?: string | string[];
  version?: string;
  sdkVersion?: string;
  ios?: { bundleIdentifier?: string };
  android?: { package?: string };
};

export function normalizeAppConfig(raw: RawAppConfig | null | undefined): AppConfig {
  const scheme = Array.isArray(raw?.scheme) ? raw.scheme[0] : raw?.scheme;
  return {
    name: raw?.name ?? "",
    slug: raw?.slug ?? "",
    scheme: scheme ?? "",
    version: raw?.version ?? "0.0.0",
    sdkVersion: raw?.sdkVersion ?? "",
    bundleId: raw?.ios?.bundleIdentifier ?? "",
    packageName: raw?.android?.package ?? "",
  };
}
