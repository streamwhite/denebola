import { describe, expect, it } from "vitest";
import { createQueryClient } from "@/lib/api/queryClient";
import { retryOnApiError } from "@/lib/query/queryClientCore";

describe("createQueryClient", () => {
  it("applies retry and cache defaults", () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions().queries?.retry).toBe(retryOnApiError);
    expect(client.getDefaultOptions().mutations?.retry).toBe(0);
    expect(client.getDefaultOptions().queries?.staleTime).toBeGreaterThan(0);
  });

  it("lets the application override individual defaults", () => {
    const client = createQueryClient({ defaultOptions: { queries: { retry: 5 } } });

    expect(client.getDefaultOptions().queries?.retry).toBe(5);
    expect(client.getDefaultOptions().queries?.staleTime).toBeGreaterThan(0);
  });
});
