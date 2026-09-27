import { AppState, type AppStateStatus } from "react-native";
import { type LifecycleState, toLifecycleState } from "./lifecycleState";

export function getLifecycleState(): LifecycleState {
  return toLifecycleState(AppState.currentState);
}

export function subscribeToLifecycle(onChange: (state: LifecycleState) => void) {
  const subscription = AppState.addEventListener("change", (status: AppStateStatus) => onChange(toLifecycleState(status)));
  return () => subscription.remove();
}
