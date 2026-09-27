export type NetworkSecurityPolicy = {
  allowCleartext: boolean;
  pinnedHosts: readonly string[];
};

export type NetworkSecurityReason = "cleartext" | "not-https";

export type NetworkSecurityDecision = { allowed: true } | { allowed: false; reason: NetworkSecurityReason };

export const DEFAULT_NETWORK_SECURITY_POLICY: NetworkSecurityPolicy = { allowCleartext: false, pinnedHosts: [] };

export function isHostPinned(host: string, pinnedHosts: readonly string[]): boolean {
  const candidate = host.toLowerCase();
  return pinnedHosts.some((allowed) => {
    const base = allowed.toLowerCase();
    return candidate === base || candidate.endsWith(`.${base}`);
  });
}

// Blocks cleartext and non-https transport unless explicitly allowed.
export function evaluateNetworkSecurity(url: string, policy: NetworkSecurityPolicy): NetworkSecurityDecision {
  try {
    const { protocol } = new URL(url);
    if (protocol === "https:") return { allowed: true };
    if (protocol === "http:" && policy.allowCleartext) return { allowed: true };
    return { allowed: false, reason: protocol === "http:" ? "cleartext" : "not-https" };
  } catch {
    return { allowed: false, reason: "not-https" };
  }
}

// Contract for applying transport security at runtime (certificate pinning, cleartext policy).
export interface NetworkSecurityAdapter {
  apply(policy: NetworkSecurityPolicy): Promise<void>;
}

export function createMemoryNetworkSecurityAdapter(): NetworkSecurityAdapter & { current: () => NetworkSecurityPolicy | null } {
  const state: { policy: NetworkSecurityPolicy | null } = { policy: null };
  return {
    async apply(policy) {
      state.policy = policy;
    },
    current: () => state.policy,
  };
}
