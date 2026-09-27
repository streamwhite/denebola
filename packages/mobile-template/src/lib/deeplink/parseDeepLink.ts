export type DeepLinkConfig = { scheme: string; allowedPaths: RegExp[] };

export function parseDeepLink(value: string, config: DeepLinkConfig): { pathname: string } | null {
  try {
    const url = new URL(value);
    if (url.protocol !== `${config.scheme}:`) return null;
    const pathname = `/${url.hostname}${url.pathname}`.replace(/\/$/, "") || "/";
    return config.allowedPaths.some((pattern) => pattern.test(pathname)) ? { pathname } : null;
  } catch {
    return null;
  }
}
