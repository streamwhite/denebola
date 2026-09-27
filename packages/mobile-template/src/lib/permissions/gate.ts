import { isGranted, type PermissionStatus } from "./permission";
import type { PermissionName, PermissionService } from "./types";

export type PermissionExplainer = (name: PermissionName) => Promise<boolean>;

export type PermissionGateOptions = {
  service: PermissionService;
  explain?: PermissionExplainer;
};

export type PermissionGate = {
  status: (name: PermissionName) => Promise<PermissionStatus>;
  ensure: (name: PermissionName, explain?: PermissionExplainer) => Promise<PermissionStatus>;
  canUse: (name: PermissionName) => Promise<boolean>;
};

// Enforces "user action -> explain -> request -> handle status". An already-granted permission
// never triggers the explanation, so prompts only appear when they add information.
export function createPermissionGate({ service, explain }: PermissionGateOptions): PermissionGate {
  async function ensure(name: PermissionName, explainOverride?: PermissionExplainer): Promise<PermissionStatus> {
    const current = await service.get(name);
    if (isGranted(current)) return current;
    const explainer = explainOverride ?? explain;
    if (explainer && !(await explainer(name))) return "denied";
    return service.request(name);
  }

  return {
    status: (name) => service.get(name),
    ensure,
    canUse: async (name) => isGranted(await service.get(name)),
  };
}
