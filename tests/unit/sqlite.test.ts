import { describe, expect, it } from "vitest";
import { createExpoSqliteDatabase, runSqlMigrations, type SqlDatabase } from "@/lib/database/sqlite";

function createFakeSqlDatabase() {
  let version = 0;
  const executed: string[] = [];
  const database: SqlDatabase = {
    async exec(sql) {
      executed.push(sql);
    },
    async run(_sql, params) {
      version = Number(params?.[0] ?? version);
    },
    async all<T>() {
      return [] as T[];
    },
    async get<T>() {
      return { version } as T;
    },
  };
  return { database, executed, version: () => version };
}

describe("runSqlMigrations", () => {
  it("runs pending statements and advances the schema version", async () => {
    const fake = createFakeSqlDatabase();

    const version = await runSqlMigrations(fake.database, [
      { version: 1, statements: ["CREATE TABLE notes (id TEXT)"] },
      { version: 2, statements: ["ALTER TABLE notes ADD COLUMN title TEXT"] },
    ]);

    expect(version).toBe(2);
    expect(fake.executed).toContain("CREATE TABLE notes (id TEXT)");
    expect(fake.executed).toContain("ALTER TABLE notes ADD COLUMN title TEXT");
  });

  it("skips migrations at or below the recorded version", async () => {
    const fake = createFakeSqlDatabase();
    await fake.database.run("INSERT INTO _migrations (id, version) VALUES (1, ?)", [2]);

    const version = await runSqlMigrations(fake.database, [{ version: 1, statements: ["CREATE TABLE old (id TEXT)"] }]);

    expect(version).toBe(2);
    expect(fake.executed).not.toContain("CREATE TABLE old (id TEXT)");
  });
});

describe("createExpoSqliteDatabase", () => {
  it("adapts an expo-sqlite style driver", async () => {
    const calls: string[] = [];
    const database = createExpoSqliteDatabase({
      async execAsync(sql) {
        calls.push(sql);
      },
      async runAsync() {
        return undefined;
      },
      async getAllAsync<T>() {
        return [{ id: "1" }] as T[];
      },
      async getFirstAsync<T>() {
        return { id: "1" } as T;
      },
    });

    await database.exec("CREATE TABLE notes (id TEXT)");

    expect(calls).toContain("CREATE TABLE notes (id TEXT)");
    expect(await database.all("SELECT * FROM notes")).toEqual([{ id: "1" }]);
    expect(await database.get("SELECT * FROM notes")).toEqual({ id: "1" });
  });
});
