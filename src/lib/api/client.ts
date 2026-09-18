import { ApiError, normalizeApiError } from "@/lib/api/errors";

const REQUEST_TIMEOUT_MS = 15_000;

export type ApiClientOptions = { baseUrl: string; getToken?: () => Promise<string | null> };

export function createApiClient(options: ApiClientOptions) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const token = await options.getToken?.();
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const response = await fetch(`${options.baseUrl}${path}`, { ...init, headers, signal: controller.signal });
      if (!response.ok) throw await normalizeApiError(response);
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, "NETWORK_ERROR", "Network request failed");
    } finally {
      clearTimeout(timeout);
    }
  }
  return { request };
}
