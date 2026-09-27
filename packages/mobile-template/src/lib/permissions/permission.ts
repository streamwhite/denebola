export type PermissionStatus = "granted" | "denied" | "limited" | "undetermined";
export type PermissionHandle = { get: () => Promise<PermissionStatus>; request: () => Promise<PermissionStatus> };

export const PERMISSION_STATUSES: readonly PermissionStatus[] = ["granted", "denied", "limited", "undetermined"];

// "limited" (iOS partial photo/library access) is usable, so it counts as granted.
export function isGranted(status: PermissionStatus): boolean {
  return status === "granted" || status === "limited";
}

export async function requestPermissionStatus(permission: PermissionHandle, explain?: () => Promise<boolean>): Promise<PermissionStatus> {
  if (explain && !(await explain())) return "denied";
  return permission.request();
}

export async function requestPermission(permission: PermissionHandle, explain?: () => Promise<boolean>): Promise<boolean> {
  return isGranted(await requestPermissionStatus(permission, explain));
}
