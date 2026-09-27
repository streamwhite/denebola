import { ApiError, normalizeApiError, normalizeNetworkError } from "./errors";
import { toQueryString } from "./queryString";
import { CORRELATION_ID_HEADER, createRequestId, REQUEST_ID_HEADER } from "./requestId";
import { DEFAULT_RETRY, runWithRetry, type RetryPolicy } from "./retry";
import type { ApiRequestContext, ApiRequestOptions, ApiResponse } from "./types";

const REQUEST_TIMEOUT_MS = 15_000;
const UNAUTHORIZED = 401;
const EMPTY_STATUS = 204;

export type ApiResponseInfo = { path: string; status: number; headers: Headers; requestId: string };

export type AuthTokens = { token: string; refreshToken?: string } | null;

export type ApiClientOptions = {
  baseUrl: string;
  /** Returns the current bearer token, or null when unauthenticated. */
  getToken?: () => Promise<string | null>;
  /** Exchanges an expired token for a fresh one; return null to give up (surfaces 401). */
  refreshToken?: () => Promise<string | null>;
  locale?: () => string | null;
  getCorrelationId?: () => string | null;
  defaultHeaders?: HeadersInit;
  timeoutMs?: number;
  retry?: RetryPolicy | false;
  fetch?: typeof fetch;
  onResponse?: (info: ApiResponseInfo) => void;
  after?: (info: ApiResponseInfo) => void | Promise<void>;
};

function urlOf(baseUrl: string, path: string, query?: ApiRequestOptions["query"]): string {
  const search = query ? toQueryString(query) : "";
  const [pathPart, existing] = path.split("?");
  if (!search) return `${baseUrl}${path}`;
  return `${baseUrl}${pathPart}${existing ? `&${search.slice(1)}` : search}`;
}

async function parseBody<T>(response: Response, expect: ApiRequestOptions["expect"]): Promise<T> {
  if (expect === "none" || response.status === EMPTY_STATUS) return undefined as T;
  if (expect === "text") return (await response.text()) as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function createApiClient(options: ApiClientOptions) {
  const defaultTimeout = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const doFetch = options.fetch ?? fetch;

  function retryPolicyFor(retry: ApiRequestOptions["retry"]): RetryPolicy | null {
    if (retry === false) return null;
    if (retry === true || retry === undefined) return options.retry === false ? null : (options.retry ?? DEFAULT_RETRY);
    return retry;
  }

  async function send<T>(path: string, request: ApiRequestOptions, ctx: ApiRequestContext): Promise<{ response: Response; requestId: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? defaultTimeout);
    const onExternalAbort = () => controller.abort();
    request.signal?.addEventListener("abort", onExternalAbort);
    try {
      const headers = new Headers(options.defaultHeaders);
      new Headers(request.headers).forEach((value, key) => headers.set(key, value));
      headers.set("Accept", "application/json");
      headers.set(REQUEST_ID_HEADER, ctx.requestId);
      if (ctx.correlationId) headers.set(CORRELATION_ID_HEADER, ctx.correlationId);
      const locale = options.locale?.();
      if (locale) headers.set("Accept-Language", locale);
      if (request.body && !headers.has("Content-Type") && !(request.body instanceof FormData)) headers.set("Content-Type", "application/json");
      if (!request.skipAuth) {
        const token = await options.getToken?.();
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      const response = await doFetch(ctx.url, { method: request.method ?? "GET", headers, body: request.body ?? null, signal: controller.signal });
      return { response, requestId: response.headers.get(REQUEST_ID_HEADER) ?? ctx.requestId };
    } catch (error) {
      if (request.signal?.aborted) throw new ApiError(0, "REQUEST_ABORTED", "Request was cancelled");
      throw normalizeNetworkError(error, timeout !== null);
    } finally {
      clearTimeout(timeout);
      request.signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  async function attempt<T>(path: string, request: ApiRequestOptions, attemptNumber: number): Promise<ApiResponse<T>> {
    const requestId = request.requestId ?? createRequestId();
    const correlationId = request.correlationId ?? options.getCorrelationId?.() ?? undefined;
    const url = urlOf(options.baseUrl, path, request.query);
    const { response, requestId: resolvedId } = await send<T>(path, request, { requestId, correlationId, attempt: attemptNumber, url });

    if (response.status === UNAUTHORIZED && request.authRetry !== false && options.refreshToken) {
      const refreshed = await options.refreshToken().catch(() => null);
      if (refreshed) return attempt<T>(path, { ...request, authRetry: false, requestId }, attemptNumber + 1);
    }
    options.onResponse?.({ path, status: response.status, headers: response.headers, requestId: resolvedId });
    await options.after?.({ path, status: response.status, headers: response.headers, requestId: resolvedId });
    if (!response.ok) throw await normalizeApiError(response, resolvedId);
    return { data: await parseBody<T>(response, request.expect), status: response.status, headers: response.headers, requestId: resolvedId };
  }

  async function request<T>(path: string, request: ApiRequestOptions = {}): Promise<T> {
    const policy = retryPolicyFor(request.retry);
    const run = (attemptNumber: number) => attempt<T>(path, request, attemptNumber);
    if (!policy || request.signal) return (await run(1)).data;
    return (await runWithRetry(run, policy)).data;
  }

  async function requestWithMeta<T>(path: string, request: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const policy = retryPolicyFor(request.retry);
    const run = (attemptNumber: number) => attempt<T>(path, request, attemptNumber);
    if (!policy || request.signal) return run(1);
    return runWithRetry(run, policy);
  }

  return { request, requestWithMeta };
}

export type ApiClient = ReturnType<typeof createApiClient>;
