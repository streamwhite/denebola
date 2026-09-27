import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { backoffDelay, runWithRetry, shouldRetry } from "@/lib/api/retry";

const policy = { attempts: 3, baseDelayMs: 100, maxDelayMs: 1_000 };
const noSleep = async () => undefined;

describe("backoffDelay", () => {
  it("grows exponentially and caps at maxDelayMs", () => {
    expect(backoffDelay(1, policy)).toBe(100);
    expect(backoffDelay(2, policy)).toBe(200);
    expect(backoffDelay(6, policy)).toBe(1_000);
  });
});

describe("shouldRetry", () => {
  it("retries network errors and 5xx, not 4xx", () => {
    expect(shouldRetry(new ApiError(0, "NETWORK_ERROR", "x"))).toBe(true);
    expect(shouldRetry(new ApiError(503, "X", "x"))).toBe(true);
    expect(shouldRetry(new ApiError(404, "X", "x"))).toBe(false);
    expect(shouldRetry(new Error("boom"))).toBe(false);
  });
});

describe("runWithRetry", () => {
  it("returns the first success without retrying", async () => {
    const run = vi.fn().mockResolvedValue("ok");
    await expect(runWithRetry(run, policy, noSleep)).resolves.toBe("ok");
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("retries retryable failures up to the attempt limit", async () => {
    const run = vi.fn().mockRejectedValue(new ApiError(503, "X", "x"));
    await expect(runWithRetry(run, policy, noSleep)).rejects.toBeInstanceOf(ApiError);
    expect(run).toHaveBeenCalledTimes(policy.attempts + 1);
  });

  it("stops immediately on a non-retryable failure", async () => {
    const run = vi.fn().mockRejectedValue(new ApiError(422, "X", "x"));
    await expect(runWithRetry(run, policy, noSleep)).rejects.toBeInstanceOf(ApiError);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
