import { createPermissionService, type PermissionHandlers } from "../permissions/registry";
import type { PermissionName, PermissionService } from "../permissions/types";

// Permission service that records which permissions were requested.
export function createMockPermissionService(handlers: PermissionHandlers = {}): PermissionService & { requests: () => PermissionName[] } {
  const requests: PermissionName[] = [];
  const service = createPermissionService(handlers);
  return {
    requests: () => [...requests],
    get: service.get,
    request: async (name) => {
      requests.push(name);
      return service.request(name);
    },
  };
}
