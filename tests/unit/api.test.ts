import { describe, expect, it } from "vitest";
import { ApiError, normalizeApiError } from "@/lib/api/errors";

describe("normalizeApiError", () => {
  it("normalizes an HTTP response into a retryable API error", async () => {
    const error = await normalizeApiError(new Response(JSON.stringify({ code: "TEMPORARY", message: "Try later" }), { status: 503 }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(503);
    expect(error.code).toBe("TEMPORARY");
    expect(error.retryable).toBe(true);
  });
});
