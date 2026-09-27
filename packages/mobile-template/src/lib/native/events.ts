export type NativeEventListener<T = unknown> = (payload: T) => void;

// Contract for native -> JS event delivery (RN NativeEventEmitter / Expo EventEmitter).
export interface NativeEventBridge {
  addListener<T = unknown>(event: string, listener: NativeEventListener<T>): () => void;
  removeAllListeners(event?: string): void;
  emit<T = unknown>(event: string, payload: T): void;
}

export function createMemoryEventBridge(): NativeEventBridge {
  const listeners = new Map<string, Set<(payload: unknown) => void>>();
  return {
    addListener<T>(event: string, listener: NativeEventListener<T>) {
      const set = listeners.get(event) ?? new Set<(payload: unknown) => void>();
      const wrapped = listener as (payload: unknown) => void;
      set.add(wrapped);
      listeners.set(event, set);
      return () => {
        set.delete(wrapped);
      };
    },
    removeAllListeners(event?: string) {
      if (event) listeners.delete(event);
      else listeners.clear();
    },
    emit<T>(event: string, payload: T) {
      for (const listener of listeners.get(event) ?? []) listener(payload);
    },
  };
}
