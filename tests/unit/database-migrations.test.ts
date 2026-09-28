import { describe, expect, it, vi } from "vitest";
import { migrate, type Migration } from "@/lib/database/migrations";

function database(version = 0) {
  let current = version;
  return {
    getVersion: vi.fn(async () => current),
    setVersion: vi.fn(async (next: number) => {
      current = next;
    }),
    version: () => current,
  };
}

function migration(version: number, log: number[]): Migration {
  return {
    version,
    up: async () => {
      log.push(version);
    },
  };
}

describe("migrate", () => {
  it("applies pending migrations in ascending order regardless of input order", async () => {
    const log: number[] = [];
    const db = database();

    const version = await migrate(db, [migration(3, log), migration(1, log), migration(2, log)]);

    expect(log).toEqual([1, 2, 3]);
    expect(version).toBe(3);
    expect(db.version()).toBe(3);
    expect(db.setVersion).toHaveBeenCalledTimes(3);
  });

  it("skips migrations at or below the recorded version", async () => {
    const log: number[] = [];
    const db = database(2);

    const version = await migrate(db, [migration(1, log), migration(2, log), migration(4, log)]);

    expect(log).toEqual([4]);
    expect(version).toBe(4);
  });

  it("is idempotent across repeated runs", async () => {
    const log: number[] = [];
    const db = database();
    const migrations = [migration(1, log), migration(2, log)];

    await migrate(db, migrations);
    await migrate(db, migrations);

    expect(log).toEqual([1, 2]);
  });
});
