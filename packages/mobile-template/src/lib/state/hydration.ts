export type HydrationStatus = "pending" | "hydrated" | "error";

export type HydrationState = { status: HydrationStatus; error?: unknown };

export const INITIAL_HYDRATION: HydrationState = { status: "pending" };

export function hydrationResult(error?: unknown): HydrationState {
  return error ? { status: "error", error } : { status: "hydrated" };
}

export function isHydrated(state: HydrationState): boolean {
  return state.status === "hydrated";
}
