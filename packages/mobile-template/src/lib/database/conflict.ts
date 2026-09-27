export type Timestamped = { updatedAt: number };

export type ConflictStrategy = "client-wins" | "server-wins" | "last-write-wins";

export function lastWriteWins<T extends Timestamped>(client: T, server: T): T {
  return client.updatedAt >= server.updatedAt ? client : server;
}

// Resolves a local/remote divergence. `last-write-wins` relies on `updatedAt`; use `resolveWith`
// when the merge needs domain rules instead of a whole-record winner.
export function resolveConflict<T extends Timestamped>(client: T, server: T, strategy: ConflictStrategy = "last-write-wins"): T {
  if (strategy === "client-wins") return client;
  if (strategy === "server-wins") return server;
  return lastWriteWins(client, server);
}

export function resolveWith<T>(client: T, server: T, merge: (client: T, server: T) => T): T {
  return merge(client, server);
}
