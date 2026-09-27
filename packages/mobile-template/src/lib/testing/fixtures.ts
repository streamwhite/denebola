export type Fixture<T> = (overrides?: Partial<T>) => T;

// Defines a reusable fixture: call it to get the defaults, pass overrides for variants.
export function defineFixture<T extends object>(defaults: T): Fixture<T> {
  return (overrides = {}) => ({ ...defaults, ...overrides });
}
