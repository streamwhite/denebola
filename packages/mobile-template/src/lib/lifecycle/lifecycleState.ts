export type LifecycleState = "active" | "background" | "inactive";

export function toLifecycleState(status: string): LifecycleState {
  if (status === "active") return "active";
  if (status === "background") return "background";
  return "inactive";
}
