import type { PlatformInfo } from "./platformInfo";

export type OsInfo = { name: string; version: string; build: string | null };

export function readOsInfo(platform: PlatformInfo, build: string | null = null): OsInfo {
  return { name: platform.os, version: platform.version, build };
}
