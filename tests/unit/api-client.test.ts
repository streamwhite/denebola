import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from "@/lib/api/requestId";

const noRetry = { retry: false as const };

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" }, ...init });
}

function clientWith(fetchImpl: typeof fetch, options: Record<string, unknown> = {}) {
  return createApiClient({ baseUrl: "https://api.test", fetch: fetchImpl, retry: false, ...options });
}

describe("createApiClient", () => {
  it("sends the request id, correlation id, accept-language and bearer token", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    const client = clientWith(fetchMock as unknown as typeof fetch, {
      getToken: async () => "token-1",
      locale: () => "zh-CN",
      getCorrelationId: () => "corr-1",
    });

    await client.request("/orders");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(url).toBe("https://api.test/orders");
    expect(headers.get(REQUEST_ID_HEADER)).toBeTruthy();
    expect(headers.get(CORRELATION_ID_HEADER)).toBe("corr-1");
    expect(headers.get("Accept-Language")).toBe("zh-CN");
    expect(headers.get("Authorization")).toBe("Bearer token-1");
  });

  it("appends query parameters", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({}));
    const client = clientWith(fetchMock as unknown as typeof fetch);

    await client.request("/orders", { query: { page: 2, q: "ada", cursor: null } });

    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe("https://api.test/orders?page=2&q=ada");
  });

  it("refreshes the token once on 401 and retries the request", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 401 })).mockResolvedValueOnce(jsonResponse({ ok: true }));
    const refreshToken = vi.fn(async () => "fresh-token");
    let token = "expired";
    const client = clientWith(fetchMock as unknown as typeof fetch, { getToken: async () => token, refreshToken });

    const data = await client.request<{ ok: boolean }>("/me");

    expect(data).toEqual({ ok: true });
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect((fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].headers).toBeInstanceOf(Headers);
    token = "fresh-token";
  });

  it("normalizes non-ok responses into ApiError with the request id", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ code: "NOT_FOUND", message: "Missing" }), { status: 404, headers: { [REQUEST_ID_HEADER]: "srv-9" } }));
    const client = clientWith(fetchMock as unknown as typeof fetch);

    await expect(client.request("/orders/1")).rejects.toMatchObject({ status: 404, code: "NOT_FOUND", requestId: "srv-9" });
  });

  it("reports a cancellation as REQUEST_ABORTED", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = vi.fn(async () => {
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });
    const client = clientWith(fetchMock as unknown as typeof fetch);

    await expect(client.request("/orders", { signal: controller.signal })).rejects.toMatchObject({ code: "REQUEST_ABORTED" });
  });

  it("retries 5xx responses when a retry policy is set", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 503 })).mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = createApiClient({ baseUrl: "https://api.test", fetch: fetchMock as unknown as typeof fetch, retry: { attempts: 1, baseDelayMs: 1, maxDelayMs: 1 } });

    await expect(client.request("/health")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("exposes response metadata through requestWithMeta", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: 1 }, { status: 201 }));
    const client = clientWith(fetchMock as unknown as typeof fetch);

    const result = await client.requestWithMeta<{ id: number }>("/orders", { method: "POST", body: "{}" });

    expect(result).toMatchObject({ data: { id: 1 }, status: 201 });
    expect(result.headers).toBeInstanceOf(Headers);
  });

  it("treats 204 responses as undefined data", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const client = clientWith(fetchMock as unknown as typeof fetch);

    await expect(client.request("/orders/1", { method: "DELETE" })).resolves.toBeUndefined();
  });
});
