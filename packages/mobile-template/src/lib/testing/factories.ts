export type Factory<T> = (overrides?: Partial<T>) => T;

export function createSequence(start = 1): () => number {
  let current = start - 1;
  return () => {
    current += 1;
    return current;
  };
}

// Builds objects from an incrementing index so each instance is unique by default.
export function createFactory<T extends object>(build: (index: number) => T): Factory<T> {
  const next = createSequence(1);
  return (overrides = {}) => ({ ...build(next()), ...overrides });
}
