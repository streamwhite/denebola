export type Capability = "secureStorage" | "network" | "notifications" | "deepLinks" | "filesystem";
export type MobilePlugin = { id: string; name: string; capabilities: Capability[]; initialize: () => void | Promise<unknown> };
