import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { DEFAULT_STALE_TIME_MS, queryDefaults, QUERY_RETRY_ATTEMPTS, retryOnApiError } from "@/lib/query/queryClientCore";

describe("retryOnApiError", () => {
  it("retries network errors and 5xx until the attempt limit", () => {
    expect(retryOnApiError(0, new ApiError(0, "NETWORK_ERROR", "x"))).toBe(true);
    expect(retryOnApiError(1, new ApiError(503, "X", "x"))).toBe(true);
    expect(retryOnApiError(QUERY_RETRY_ATTEMPTS, new ApiError(503, "X", "x"))).toBe(false);
  });

  it("never retries 4xx and retries unknown errors", () => {
    expect(retryOnApiError(0, new ApiError(404, "X", "x"))).toBe(false);
    expect(retryOnApiError(0, new Error("boom"))).toBe(true);
  });
});

describe("queryDefaults", () => {
  it("sets cache, refetch and retry defaults", () => {
    const defaults = queryDefaults();

    expect(defaults.queries?.staleTime).toBe(DEFAULT_STALE_TIME_MS);
    expect(defaults.queries?.refetchOnReconnect).toBe(true);
    expect(defaults.queries?.retry).toBe(retryOnApiError);
    expect(defaults.mutations?.retry).toBe(0);
  });
});
