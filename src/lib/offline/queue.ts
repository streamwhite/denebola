import type { OfflineQueueItem } from "@/lib/offline/state";

export function createSyncQueue<T>() {
  const items: OfflineQueueItem<T>[] = [];
  return { enqueue(payload: T) { const item = { id: `${Date.now()}-${items.length}`, payload, attempts: 0, createdAt: Date.now() }; items.push(item); return item.id; }, list: () => [...items], remove: (id: string) => { const index = items.findIndex((item) => item.id === id); if (index >= 0) items.splice(index, 1); } };
}
