export type Entity = { id: string };

export type TableAdapter<T extends Entity> = {
  get(id: string): Promise<T | null>;
  all(): Promise<T[]>;
  put(entity: T): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
};

export type Repository<T extends Entity> = {
  get: (id: string) => Promise<T | null>;
  list: () => Promise<T[]>;
  save: (entity: T) => Promise<void>;
  saveMany: (entities: T[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

export function createMemoryTableAdapter<T extends Entity>(): TableAdapter<T> {
  const rows = new Map<string, T>();
  return {
    async get(id) { return rows.get(id) ?? null; },
    async all() { return [...rows.values()]; },
    async put(entity) { rows.set(entity.id, entity); },
    async remove(id) { rows.delete(id); },
    async clear() { rows.clear(); },
  };
}

// Storage-agnostic local repository. Inject a TableAdapter backed by SQLite, a KV store or
// memory; callers depend only on this CRUD surface.
export function createRepository<T extends Entity>(adapter: TableAdapter<T>): Repository<T> {
  return {
    get: (id) => adapter.get(id),
    list: () => adapter.all(),
    save: (entity) => adapter.put(entity),
    saveMany: (entities) => Promise.all(entities.map((entity) => adapter.put(entity))).then(() => undefined),
    remove: (id) => adapter.remove(id),
    clear: () => adapter.clear(),
  };
}
