import { create, type StoreApi, type UseBoundStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Storage } from "../storage/types";
import { hydrationResult, type HydrationState } from "./hydration";
import { createZustandStorage } from "./persistStorage";

export type Reset = () => void;

export type PersistConfig<S> = {
  storage: Storage;
  name: string;
  version?: number;
  migrate?: (persisted: unknown, version: number) => S | Promise<S>;
  partialize?: (state: S) => Partial<S>;
};

export type StoreOptions<S> = {
  persist?: PersistConfig<S>;
  onHydration?: (state: HydrationState) => void;
};

export type AppStore<S> = UseBoundStore<StoreApi<S>> & { reset: Reset; initial: Partial<S> };

// Creates a Zustand store from an `initial` snapshot plus actions that may use set/get.
// Persistence (against our Storage interface) and reset are built in.
export type StoreConfig<S extends object> = {
  initial: Partial<S>;
  create: (set: (partial: Partial<S> | ((state: S) => Partial<S>)) => void, get: () => S) => Partial<S>;
};

export function createStore<S extends object>(config: StoreConfig<S>, options: StoreOptions<S> = {}): AppStore<S> {
  const initial = config.initial;
  const initializer = (set: (partial: Partial<S> | ((state: S) => Partial<S>)) => void, get: () => S): S => ({ ...config.initial, ...config.create(set, get) }) as S;

  const persistConfig = options.persist;
  const store = persistConfig
    ? create<S>()(
        persist(initializer, {
          name: persistConfig.name,
          storage: createJSONStorage(() => createZustandStorage(persistConfig.storage) as never),
          version: persistConfig.version ?? 0,
          ...(persistConfig.partialize ? { partialize: persistConfig.partialize } : {}),
          ...(persistConfig.migrate ? { migrate: persistConfig.migrate as never } : {}),
          onRehydrateStorage: () => (_state, error) => options.onHydration?.(hydrationResult(error ?? undefined)),
        }),
      )
    : create<S>()(initializer);

  // Reset only the state slice (actions remain); config.initial holds just the state fields.
  return Object.assign(store, { reset: () => store.setState(config.initial), initial });
}
