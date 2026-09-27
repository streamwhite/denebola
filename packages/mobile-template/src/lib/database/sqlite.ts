import { migrate, type Migration } from "./migrations";

export type SqlParam = string | number | null | Uint8Array;
export type SqlParams = readonly SqlParam[];

export type SqlDatabase = {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlParams): Promise<void>;
  all<T>(sql: string, params?: SqlParams): Promise<T[]>;
  get<T>(sql: string, params?: SqlParams): Promise<T | null>;
};

export type SqlMigration = { version: number; statements: string[] };

// Duck-typed subset of `expo-sqlite`'s SQLiteDatabase (async API), so consumers can pass a
// real database without the framework depending on expo-sqlite.
export type ExpoSqliteDriver = {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlParams): Promise<unknown>;
  getAllAsync<T>(sql: string, params?: SqlParams): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: SqlParams): Promise<T | null>;
};

export const MIGRATIONS_TABLE = "_migrations";

export function createExpoSqliteDatabase(driver: ExpoSqliteDriver): SqlDatabase {
  return {
    exec: (sql) => driver.execAsync(sql),
    run: async (sql, params) => {
      await driver.runAsync(sql, params);
    },
    all: (sql, params) => driver.getAllAsync(sql, params),
    get: (sql, params) => driver.getFirstAsync(sql, params),
  };
}

export function createSqlVersionTracker(database: SqlDatabase, table = MIGRATIONS_TABLE) {
  return {
    async getVersion(): Promise<number> {
      await database.exec(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER NOT NULL)`);
      const row = await database.get<{ version: number }>(`SELECT version FROM ${table} WHERE id = 1`);
      return row?.version ?? 0;
    },
    setVersion: (version: number): Promise<void> =>
      database.run(`INSERT INTO ${table} (id, version) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET version = excluded.version`, [version]),
  };
}

// Applies ordered, statement-based SQL migrations through the generic `migrate` version gate.
export function runSqlMigrations(database: SqlDatabase, migrations: SqlMigration[]): Promise<number> {
  const steps: Migration[] = migrations.map(({ version, statements }) => ({
    version,
    up: async () => {
      for (const statement of statements) await database.exec(statement);
    },
  }));
  return migrate(createSqlVersionTracker(database), steps);
}
