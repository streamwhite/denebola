import type { Storage } from "./types";

export type RotatableSecret = { value: string; rotatedAt: number; version: number };

export const ROTATION_KEY_PREFIX = "rotation:";

export type KeyRotationOptions = {
  storage: Storage;
  currentVersion?: number;
  maxAgeMs?: number;
};

export function rotationKey(name: string): string {
  return `${ROTATION_KEY_PREFIX}${name}`;
}

export function isRotationDue(secret: RotatableSecret | null, maxAgeMs: number, now = Date.now()): boolean {
  if (!secret) return true;
  return now - secret.rotatedAt >= maxAgeMs;
}

// Stores a secret alongside its rotation metadata and re-encrypts on demand.
// `derive` produces the next value; the previous value is deleted after the new one is written,
// so a crash between writes leaves the old secret intact (no data loss on failure).
export function createKeyRotation({ storage, currentVersion = 1, maxAgeMs = 30 * 24 * 60 * 60 * 1_000 }: KeyRotationOptions) {
  async function read(name: string): Promise<RotatableSecret | null> {
    return storage.get<RotatableSecret>(rotationKey(name));
  }

  return {
    read,
    write(name: string, value: string, version = currentVersion): Promise<void> {
      return storage.set(rotationKey(name), { value, rotatedAt: Date.now(), version } satisfies RotatableSecret);
    },
    async rotate(name: string, derive: (current: RotatableSecret | null) => string | Promise<string>): Promise<RotatableSecret> {
      const current = await read(name);
      const next: RotatableSecret = { value: await derive(current), rotatedAt: Date.now(), version: (current?.version ?? currentVersion - 1) + 1 };
      await storage.set(rotationKey(name), next);
      return next;
    },
    async remove(name: string): Promise<void> {
      await storage.remove(rotationKey(name));
    },
    isDue: (secret: RotatableSecret | null, now?: number) => isRotationDue(secret, maxAgeMs, now),
  };
}

export type KeyRotation = ReturnType<typeof createKeyRotation>;
