import type { PermissionHandle, PermissionStatus } from "./permission";
import { PERMISSION_NAMES, type PermissionName, type PermissionService } from "./types";

export type PermissionHandlers = Partial<Record<PermissionName, PermissionHandle>>;
export type PermissionStates = Partial<Record<PermissionName, PermissionStatus>>;

export function createMemoryPermissionHandle(initial: PermissionStatus = "undetermined", granted: PermissionStatus = "granted"): PermissionHandle {
  let status = initial;
  return {
    async get() { return status; },
    async request() { status = granted; return status; },
  };
}

// Maps permission names to injected platform handles so domain/UI code stays platform-free.
export function createPermissionService(handlers: PermissionHandlers = {}): PermissionService {
  return {
    get: async (name) => handlers[name]?.get() ?? "undetermined",
    request: async (name) => handlers[name]?.request() ?? "undetermined",
  };
}

export async function readPermissionStates(service: PermissionService, names: readonly PermissionName[] = PERMISSION_NAMES): Promise<PermissionStates> {
  const entries = await Promise.all(names.map(async (name) => [name, await service.get(name)] as const));
  return Object.fromEntries(entries) as PermissionStates;
}
