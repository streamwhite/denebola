import { createSyncQueue, type Storage } from "{{packageName}}";
import { api } from "./api";

export type PendingWrite = { path: string; body: string };

// Offline mutation queue: enqueue writes while offline and replay them on reconnect.
// Pass a Storage (e.g. secureStorage-adjacent key/value store) to persist across launches.
export function createWriteQueue(storage?: Storage) {
  return createSyncQueue<PendingWrite>({
    storage,
    process: (write) => api.request(write.path, { method: "POST", body: write.body, retry: false, expect: "none" }),
  });
}
