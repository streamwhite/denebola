import { isRuntimeCompatible } from "./runtimeVersion";

export type UpdateChannel = "development" | "staging" | "production";

export type OtaUpdate = {
  channel: UpdateChannel;
  runtimeVersion: string;
  createdAt: number;
  rollback?: boolean;
};

export type UpdateDecision = { allowed: boolean; reason: "ok" | "channel-mismatch" | "runtime-mismatch" | "rollback" };

// Decides whether an OTA update may be applied to a binary on a given channel/runtime.
export function decideUpdate(binary: { channel: UpdateChannel; runtimeVersion: string }, update: OtaUpdate): UpdateDecision {
  if (update.rollback) return { allowed: true, reason: "rollback" };
  if (update.channel !== binary.channel) return { allowed: false, reason: "channel-mismatch" };
  if (!isRuntimeCompatible(binary.runtimeVersion, update.runtimeVersion)) return { allowed: false, reason: "runtime-mismatch" };
  return { allowed: true, reason: "ok" };
}
