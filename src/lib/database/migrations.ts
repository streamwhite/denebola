export type Migration = { version: number; up: (database: unknown) => Promise<void> };

export async function migrate(database: { getVersion: () => Promise<number>; setVersion: (version: number) => Promise<void> }, migrations: Migration[]) {
  let version = await database.getVersion();
  for (const migration of migrations.sort((left, right) => left.version - right.version)) { if (migration.version <= version) continue; await migration.up(database); await database.setVersion(migration.version); version = migration.version; }
  return version;
}
