export type PublishedUpdate = { id: string; channel: string; runtimeVersion: string; createdAt: number };

export type RollbackTarget = { current: PublishedUpdate; target: PublishedUpdate } | null;

// Picks the last compatible update published before the current one on the same channel.
export function selectRollbackTarget(current: PublishedUpdate, history: readonly PublishedUpdate[]): RollbackTarget {
  const candidates = history
    .filter((entry) => entry.channel === current.channel && entry.runtimeVersion === current.runtimeVersion && entry.createdAt < current.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt);
  return candidates.length > 0 ? { current, target: candidates[0] } : null;
}
