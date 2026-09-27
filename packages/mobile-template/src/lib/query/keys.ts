export type QueryKey = readonly unknown[];

export type QueryKeyFactory<Scope extends string> = {
  all: readonly [Scope];
  list: (filters?: Record<string, unknown>) => QueryKey;
  infinite: (filters?: Record<string, unknown>) => QueryKey;
  detail: (id: string | number) => readonly [Scope, "detail", string | number];
  update: (id: string | number) => QueryKey;
};

function compact(filters?: Record<string, unknown>): Record<string, unknown> {
  if (!filters) return {};
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

export function createQueryKeys<Scope extends string>(scope: Scope): QueryKeyFactory<Scope> {
  return {
    all: [scope] as const,
    list: (filters) => [scope, "list", compact(filters)] as const,
    infinite: (filters) => [scope, "infinite", compact(filters)] as const,
    detail: (id) => [scope, "detail", id] as const,
    update: (id) => [scope, "detail", id] as const,
  };
}

export function isQueryKeyInScope(key: QueryKey | undefined, scope: string): boolean {
  return Array.isArray(key) && key[0] === scope;
}
