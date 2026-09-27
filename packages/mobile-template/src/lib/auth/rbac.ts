import type { Permission, Role, User } from "./types";

export type AccessPrincipal = Pick<User, "roles" | "permissions">;

export function hasRole(principal: AccessPrincipal | null | undefined, role: Role): boolean {
  return Boolean(principal?.roles?.includes(role));
}

export function hasPermission(principal: AccessPrincipal | null | undefined, permission: Permission): boolean {
  return Boolean(principal?.permissions?.includes(permission));
}

export function hasAnyRole(principal: AccessPrincipal | null | undefined, roles: readonly Role[]): boolean {
  return roles.some((role) => hasRole(principal, role));
}

export function hasAllPermissions(principal: AccessPrincipal | null | undefined, permissions: readonly Permission[]): boolean {
  return permissions.every((permission) => hasPermission(principal, permission));
}

export type AccessRequirement = { roles?: readonly Role[]; permissions?: readonly Permission[] };

// Grants access when the principal satisfies every specified dimension.
// Roles are an OR within their list; permissions are AND (all required).
export function can(principal: AccessPrincipal | null | undefined, requirement: AccessRequirement): boolean {
  if (!principal) return false;
  if (requirement.roles && requirement.roles.length > 0 && !hasAnyRole(principal, requirement.roles)) return false;
  if (requirement.permissions && requirement.permissions.length > 0 && !hasAllPermissions(principal, requirement.permissions)) return false;
  return true;
}

export function canAny(principal: AccessPrincipal | null | undefined, requirements: readonly AccessRequirement[]): boolean {
  return requirements.some((requirement) => can(principal, requirement));
}
