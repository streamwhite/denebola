export type AppVersion = { marketing: string; build: string; runtime: string };

type RawVersion = {
  version?: string;
  runtimeVersion?: unknown;
  ios?: { buildNumber?: string };
  android?: { versionCode?: number };
};

export function toAppVersion(raw: RawVersion | null | undefined): AppVersion {
  const marketing = raw?.version ?? "0.0.0";
  const nativeBuild = raw?.ios?.buildNumber ?? (raw?.android?.versionCode != null ? String(raw.android.versionCode) : null);
  return {
    marketing,
    build: nativeBuild ?? "0",
    runtime: typeof raw?.runtimeVersion === "string" ? raw.runtimeVersion : marketing,
  };
}
