import { getLifecycleState, subscribeToLifecycle } from "../lifecycle/appLifecycle";
import type { LifecycleState } from "../lifecycle/lifecycleState";

export type AppStateAdapter = {
  get: () => LifecycleState;
  subscribe: (listener: (state: LifecycleState) => void) => () => void;
};

// Thin adapter over the React Native AppState-backed lifecycle helpers, giving device code a
// single injectable surface for current state and transitions.
export function createAppStateAdapter(): AppStateAdapter {
  return { get: getLifecycleState, subscribe: subscribeToLifecycle };
}
