import { toQueryString, type QueryValue } from "../api/queryString";

export type QueryParams = Record<string, QueryValue>;

export function buildPath(path: string, params?: QueryParams): string {
  const query = toQueryString(params ?? {});
  if (!query) return path;
  return path.includes("?") ? `${path}&${query.slice(1)}` : `${path}${query}`;
}

export function buildDeepLink(scheme: string, path: string, params?: QueryParams): string {
  return `${scheme}://${path.replace(/^\/+/, "")}${toQueryString(params ?? {})}`;
}

export function buildUniversalLink(host: string, path: string, params?: QueryParams): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `https://${host}${normalized}${toQueryString(params ?? {})}`;
}

export function isUniversalLink(value: string, hosts: readonly string[]): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return hosts.some((allowed) => {
      const candidate = allowed.toLowerCase();
      return host === candidate || host.endsWith(`.${candidate}`);
    });
  } catch {
    return false;
  }
}

function normalizeRoute(path: string): string {
  return path === "/" ? "/" : path.replace(/\/+$/, "");
}

export function isRouteActive(pathname: string, target: string): boolean {
  const current = normalizeRoute(pathname);
  const goal = normalizeRoute(target);
  return current === goal || current.startsWith(`${goal}/`);
}

export function routeKey(segments: readonly string[]): string {
  return segments.filter(Boolean).join("/");
}
