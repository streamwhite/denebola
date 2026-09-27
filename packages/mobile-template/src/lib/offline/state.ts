export type NetworkStatus = "online" | "offline" | "connecting" | "retrying" | "error";
export type OfflineQueueItem<T> = { id: string; payload: T; attempts: number; createdAt: number };
