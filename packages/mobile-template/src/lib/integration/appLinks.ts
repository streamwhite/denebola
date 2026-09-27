import { isUniversalLink } from "../navigation/navigationCore";

// Android App Links and iOS Universal Links both resolve to verified https hosts.
export function isAppLink(value: string, hosts: readonly string[]): boolean {
  return isUniversalLink(value, hosts);
}

export function appLinkPath(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return `/${url.hostname}${url.pathname}`.replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
}
