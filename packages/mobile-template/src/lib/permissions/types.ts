import type { PermissionStatus } from "./permission";

export type PermissionName = "camera" | "photos" | "notifications" | "location" | "microphone" | "contacts" | "bluetooth";

export const PERMISSION_NAMES: readonly PermissionName[] = ["camera", "photos", "notifications", "location", "microphone", "contacts", "bluetooth"];

export function isPermissionName(value: string): value is PermissionName {
  return (PERMISSION_NAMES as readonly string[]).includes(value);
}

export type PermissionService = {
  get: (name: PermissionName) => Promise<PermissionStatus>;
  request: (name: PermissionName) => Promise<PermissionStatus>;
};
