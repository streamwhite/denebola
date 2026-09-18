import { AppState, type AppStateStatus } from "react-native";

export function subscribeToLifecycle(onChange: (status: AppStateStatus) => void) { const subscription = AppState.addEventListener("change", onChange); return () => subscription.remove(); }
