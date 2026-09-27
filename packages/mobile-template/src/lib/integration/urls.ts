export type UrlPolicy = {
  schemes: readonly string[];
  hosts?: readonly string[];
  paths?: readonly RegExp[];
};

export function urlScheme(value: string): string | null {
  try {
    return new URL(value).protocol.replace(":", "");
  } catch {
    return null;
  }
}

function hostMatches(host: string, hosts: readonly string[]): boolean {
  const candidate = host.toLowerCase();
  return hosts.some((allowed) => {
    const base = allowed.toLowerCase();
    return candidate === base || candidate.endsWith(`.${base}`);
  });
}

// Validates an external URL against scheme/host/path rules before it is opened or routed.
// Host rules apply to http(s) only; custom schemes use their authority as an opaque target.
export function isAllowedUrl(value: string, policy: UrlPolicy): boolean {
  try {
    const url = new URL(value);
    const scheme = url.protocol.replace(":", "");
    if (!policy.schemes.includes(scheme)) return false;
    const isHttp = scheme === "https" || scheme === "http";
    if (policy.hosts && isHttp && !hostMatches(url.hostname, policy.hosts)) return false;
    if (policy.paths && !policy.paths.some((pattern) => pattern.test(url.pathname))) return false;
    return true;
  } catch {
    return false;
  }
}
