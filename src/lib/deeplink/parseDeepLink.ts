const APP_SCHEME = "myapp:";
const ALLOWED_PATHS = [/^\/profile\/[^/]+$/, /^\/settings$/, /^\/home$/];

export function parseDeepLink(value: string): { pathname: string } | null {
  try {
    const url = new URL(value);
    if (`${url.protocol}` !== APP_SCHEME) return null;
    const pathname = `/${url.hostname}${url.pathname}`.replace(/\/$/, "") || "/home";
    return ALLOWED_PATHS.some((pattern) => pattern.test(pathname)) ? { pathname } : null;
  } catch {
    return null;
  }
}
