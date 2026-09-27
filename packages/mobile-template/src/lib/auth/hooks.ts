import { useAuth } from "./AuthProvider";
import type { AccessRequirement } from "./rbac";
import type { Permission, Role } from "./types";

export function useUser() {
  return useAuth().user;
}

export function useIsAuthenticated(): boolean {
  return useAuth().status === "authenticated";
}

export function useCan(requirement: AccessRequirement): boolean {
  return useAuth().can(requirement);
}

export function useHasRole(role: Role): boolean {
  return useAuth().hasRole(role);
}

export function useHasPermission(permission: Permission): boolean {
  return useAuth().hasPermission(permission);
}

// Returns a redirect target when the current user fails `when`, otherwise null.
// Pair with <RouteGuard when={useAuthGuard(requirement) === null} redirectTo={...}>.
export function useAuthGuard(requirement?: AccessRequirement): string | null {
  const { status, can } = useAuth();
  if (status === "loading") return null;
  if (status !== "authenticated") return "/login";
  if (requirement && !can(requirement)) return "/unauthorized";
  return null;
}
