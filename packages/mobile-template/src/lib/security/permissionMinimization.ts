import { PERMISSION_NAMES, type PermissionName } from "../permissions/types";

export type PermissionUsage = Partial<Record<PermissionName, boolean>>;

// Only the permissions the app actually uses should be declared (minimum permissions).
export function minimalPermissionSet(used: PermissionUsage): PermissionName[] {
  return PERMISSION_NAMES.filter((name) => used[name] === true);
}

// Declared/requested permissions that have no recorded usage — candidates for removal.
export function excessPermissions(requested: readonly PermissionName[], used: PermissionUsage): PermissionName[] {
  return requested.filter((name) => used[name] !== true);
}
