export type TerminationListener = () => void;

// Platform termination is best-effort (Android onDestroy / app kill hooks); injected so callers can
// flush state without depending on a specific native module.
export interface TerminationAdapter {
  subscribe(listener: TerminationListener): () => void;
}

export function createMemoryTerminationAdapter(): TerminationAdapter & { emit: () => void; count: () => number } {
  const listeners = new Set<TerminationListener>();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit() {
      for (const listener of listeners) listener();
    },
    count: () => listeners.size,
  };
}
