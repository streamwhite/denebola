import type { LifecycleState } from "./lifecycleState";

export type LaunchKind = "cold" | "warm" | "resume";

// First observed transition with no prior state is a cold start; resuming from background is
// warm; anything else (e.g. inactive -> active) is a resume.
export function classifyLaunch(previous: LifecycleState | null): LaunchKind {
  if (previous === null) return "cold";
  return previous === "background" ? "warm" : "resume";
}

export function createLaunchTracker(initialPrevious: LifecycleState | null = null) {
  const state = { previous: initialPrevious, kind: null as LaunchKind | null };
  return {
    observe(next: LifecycleState): LaunchKind {
      if (state.kind === null) state.kind = classifyLaunch(state.previous);
      state.previous = next;
      return state.kind;
    },
    kind: (): LaunchKind => state.kind ?? "cold",
  };
}
