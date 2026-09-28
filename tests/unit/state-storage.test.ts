import { describe, expect, it } from "vitest";
import { INITIAL_HYDRATION, hydrationResult, isHydrated } from "@/lib/state/hydration";
import { STATE_STORAGE_PREFIX, createZustandStorage, resetStateStorage } from "@/lib/state/persistStorage";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("hydration state", () => {
  it("starts pending and maps hydration outcomes", () => {
    expect(INITIAL_HYDRATION).toEqual({ status: "pending" });
    expect(hydrationResult()).toEqual({ status: "hydrated" });

    const error = new Error("broken");
    expect(hydrationResult(error)).toEqual({ status: "error", error });

    expect(isHydrated({ status: "hydrated" })).toBe(true);
    expect(isHydrated(INITIAL_HYDRATION)).toBe(false);
    expect(isHydrated({ status: "error" })).toBe(false);
  });
});

describe("createZustandStorage", () => {
  it("adapts Storage to the string-based Zustand contract", async () => {
    const storage = createMemoryStorage();
    const zustand = createZustandStorage(storage);

    await expect(zustand.getItem("cart")).resolves.toBeNull();

    await zustand.setItem("cart", JSON.stringify({ items: ["a"] }));
    expect(await storage.get(`${STATE_STORAGE_PREFIX}cart`)).toEqual({ items: ["a"] });
    await expect(zustand.getItem("cart")).resolves.toBe(JSON.stringify({ items: ["a"] }));

    await zustand.removeItem("cart");
    expect(await storage.get(`${STATE_STORAGE_PREFIX}cart`)).toBeNull();
  });

  it("clears persisted state through resetStateStorage", async () => {
    const storage = createMemoryStorage();
    await createZustandStorage(storage).setItem("cart", JSON.stringify({ items: [] }));

    await resetStateStorage(storage);

    expect(await storage.get(`${STATE_STORAGE_PREFIX}cart`)).toBeNull();
  });
});
