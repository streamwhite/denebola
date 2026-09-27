import { describe, expect, it, vi } from "vitest";
import { createStore } from "@/lib/state/createStore";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

type Counter = { count: number; step: number; increment: () => void; add: (value: number) => void };
const initial = { count: 0, step: 1 };

function makeCounter(options?: Parameters<typeof createStore<Counter>>[1]) {
  return createStore<Counter>(
    {
      initial,
      create: (set, get) => ({
        increment: () => set({ count: get().count + get().step }),
        add: (value) => set({ count: get().count + value }),
      }),
    },
    options,
  );
}

describe("createStore", () => {
  it("merges initial state with actions and updates through them", () => {
    const store = makeCounter();

    expect(store.getState().count).toBe(0);
    store.getState().increment();
    store.getState().add(4);

    expect(store.getState().count).toBe(5);
    expect(store.getState().step).toBe(1);
  });

  it("resets back to the initial state", () => {
    const store = makeCounter();
    store.getState().add(10);

    store.reset();

    expect(store.getState().count).toBe(0);
    expect(store.getState().step).toBe(1);
  });

  it("persists selected state and rehydrates a new store", async () => {
    const storage = createMemoryStorage();
    const store = makeCounter({ persist: { storage, name: "counter", partialize: (state) => ({ count: state.count, step: state.step }) } });
    store.getState().add(7);
    await vi.waitFor(() => expect(storage.get("state:counter")).resolves.toMatchObject({ state: { count: 7 } }));

    const restored = makeCounter({ persist: { storage, name: "counter" } });
    await vi.waitFor(() => expect(restored.getState().count).toBe(7));
  });

  it("reports hydration through the callback", async () => {
    const storage = createMemoryStorage();
    await storage.set("state:counter", { state: { count: 3, step: 1 }, version: 0 });
    const onHydration = vi.fn();

    makeCounter({ persist: { storage, name: "counter" }, onHydration });

    await vi.waitFor(() => expect(onHydration).toHaveBeenCalledWith({ status: "hydrated" }));
  });
});
